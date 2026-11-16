import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!;
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;

serve(async (req) => {
  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { items, address, area, city, pincode, deliveryPreference, slot, couponCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
    }

    // Validate items and calculate server-side total from DB
    let subtotal = 0;
    const lineItems = [];
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, name, unit, price, stock, is_active')
        .eq('id', item.product_id)
        .single();
      if (error || !product || !product.is_active) {
        return new Response(JSON.stringify({ error: `Product ${item.product_id} not available` }), { status: 400 });
      }
      const qty = Number(item.quantity);
      if (qty < 1 || qty > 100) {
        return new Response(JSON.stringify({ error: 'Invalid quantity' }), { status: 400 });
      }
      if (product.stock < qty) {
        return new Response(JSON.stringify({ error: `Insufficient stock for ${product.name}` }), { status: 400 });
      }
      subtotal += Number(product.price) * qty;
      lineItems.push({
        product_id: product.id,
        product_name: product.name,
        unit: product.unit,
        unit_price: product.price,
        quantity: qty,
      });
    }

    // Apply coupon server-side
    let discount = 0;
    let finalCouponCode = null;
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();
      if (!couponError && coupon) {
        const now = new Date();
        if (coupon.starts_at && new Date(coupon.starts_at) > now) {
          // coupon not yet started
        } else if (coupon.expires_at && new Date(coupon.expires_at) < now) {
          // expired
        } else if (subtotal < Number(coupon.minimum_order_amount)) {
          // minimum not met
        } else {
          if (coupon.discount_type === 'percent') {
            discount = Math.round((subtotal * Number(coupon.discount_value) / 100) * 100) / 100;
          } else {
            discount = Number(coupon.discount_value);
          }
          if (coupon.max_discount_amount) {
            discount = Math.min(discount, Number(coupon.max_discount_amount));
          }
          discount = Math.min(discount, subtotal);
          finalCouponCode = coupon.code;
        }
      }
    }

    const total = Math.max(0, subtotal - discount);
    if (total < 1) {
      return new Response(JSON.stringify({ error: 'Order total below minimum' }), { status: 400 });
    }

    const amountPaise = Math.round(total * 100);

    // Create Razorpay order
    const razorpayOrder = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `UZ-${Date.now()}`,
        notes: { user_id: user.id },
      }),
    });

    const razorpayData = await razorpayOrder.json();
    if (!razorpayOrder.ok) {
      console.error('Razorpay error:', razorpayData);
      return new Response(JSON.stringify({ error: 'Payment order creation failed' }), { status: 500 });
    }

    // Create order in DB (awaiting payment)
    const orderNumber = `UZ-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8)}`;
    const receiptNumber = `UP-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8)}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        payment_status: 'unpaid',
        payment_method: 'Razorpay test mode',
        subtotal_amount: subtotal,
        discount_amount: discount,
        total_amount: total,
        coupon_code: finalCouponCode,
        address_line: address,
        area: area,
        city: city,
        pincode: pincode,
        delivery_preference: deliveryPreference || '',
        slot: slot || '',
        receipt_number: receiptNumber,
        razorpay_order_id: razorpayData.id,
      })
      .select()
      .single();

    if (orderError) {
      return new Response(JSON.stringify({ error: orderError.message }), { status: 500 });
    }

    // Insert order items
    for (const item of lineItems) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        unit: item.unit,
        unit_price: item.unit_price,
        quantity: item.quantity,
      });
    }

    // Audit log
    await supabase.from('audit_log').insert({
      actor_id: user.id,
      action: 'order_created',
      table_name: 'orders',
      record_id: order.id,
      new_values: { order_number, total_amount: total, payment_status: 'unpaid' },
    });

    return new Response(JSON.stringify({
      order_id: order.id,
      order_number: orderNumber,
      receipt_number: receiptNumber,
      razorpay_order_id: razorpayData.id,
      amount: amountPaise,
      currency: 'INR',
      key: razorpayKeyId,
      subtotal,
      discount,
      total,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
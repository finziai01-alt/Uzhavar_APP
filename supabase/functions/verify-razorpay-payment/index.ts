import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { order_id, payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!order_id || !payment_id) {
      return new Response(JSON.stringify({ error: 'Missing payment references' }), { status: 400 });
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    if (order.payment_status === 'test_verified' || order.payment_status === 'paid') {
      return new Response(JSON.stringify({ error: 'Order already verified' }), { status: 400 });
    }

    // Verify Razorpay signature
    const crypto = await import('https://deno.land/std@0.168.0/crypto/mod.ts');
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(razorpayKeySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const message = `${razorpay_order_id}|${payment_id}`;
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
    const expectedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSig !== razorpay_signature) {
      // Mark order as failed
      await supabase.from('orders').update({
        payment_status: 'failed',
        status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('id', order_id);

      await supabase.from('audit_log').insert({
        actor_id: user.id,
        action: 'payment_verification_failed',
        table_name: 'orders',
        record_id: order_id,
        new_values: { reason: 'invalid_signature' },
      });

      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), { status: 400 });
    }

    // Verify with Razorpay API (server-side confirmation)
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const paymentResp = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
    });
    const paymentData = await paymentResp.json();

    if (!paymentResp.ok || paymentData.status !== 'captured') {
      return new Response(JSON.stringify({ error: 'Payment not captured by Razorpay' }), { status: 400 });
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'test_verified',
        status: 'confirmed',
        razorpay_payment_id: payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .select()
      .single();

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    // Audit log
    await supabase.from('audit_log').insert({
      actor_id: user.id,
      action: 'payment_verified',
      table_name: 'orders',
      record_id: order_id,
      new_values: { payment_status: 'test_verified', razorpay_payment_id: payment_id },
    });

    return new Response(JSON.stringify({
      order_id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      payment_status: updatedOrder.payment_status,
      status: updatedOrder.status,
      total_amount: updatedOrder.total_amount,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
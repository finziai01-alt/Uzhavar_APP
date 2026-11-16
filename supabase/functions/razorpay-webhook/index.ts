import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!;

serve(async (req) => {
  try {
    const signature = req.headers.get('X-Razorpay-Signature')!;
    const body = await req.text();

    // Verify webhook signature
    const crypto = await import('https://deno.land/std@0.168.0/crypto/mod.ts');
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
    const expectedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSig !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event === 'payment.captured' || event === 'order.paid') {
      const razorpayPaymentId = payload.payload.payment.entity.id;
      const razorpayOrderId = payload.payload.payment.entity.order_id;

      // Find order by razorpay_order_id
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (order && order.payment_status !== 'test_verified') {
        await supabase
          .from('orders')
          .update({
            payment_status: 'test_verified',
            status: 'confirmed',
            razorpay_payment_id: razorpayPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        await supabase.from('audit_log').insert({
          actor_id: order.user_id,
          action: 'payment_verified_webhook',
          table_name: 'orders',
          record_id: order.id,
          new_values: { razorpay_payment_id, event },
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
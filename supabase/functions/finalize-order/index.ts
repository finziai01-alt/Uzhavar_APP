import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const { order_id, action } = await req.json(); // action: 'dispatch', 'cancel', 'assign_rider'

    if (!order_id || !action) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    if (order.payment_status !== 'test_verified' && order.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: 'Order not paid' }), { status: 400 });
    }

    let updateData: any = { updated_at: new Date().toISOString() };

    if (action === 'dispatch') {
      updateData.status = 'processing';
    } else if (action === 'cancel') {
      updateData.status = 'cancelled';
      updateData.payment_status = 'refunded';
    } else if (action === 'assign_rider') {
      // rider_id would come from request body
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id)
      .select()
      .single();

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    await supabase.from('audit_log').insert({
      actor_id: user.id,
      action: `order_${action}`,
      table_name: 'orders',
      record_id: order_id,
      new_values: updateData,
    });

    return new Response(JSON.stringify(updatedOrder), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
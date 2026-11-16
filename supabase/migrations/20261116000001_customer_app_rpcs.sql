-- Uzhavan Pay — Additional RPC functions for customer app compatibility
-- Run this in Supabase SQL Editor AFTER the unified_system.sql migration

-- Customer app calls list_active_coupons_v2 — create it as an alias
create or replace function public.list_active_coupons_v2()
returns table (
  code text,
  description text,
  discount_type text,
  discount_value numeric,
  minimum_order_amount numeric,
  starts_at timestamptz,
  expires_at timestamptz,
  available boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    c.code,
    c.description,
    c.discount_type,
    c.discount_value,
    c.minimum_order_amount,
    c.starts_at,
    c.expires_at,
    true as available
  from public.coupons c
  where c.is_active
    and (c.starts_at is null or c.starts_at <= now())
    and (c.expires_at is null or c.expires_at > now())
    and (c.max_uses is null or c.used_count < c.max_uses)
  order by c.expires_at nulls last, c.code;
$$;

grant execute on function public.list_active_coupons_v2() to anon, authenticated;

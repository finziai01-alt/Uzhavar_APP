-- Uzhavan Pay — Unified Shared Schema
-- Apply this to ONE Supabase project shared by all three apps:
--   FreshGrocer Admin Panel (HTML/JS)
--   Uzhavar Customer App (Flutter)
--   SwiftRider Rider App (Flutter)
--
-- Run this in Supabase SQL Editor.
-- Do NOT apply the separate customer/rider migrations to this project.

-- Enable extensions
create extension if not exists pgcrypto;

-- ============================================================
-- 1. PROFILES (shared across all three apps)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin', 'manager', 'operator', 'viewer', 'rider')),
  hub_name text,
  hub_code text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: self read" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: self insert" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles: self update" on public.profiles
  for update to authenticated using (id = auth.uid());
create policy "profiles: admin read all" on public.profiles
  for select to authenticated
  using (exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.role in ('admin', 'manager')));

-- ============================================================
-- 2. CATALOG — PRODUCTS & VARIANTS
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  unit text not null default 'Kg',
  cost_price numeric(12,2) not null default 0,
  price numeric(12,2) not null check (price >= 0),
  promo_price numeric(12,2),
  stock numeric(12,2) not null default 0,
  reorder_threshold numeric(12,2) not null default 0,
  image_url text,
  is_active boolean not null default true,
  is_cold_chain boolean not null default false,
  cold_min_temp numeric(5,2),
  cold_max_temp numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_adjustment numeric(12,2) not null default 0,
  stock_adjustment numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;

create policy "products: public read active" on public.products
  for select to anon, authenticated using (is_active = true);
create policy "products: admin full" on public.products
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')));

create policy "product_variants: public read active" on public.product_variants
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_variants.product_id and p.is_active = true));
create policy "product_variants: admin full" on public.product_variants
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')));

-- ============================================================
-- 3. ORDERS & ORDER ITEMS
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'failed')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'test_verified', 'refunded', 'failed')),
  payment_method text,
  subtotal_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  coupon_code text,
  address_line text,
  area text,
  city text,
  pincode text,
  delivery_preference text default '',
  slot text,
  receipt_number text,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  assigned_rider_id uuid references public.profiles(id),
  zone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity numeric(12,2) not null check (quantity > 0),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "orders: customer read own" on public.orders
  for select to authenticated using (user_id = auth.uid());
create policy "orders: customer insert own" on public.orders
  for insert to authenticated with check (user_id = auth.uid());
create policy "orders: customer update own" on public.orders
  for update to authenticated using (user_id = auth.uid());
create policy "orders: staff read all" on public.orders
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'operator', 'rider')));
create policy "orders: staff update" on public.orders
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'operator', 'rider')));

create policy "order_items: read own order" on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));
create policy "order_items: staff read" on public.order_items
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'operator', 'rider')));

-- ============================================================
-- 4. COUPONS
-- ============================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  max_discount_amount numeric(12,2),
  minimum_order_amount numeric(12,2) not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default false,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
create policy "coupons: public read active" on public.coupons
  for select to anon, authenticated using (is_active = true);
create policy "coupons: admin full" on public.coupons
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')));

-- ============================================================
-- 5. INVENTORY & STOCK LOG
-- ============================================================
create table if not exists public.inventory_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  change_type text not null check (change_type in ('inward', 'outward', 'waste', 'adjustment')),
  quantity numeric(12,2) not null,
  reference_type text,
  reference_id uuid,
  notes text,
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.inventory_log enable row level security;
create policy "inventory_log: staff full" on public.inventory_log
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'operator')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'operator')));

-- ============================================================
-- 6. RIDERS & SHIFTS & TASKS
-- ============================================================
create table if not exists public.rider_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id text not null unique,
  display_name text not null,
  phone text not null,
  vehicle_id text,
  assigned_zone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rider_shifts (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.rider_profiles(id) on delete restrict,
  status text not null default 'off_duty' check (status in ('on_duty', 'on_break', 'ended', 'off_duty')),
  started_at timestamptz,
  ended_at timestamptz,
  total_break_seconds bigint not null default 0,
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.rider_tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text not null unique,
  rider_id uuid references public.rider_profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  status text not null default 'assigned' check (status in ('assigned', 'picked_up', 'in_transit', 'arrived', 'delivered', 'failed', 'returned')),
  priority text not null default 'standard' check (priority in ('standard', 'urgent', 'high')),
  requires_otp boolean not null default true,
  requires_photo boolean not null default true,
  assigned_at timestamptz not null default now(),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rider_profiles enable row level security;
alter table public.rider_shifts enable row level security;
alter table public.rider_tasks enable row level security;

create policy "rider_profiles: staff read" on public.rider_profiles
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'operator', 'rider')));
create policy "rider_profiles: self update" on public.rider_profiles
  for update to authenticated using (id = auth.uid());
create policy "rider_shifts: staff read" on public.rider_shifts
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'operator', 'rider')));
create policy "rider_shifts: rider own" on public.rider_shifts
  for all to authenticated using (rider_id = auth.uid());
create policy "rider_tasks: staff read" on public.rider_tasks
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'operator', 'rider')));
create policy "rider_tasks: rider own" on public.rider_tasks
  for all to authenticated using (rider_id = auth.uid());

-- ============================================================
-- 7. AUDIT LOG
-- ============================================================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;
create policy "audit_log: staff read" on public.audit_log
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'manager')));

-- ============================================================
-- 8. GRANTS
-- ============================================================
grant usage on schema public to anon, authenticated;
grant all on public.profiles, public.products, public.product_variants,
  public.orders, public.order_items, public.coupons,
  public.inventory_log, public.rider_profiles, public.rider_shifts,
  public.rider_tasks, public.audit_log to authenticated;
grant select on public.products, public.coupons to anon;

-- Indexes
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_rider_idx on public.orders(assigned_rider_id);
create index if not exists rider_tasks_rider_idx on public.rider_tasks(rider_id, status);
create index if not exists rider_tasks_order_idx on public.rider_tasks(order_id);

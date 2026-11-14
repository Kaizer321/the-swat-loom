-- The Swat Loom: initial production schema (PKR)
-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  price integer not null check (price >= 0),
  sale_price integer check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  is_new_arrival boolean not null default false,
  description text not null default '',
  long_description text not null default '',
  material text not null default '',
  category text not null default 'Tarkashi',
  gender text,
  image text not null default '',
  images jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

insert into public.categories (name, sort_order) values
  ('Pashmina', 1), ('Tarkashi', 2), ('Woolen', 3), ('Stallers', 4), ('Printed', 5), ('Mens Shawls', 6), ('Kaddi', 7)
on conflict (name) do nothing;

-- Safe upgrades for projects that already created the original products table.
alter table public.products add column if not exists sale_price integer;
alter table public.products add column if not exists is_new_arrival boolean not null default false;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  unique (email, phone)
);

create table if not exists public.orders (
  id text primary key,
  tracking_code text not null unique,
  customer_id uuid references public.customers(id),
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  items jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null check (total >= 0),
  currency text not null default 'PKR' check (currency = 'PKR'),
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Dispatched','Delivered','Cancelled')),
  payment_method text not null default 'COD' check (payment_method in ('COD')),
  payment_status text not null default 'Pending' check (payment_status in ('Pending','Paid','Failed','Refunded')),
  artisan jsonb,
  estimated_delivery timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_phone_idx on public.orders(phone);
create index if not exists orders_tracking_code_idx on public.orders(tracking_code);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  provider text not null default 'COD',
  amount integer not null check (amount >= 0),
  currency text not null default 'PKR' check (currency = 'PKR'),
  status text not null default 'Pending' check (status in ('Pending','Paid','Failed','Refunded')),
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admins are Supabase Auth users explicitly allow-listed here.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- All browser access is blocked. The Express server uses the service-role key
-- after validating Supabase Auth tokens and checking admin_users.
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.categories, public.products, public.customers, public.orders, public.payments, public.admin_users from anon, authenticated;

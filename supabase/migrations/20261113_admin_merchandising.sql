-- The Swat Loom: admin merchandising features
-- Run this once in Supabase Dashboard > SQL Editor.
-- Safe/additive migration: existing products, customers, and orders are preserved.

alter table public.products
  add column if not exists sale_price integer,
  add column if not exists is_new_arrival boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_sale_price_valid'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_sale_price_valid
      check (sale_price is null or (sale_price >= 0 and sale_price < price));
  end if;
end $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

insert into public.categories (name, sort_order) values
  ('Pashmina', 1),
  ('Tarkashi', 2),
  ('Woolen', 3),
  ('Stallers', 4),
  ('Printed', 5),
  ('Mens Shawls', 6),
  ('Kaddi', 7)
on conflict (name) do nothing;

alter table public.categories enable row level security;
revoke all on public.categories from anon, authenticated;

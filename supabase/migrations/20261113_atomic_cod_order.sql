-- The Swat Loom: atomic Cash-on-Delivery order creation.
-- Run this migration in Supabase SQL Editor before deploying the matching server code.
-- The function inserts the order and its COD payment in one database transaction.

create or replace function public.create_cod_order_atomic(p_order jsonb)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_quantity integer;
begin
  insert into public.orders
  select (jsonb_populate_record(null::public.orders, p_order)).*
  returning * into v_order;

  -- Stock value 0 means unlimited/not tracked. Positive stock is decremented
  -- atomically; a concurrent checkout cannot oversell the remaining quantity.
  for v_item in select value from jsonb_array_elements(v_order.items)
  loop
    v_quantity := greatest(1, least(20, coalesce((v_item ->> 'quantity')::integer, 1)));
    update public.products
       set stock = case when stock > 0 then stock - v_quantity else 0 end,
           updated_at = now()
     where id = v_item ->> 'id'
       and is_active = true
       and (stock = 0 or stock >= v_quantity);
    if not found then
      raise exception 'Insufficient stock for product %', coalesce(v_item ->> 'name', v_item ->> 'id');
    end if;
  end loop;

  insert into public.payments (order_id, provider, amount, currency, status)
  values (v_order.id, 'COD', v_order.total, 'PKR', 'Pending');

  return v_order;
end;
$$;

revoke all on function public.create_cod_order_atomic(jsonb) from public;
revoke all on function public.create_cod_order_atomic(jsonb) from anon, authenticated;
grant execute on function public.create_cod_order_atomic(jsonb) to service_role;

-- Public read-only bucket for storefront product images. Uploads are performed
-- by the authenticated Express server using the service-role key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

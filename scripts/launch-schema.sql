create schema if not exists vent_private;
revoke all on schema vent_private from public, anon, authenticated;
grant usage on schema vent_private to service_role;
create table if not exists vent_private.request_buckets(scope text not null, bucket text not null, window_start timestamptz not null, hits integer not null default 0, primary key(scope,bucket,window_start));
alter table vent_private.request_buckets enable row level security;
grant all on vent_private.request_buckets to service_role;
create table if not exists vent_private.procurement(sku text primary key, purchase_net numeric not null check(purchase_net>=0), landed_net numeric not null check(landed_net>=0), sale_net numeric not null check(sale_net>0), stock_quantity numeric not null check(stock_quantity>=0), lead_days integer not null check(lead_days>=0), supplier_reference text not null, specification_url text not null, carrier_reference text not null, reviewed_by uuid not null, reviewed_at timestamptz not null default now());
alter table vent_private.procurement enable row level security;
grant all on vent_private.procurement to service_role;
create or replace function public.vent_consume_quota(p_scope text,p_bucket text,p_limit integer,p_seconds integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare w timestamptz; n integer;
begin
 if auth.role()<>'service_role' or p_limit<1 or p_seconds<1 then raise exception 'forbidden'; end if;
 w:=to_timestamp(floor(extract(epoch from now())/p_seconds)*p_seconds);
 insert into vent_private.request_buckets values(p_scope,p_bucket,w,1) on conflict(scope,bucket,window_start) do update set hits=vent_private.request_buckets.hits+1 returning hits into n;
 return n<=p_limit;
end $$;
revoke all on function public.vent_consume_quota(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.vent_consume_quota(text,text,integer,integer) to service_role;
create or replace function public.vent_finalize_quote(p_order uuid,p_admin uuid,p_quote jsonb,p_items jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare o public.orders; x jsonb; subtotal numeric:=0; freight numeric; meta jsonb;
begin
 if auth.role()<>'service_role' or not exists(select 1 from public.site_admins where user_id=p_admin) then raise exception 'forbidden'; end if;
 select * into o from public.orders where id=p_order for update;
 if o.id is null or o.status<>'request_received' then raise exception 'order_not_editable'; end if;
 if jsonb_array_length(p_items)<>(select count(*) from public.order_items where order_id=p_order) then raise exception 'all_items_required'; end if;
 for x in select * from jsonb_array_elements(p_items) loop
  if (x->>'unit_price_eur')::numeric<=0 or (x->>'qty')::numeric<=0 or not exists(select 1 from public.order_items where id=(x->>'id')::uuid and order_id=p_order) then raise exception 'invalid_item'; end if;
  update public.order_items set unit_price_eur=round((x->>'unit_price_eur')::numeric,2),qty=(x->>'qty')::numeric,line_total_eur=round(round((x->>'unit_price_eur')::numeric,2)*(x->>'qty')::numeric,2) where id=(x->>'id')::uuid and order_id=p_order;
 end loop;
 select sum(line_total_eur) into subtotal from public.order_items where order_id=p_order;
 freight:=round((p_quote->>'shipping_eur')::numeric,2);if freight<0 then raise exception 'invalid_freight'; end if;
 meta:=coalesce(o.metadata,'{}')||jsonb_build_object('quote',p_quote,'tax_status','confirmed','tax_note',p_quote->>'tax_note','confirmed_lead_time',p_quote->>'lead_time','quote_confirmed_by',p_admin,'quote_confirmed_at',now());
 update public.orders set subtotal_eur=subtotal,shipping_eur=freight,total_eur=subtotal+freight,metadata=meta,updated_at=now() where id=p_order;
 return jsonb_build_object('order_no',o.order_no,'total_eur',subtotal+freight);
end $$;
revoke all on function public.vent_finalize_quote(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.vent_finalize_quote(uuid,uuid,jsonb,jsonb) to service_role;
create or replace function public.vent_procurement(p_row jsonb,p_admin uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if auth.role()<>'service_role' or not exists(select 1 from public.site_admins where user_id=p_admin) then raise exception 'forbidden'; end if;
 if p_row is null then return (select coalesce(jsonb_agg(to_jsonb(p)),'[]') from vent_private.procurement p); end if;
 if length(p_row->>'supplier_reference')<3 or length(p_row->>'carrier_reference')<3 or (p_row->>'specification_url')!~'^https://' then raise exception 'evidence_required'; end if;
 insert into vent_private.procurement(sku,purchase_net,landed_net,sale_net,stock_quantity,lead_days,supplier_reference,specification_url,carrier_reference,reviewed_by)
 values(p_row->>'sku',(p_row->>'purchase_net')::numeric,(p_row->>'landed_net')::numeric,(p_row->>'sale_net')::numeric,(p_row->>'stock_quantity')::numeric,(p_row->>'lead_days')::integer,p_row->>'supplier_reference',p_row->>'specification_url',p_row->>'carrier_reference',p_admin)
 on conflict(sku) do update set purchase_net=excluded.purchase_net,landed_net=excluded.landed_net,sale_net=excluded.sale_net,stock_quantity=excluded.stock_quantity,lead_days=excluded.lead_days,supplier_reference=excluded.supplier_reference,specification_url=excluded.specification_url,carrier_reference=excluded.carrier_reference,reviewed_by=p_admin,reviewed_at=now();
 return jsonb_build_object('saved',true);
end $$;
revoke all on function public.vent_procurement(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.vent_procurement(jsonb,uuid) to service_role;
create or replace function public.vent_accept_quote(p_order uuid,p_hash text,p_version text) returns boolean language plpgsql security invoker set search_path='' as $$
declare o public.orders;
begin
 if auth.role()<>'service_role' then raise exception 'forbidden'; end if;
 select * into o from public.orders where id=p_order for update;
 if o.status<>'request_received' or o.metadata->'quote'->>'token_hash'<>p_hash or o.metadata->'quote'->>'version'<>p_version or (o.metadata->'quote'->>'expires_at')::timestamptz<now() then return false; end if;
 update public.orders set metadata=jsonb_set(metadata,'{quote,accepted_at}',to_jsonb(now())),updated_at=now() where id=p_order;
 return true;
end $$;
revoke all on function public.vent_accept_quote(uuid,text,text) from public,anon,authenticated;
grant execute on function public.vent_accept_quote(uuid,text,text) to service_role;

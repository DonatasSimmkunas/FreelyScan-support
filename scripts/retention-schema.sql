create index if not exists vent_bucket_expiry on vent_private.request_buckets(window_start);
create or replace function public.vent_consume_quota(p_scope text,p_bucket text,p_limit integer,p_seconds integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare w timestamptz; n integer;
begin
 if auth.role()<>'service_role' or p_limit<1 or p_seconds<1 then raise exception 'forbidden'; end if;
 delete from vent_private.request_buckets where window_start<now()-interval '2 days';
 delete from public.client_events where created_at<now()-interval '90 days';
 w:=to_timestamp(floor(extract(epoch from now())/p_seconds)*p_seconds);
 insert into vent_private.request_buckets values(p_scope,p_bucket,w,1) on conflict(scope,bucket,window_start) do update set hits=vent_private.request_buckets.hits+1 returning hits into n;
 return n<=p_limit;
end $$;
revoke all on function public.vent_consume_quota(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.vent_consume_quota(text,text,integer,integer) to service_role;

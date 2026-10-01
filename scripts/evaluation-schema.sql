create table if not exists vent_private.evaluations(token_hash text primary key,image_hash text not null,expires_at timestamptz not null,used_at timestamptz);
alter table vent_private.evaluations enable row level security;
grant all on vent_private.evaluations to service_role;
create or replace function public.vent_use_evaluation(p_token_hash text,p_image_hash text) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 if auth.role()<>'service_role' then raise exception 'forbidden'; end if;
 update vent_private.evaluations set used_at=now() where token_hash=p_token_hash and image_hash=p_image_hash and expires_at>now() and used_at is null;
 get diagnostics n=row_count;return n=1;
end $$;
revoke all on function public.vent_use_evaluation(text,text) from public,anon,authenticated;
grant execute on function public.vent_use_evaluation(text,text) to service_role;

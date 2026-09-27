begin;
create table if not exists public.vip_crawler_companies (
  id text primary key, company_code text unique, provider text not null,
  legal_form text not null default '', city_area text not null default '', address text not null default '',
  profile_url text not null default '', source_url text not null default '', source_id text not null,
  company_phone text not null default '', company_email text not null default '', registered_at date,
  first_seen timestamptz not null default now(), last_seen timestamptz not null default now()
);
create table if not exists public.vip_crawler_jobs (
  id text primary key, company_id text not null references public.vip_crawler_companies(id),
  source_id text not null, source_job_id text not null, title text not null, city_area text not null default '',
  url text not null default '', status text not null default 'unknown' check(status in ('open','closed','unknown')),
  published_at timestamptz, expires_at timestamptz, source_updated_at timestamptz,
  first_seen timestamptz not null default now(), last_seen timestamptz not null default now(),
  unique(source_id,source_job_id)
);
create index if not exists vip_crawler_jobs_company_idx on public.vip_crawler_jobs(company_id,status,expires_at);
create index if not exists vip_crawler_companies_new_idx on public.vip_crawler_companies(first_seen desc,id);
create index if not exists vip_crawler_companies_name_idx on public.vip_crawler_companies(provider,id);
create index if not exists vip_crawler_companies_filters_idx on public.vip_crawler_companies(legal_form,city_area);
create table if not exists public.vip_crawler_sources (
  id text primary key, name text not null, status text not null default 'idle', cursor jsonb,
  last_checked timestamptz, source_updated_at timestamptz, last_success timestamptz,
  error text, warnings jsonb not null default '[]'::jsonb, companies_seen integer not null default 0,
  jobs_seen integer not null default 0, cycles_completed integer not null default 0
);
create table if not exists public.vip_crawler_runs (
  id uuid primary key, started_at timestamptz not null, finished_at timestamptz,
  status text not null default 'running', new_companies integer not null default 0,
  companies_seen integer not null default 0, jobs_seen integer not null default 0,
  summary jsonb not null default '[]'::jsonb
);
create table if not exists public.vip_crawler_control (
  id integer primary key check(id=1), lease_owner uuid, lease_until timestamptz not null default 'epoch',
  last_started_at timestamptz, last_finished_at timestamptz, next_run_at timestamptz,
  schedule_label text not null default 'Kas 6 valandas; po vieną šaltinių porciją'
);
insert into public.vip_crawler_control(id) values(1) on conflict(id) do nothing;
insert into public.vip_crawler_sources(id,name) values
 ('rc_registry','Registrų centro atviri juridinių asmenų duomenys'),
 ('uzt_vacancies','Užimtumo tarnybos atviri darbo pasiūlymai'),
 ('company_careers','Įmonių vieši karjeros puslapiai') on conflict(id) do nothing;

-- One source batch commits records and its cursor atomically. No existing catalog is modified.
create or replace function public.vip_crawler_ingest(p_source text,p_companies jsonb,p_jobs jsonb,p_cursor jsonb,p_updated timestamptz,p_fetched timestamptz,p_warnings jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare c jsonb; j jsonb; code text; n integer:=0; seen integer:=0; job_count integer:=0;
begin
 if p_source not in ('rc_registry','uzt_vacancies','company_careers') or jsonb_array_length(p_companies)>250 or jsonb_array_length(p_jobs)>250 then raise exception 'Invalid batch'; end if;
 for c in select value from jsonb_array_elements(p_companies) loop
  code:=c->>'id';
  if code is null or code !~ '^[a-zA-Z0-9_:-]{5,128}$' or coalesce(c->>'provider','')='' then continue; end if;
  if not exists(select 1 from public.vip_crawler_companies where id=code) then n:=n+1; end if;
  insert into public.vip_crawler_companies(id,company_code,provider,legal_form,city_area,address,profile_url,source_url,source_id,company_phone,company_email,registered_at,last_seen)
  values(code,nullif(c->>'company_code',''),c->>'provider',coalesce(c->>'legal_form',''),coalesce(c->>'city_area',''),coalesce(c->>'address',''),coalesce(c->>'profile_url',''),coalesce(c->>'source_url',''),p_source,coalesce(c->>'company_phone',''),coalesce(c->>'company_email',''),nullif(c->>'registered_at','')::date,p_fetched)
  on conflict(id) do update set
   provider=excluded.provider,
   legal_form=coalesce(nullif(excluded.legal_form,''),vip_crawler_companies.legal_form),
   city_area=coalesce(nullif(excluded.city_area,''),vip_crawler_companies.city_area),
   address=coalesce(nullif(excluded.address,''),vip_crawler_companies.address),
   profile_url=coalesce(nullif(excluded.profile_url,''),vip_crawler_companies.profile_url),
   source_url=case when excluded.source_id='rc_registry' or vip_crawler_companies.source_url='' then excluded.source_url else vip_crawler_companies.source_url end,
   source_id=case when excluded.source_id='rc_registry' then excluded.source_id else vip_crawler_companies.source_id end,
   company_phone=coalesce(nullif(excluded.company_phone,''),vip_crawler_companies.company_phone),
   company_email=coalesce(nullif(excluded.company_email,''),vip_crawler_companies.company_email),
   registered_at=coalesce(excluded.registered_at,vip_crawler_companies.registered_at),last_seen=excluded.last_seen;
  seen:=seen+1;
 end loop;
 for j in select value from jsonb_array_elements(p_jobs) loop
  code:=j->>'company_id';
  if not exists(select 1 from public.vip_crawler_companies where id=code) or coalesce(j->>'source_job_id','')='' then continue; end if;
  insert into public.vip_crawler_jobs(id,company_id,source_id,source_job_id,title,city_area,url,status,published_at,expires_at,source_updated_at,last_seen)
  values(p_source||':'||(j->>'source_job_id'),code,p_source,j->>'source_job_id',coalesce(j->>'title',''),coalesce(j->>'city_area',''),coalesce(j->>'url',''),coalesce(j->>'status','unknown'),nullif(j->>'published_at','')::timestamptz,nullif(j->>'expires_at','')::timestamptz,nullif(j->>'source_updated_at','')::timestamptz,p_fetched)
  on conflict(id) do update set company_id=excluded.company_id,title=excluded.title,city_area=excluded.city_area,url=excluded.url,status=excluded.status,published_at=excluded.published_at,expires_at=excluded.expires_at,source_updated_at=excluded.source_updated_at,last_seen=excluded.last_seen;
  job_count:=job_count+1;
 end loop;
 update public.vip_crawler_sources set cursor=p_cursor,status='ok',last_checked=p_fetched,last_success=p_fetched,source_updated_at=coalesce(p_updated,source_updated_at),error=null,warnings=coalesce(p_warnings,'[]'::jsonb),companies_seen=companies_seen+seen,jobs_seen=jobs_seen+job_count,cycles_completed=cycles_completed+case when p_cursor is null or p_cursor='null'::jsonb then 1 else 0 end where id=p_source;
 return jsonb_build_object('newCompanies',n,'companiesSeen',seen,'jobsSeen',job_count);
end $$;

create or replace function public.vip_crawler_status() returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object(
  'totalCompanies',(select count(*) from public.vip_crawler_companies),
  'contactCompanies',(select count(*) from public.vip_crawler_companies where btrim(company_phone)<>'' or btrim(company_email)<>''),
  'hiringCompanies',(select count(distinct company_id) from public.vip_crawler_jobs where status='open' and last_seen>=now()-interval '48 hours' and (expires_at is null or expires_at>=now())),
  'totalJobs',(select count(*) from public.vip_crawler_jobs where status='open' and last_seen>=now()-interval '48 hours' and (expires_at is null or expires_at>=now())),
  'newLastRun',coalesce((select new_companies from public.vip_crawler_runs where finished_at is not null order by started_at desc limit 1),0),
  'lastRun',(select finished_at from public.vip_crawler_runs where finished_at is not null order by started_at desc limit 1),
  'lastRunSummary',(select jsonb_build_object('status',status,'sources',summary) from public.vip_crawler_runs where finished_at is not null order by started_at desc limit 1),
  'nextRun',c.next_run_at,'scheduleLabel',c.schedule_label,'running',c.lease_until>now(),
  'cooldownUntil',case when c.last_started_at+interval '60 seconds'>now() then c.last_started_at+interval '60 seconds' else null end,
  'sources',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'status',s.status,'lastChecked',s.last_checked,'sourceUpdatedAt',s.source_updated_at,'error',s.error,'warnings',s.warnings,'cyclesCompleted',s.cycles_completed) order by s.id) from public.vip_crawler_sources s),'[]'::jsonb)
 ) from public.vip_crawler_control c where id=1;
$$;

create or replace function public.vip_crawler_search(p_q text default '',p_kind text default 'all',p_legal_form text default '',p_city text default '',p_page integer default 1,p_page_size integer default 25,p_sort text default 'newest')
returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
 with candidates as (
  select c.* from public.vip_crawler_companies c where
   (p_q='' or strpos(lower(concat_ws(' ',c.company_code,c.provider,c.legal_form,c.city_area,c.address,c.company_phone,c.company_email)),lower(left(p_q,200)))>0
    or exists(select 1 from public.vip_crawler_jobs j where j.company_id=c.id and j.status='open' and j.last_seen>=now()-interval '48 hours' and (j.expires_at is null or j.expires_at>=now()) and strpos(lower(j.title),lower(left(p_q,200)))>0))
   and (p_kind<>'hiring' or exists(select 1 from public.vip_crawler_jobs j where j.company_id=c.id and j.status='open' and j.last_seen>=now()-interval '48 hours' and (j.expires_at is null or j.expires_at>=now())))
   and (p_legal_form='' or c.legal_form=p_legal_form)
 ), filtered as (select * from candidates where p_city='' or city_area=p_city), counts as (select count(*) as total,case when p_page_size=50 then 50 else 25 end as size from filtered),
 paging as (select total,size,greatest(1,ceil(total::numeric/size)::integer) as pages,greatest(1,least(coalesce(p_page,1),greatest(1,ceil(total::numeric/size)::integer))) as page from counts),
 selected as (select f.* from filtered f order by case when p_sort='name' then f.provider end asc,case when p_sort<>'name' then f.first_seen end desc,f.id limit (select size from paging) offset (select (page-1)*size from paging))
 select jsonb_build_object('total',p.total,'page',p.page,'pages',p.pages,'pageSize',p.size,
  'records',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('jobs',coalesce((select jsonb_agg(jsonb_build_object('id',j.id,'title',j.title,'city_area',j.city_area,'url',j.url,'status',j.status,'published_at',j.published_at,'expires_at',j.expires_at,'source_id',j.source_id) order by j.published_at desc nulls last,j.id) from public.vip_crawler_jobs j where j.company_id=c.id and j.status='open' and j.last_seen>=now()-interval '48 hours' and (j.expires_at is null or j.expires_at>=now())),'[]'::jsonb))) from selected c),'[]'::jsonb),
  'cities',coalesce((select jsonb_agg(city_area order by city_area) from (select distinct city_area from candidates where city_area<>'' order by city_area limit 1000) x),'[]'::jsonb),
  'legalForms',coalesce((select jsonb_agg(legal_form order by legal_form) from (select distinct legal_form from public.vip_crawler_companies where legal_form<>'' limit 500) x),'[]'::jsonb)
 ) from paging p;
$$;

alter table public.vip_crawler_companies enable row level security;
alter table public.vip_crawler_jobs enable row level security;
alter table public.vip_crawler_sources enable row level security;
alter table public.vip_crawler_runs enable row level security;
alter table public.vip_crawler_control enable row level security;
revoke all on public.vip_crawler_companies,public.vip_crawler_jobs,public.vip_crawler_sources,public.vip_crawler_runs,public.vip_crawler_control from public,anon,authenticated;
grant select,insert,update,delete on public.vip_crawler_companies,public.vip_crawler_jobs,public.vip_crawler_sources,public.vip_crawler_runs,public.vip_crawler_control to service_role;
revoke all on function public.vip_crawler_ingest(text,jsonb,jsonb,jsonb,timestamptz,timestamptz,jsonb),public.vip_crawler_status(),public.vip_crawler_search(text,text,text,text,integer,integer,text) from public,anon,authenticated;
grant execute on function public.vip_crawler_ingest(text,jsonb,jsonb,jsonb,timestamptz,timestamptz,jsonb),public.vip_crawler_status(),public.vip_crawler_search(text,text,text,text,integer,integer,text) to service_role;
commit;

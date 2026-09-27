-- Adds authenticated discovery history and company-card provenance to existing VIP RPCs.
-- Existing RLS and function grants are retained by CREATE OR REPLACE.
begin;
create index if not exists vip_crawler_jobs_new_idx on public.vip_crawler_jobs(first_seen desc,id);

create or replace function public.vip_crawler_status() returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object(
  'totalCompanies',(select count(*) from public.vip_crawler_companies),
  'contactCompanies',(select count(*) from public.vip_crawler_companies where btrim(company_phone)<>'' or btrim(company_email)<>''),
  'hiringCompanies',(select count(distinct company_id) from public.vip_crawler_jobs where status='open' and last_seen>=now()-interval '48 hours' and (expires_at is null or expires_at>=now())),
  'totalJobs',(select count(*) from public.vip_crawler_jobs where status='open' and last_seen>=now()-interval '48 hours' and (expires_at is null or expires_at>=now())),
  'recentDiscoveries',coalesce((select jsonb_agg(event order by seen desc,event_id) from (
   (select c.first_seen as seen,'company:'||c.id as event_id,jsonb_build_object('id','company:'||c.id,'kind','company','companyId',c.id,'provider',c.provider,'title',c.provider,'city',c.city_area,'url',c.source_url,'sourceId',c.source_id,'firstSeen',c.first_seen) as event from public.vip_crawler_companies c order by c.first_seen desc,c.id limit 12)
   union all
   (select j.first_seen as seen,'job:'||j.id as event_id,jsonb_build_object('id','job:'||j.id,'kind','job','companyId',j.company_id,'provider',c.provider,'title',j.title,'city',j.city_area,'url',j.url,'sourceId',j.source_id,'firstSeen',j.first_seen) as event from public.vip_crawler_jobs j join public.vip_crawler_companies c on c.id=j.company_id where j.status='open' and j.last_seen>=now()-interval '48 hours' and (j.expires_at is null or j.expires_at>=now()) order by j.first_seen desc,j.id limit 12)
  ) recent),'[]'::jsonb),
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
 ), filtered as (select * from candidates where p_city='' or exists(select 1 from regexp_split_to_table(city_area,'[;/]') as place where btrim(place)=p_city)), counts as (select count(*) as total,case when p_page_size=50 then 50 else 25 end as size from filtered),
 paging as (select total,size,greatest(1,ceil(total::numeric/size)::integer) as pages,greatest(1,least(coalesce(p_page,1),greatest(1,ceil(total::numeric/size)::integer))) as page from counts),
 selected as (select f.* from filtered f order by case when p_sort='name' then f.provider end asc,case when p_sort<>'name' then f.first_seen end desc,f.id limit (select size from paging) offset (select (page-1)*size from paging))
 select jsonb_build_object('total',p.total,'page',p.page,'pages',p.pages,'pageSize',p.size,
  'records',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('category','Kita','jobs',coalesce((select jsonb_agg(jsonb_build_object('id',j.id,'title',j.title,'city_area',j.city_area,'url',j.url,'status',j.status,'published_at',j.published_at,'expires_at',j.expires_at,'source_id',j.source_id,'first_seen',j.first_seen,'last_seen',j.last_seen) order by j.published_at desc nulls last,j.id) from public.vip_crawler_jobs j where j.company_id=c.id and j.status='open' and j.last_seen>=now()-interval '48 hours' and (j.expires_at is null or j.expires_at>=now())),'[]'::jsonb))) from selected c),'[]'::jsonb),
  'cities',coalesce((select jsonb_agg(city_area order by city_area) from (select distinct btrim(place) as city_area from candidates cross join lateral regexp_split_to_table(city_area,'[;/]') as place where btrim(place)<>'' order by city_area limit 1000) x),'[]'::jsonb),
  'legalForms',coalesce((select jsonb_agg(legal_form order by legal_form) from (select distinct legal_form from public.vip_crawler_companies where legal_form<>'' limit 500) x),'[]'::jsonb)
 ) from paging p;
$$;

commit;

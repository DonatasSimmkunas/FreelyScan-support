-- Apply before publishing the independent-source Edge collector.
-- Retired feeds keep their saved records/cursors but disappear from active status.
begin;
alter table public.vip_crawler_sources add column if not exists retry_after timestamptz;
update public.vip_crawler_sources set status='removed',error='Šaltinis pašalintas iš aktyvaus rinkimo: prieiga negalima.',warnings='[]'::jsonb
 where id in ('rc_registry','uzt_vacancies');
insert into public.vip_crawler_sources(id,name) values
 ('company_careers','Oxylabs ir Hostinger karjeros puslapiai'),
 ('careers_cybercare','CyberCare — karjeros puslapis'),
 ('careers_sintra','Sintra — karjeros puslapis'),
 ('careers_tesonet_global','Tesonet Global — karjeros puslapis'),
 ('careers_surfshark','Surfshark — karjeros puslapis'),
 ('careers_nord_security','Nord Security — karjeros puslapis'),
 ('careers_omnisend','Omnisend — karjeros puslapis') on conflict(id) do nothing;

create or replace function public.vip_crawler_ingest(p_source text,p_companies jsonb,p_jobs jsonb,p_cursor jsonb,p_updated timestamptz,p_fetched timestamptz,p_warnings jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare c jsonb; j jsonb; code text; n integer:=0; seen integer:=0; job_count integer:=0;
begin
 if not exists(select 1 from public.vip_crawler_sources where id=p_source and status not in ('blocked','removed')) or jsonb_array_length(p_companies)>250 or jsonb_array_length(p_jobs)>250 then raise exception 'Invalid batch'; end if;
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
 update public.vip_crawler_sources set cursor=p_cursor,status='ok',retry_after=null,last_checked=p_fetched,last_success=p_fetched,source_updated_at=coalesce(p_updated,source_updated_at),error=null,warnings=coalesce(p_warnings,'[]'::jsonb),companies_seen=companies_seen+seen,jobs_seen=jobs_seen+job_count,cycles_completed=cycles_completed+case when p_cursor is null or p_cursor='null'::jsonb then 1 else 0 end where id=p_source;
 return jsonb_build_object('newCompanies',n,'companiesSeen',seen,'jobsSeen',job_count);
end $$;

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
  'sources',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'status',s.status,'lastChecked',s.last_checked,'sourceUpdatedAt',s.source_updated_at,'error',s.error,'warnings',s.warnings,'cyclesCompleted',s.cycles_completed,'retryAfter',s.retry_after) order by s.id) from public.vip_crawler_sources s where s.status<>'removed'),'[]'::jsonb)
 ) from public.vip_crawler_control c where id=1;
$$;

commit;

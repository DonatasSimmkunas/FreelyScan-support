-- Run after deploying the quarter-hour Edge scheduler. Alter the existing job only.
-- Its authenticated command and Vault token remain unchanged.
begin;
do $migration$
declare crawler_job_id bigint;
begin
 select jobid into strict crawler_job_id from cron.job where jobname='auctioneer-vip-crawler';
 perform cron.alter_job(job_id:=crawler_job_id,schedule:='*/15 * * * *',active:=true);
end $migration$;
alter table public.vip_crawler_control alter column schedule_label set default 'Kas 15 minučių, visą parą';
update public.vip_crawler_control
 set next_run_at=to_timestamp((floor(extract(epoch from now())/900)+1)*900),
     schedule_label='Kas 15 minučių, visą parą'
 where id=1;
commit;

-- Run only after schema + Edge deployment and secure Vault token provisioning.
-- pg_cron / pg_net are database extensions; create pg_net in extensions schema.
select cron.schedule('auctioneer-vip-crawler','0 */6 * * *',$job$
 select net.http_post(
  url:='https://hvsbczirrxzzhuxlsbwe.supabase.co/functions/v1/auctioneer-vip-crawler',
  headers:=jsonb_build_object('Content-Type','application/json','X-VIP-Crawler-Token',
    (select decrypted_secret from vault.decrypted_secrets where name='auctioneer_vip_crawler_token')),
  body:='{"action":"run"}'::jsonb,
  timeout_milliseconds:=100000
 );
$job$);

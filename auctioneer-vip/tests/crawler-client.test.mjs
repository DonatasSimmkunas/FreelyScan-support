import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrawlerClient} from '../lib/crawler-client.mjs';
const env={VIP_CRAWLER_URL:'https://example.supabase.co/functions/v1/auctioneer-vip-crawler',VIP_CRAWLER_KEY:'a'.repeat(64)};
test('crawler proxy keeps credentials server-side, bounds search and ignores injected destinations',async()=>{
  let seen;
  const client=createCrawlerClient(env,async(url,options)=>{seen={url,options};return new Response(JSON.stringify({records:[],total:0}),{status:200});});
  const result=await client.request('search',{url:'https://evil.invalid',action:'run',q:'x'.repeat(900),page:-10,pageSize:999,kind:'all',legalForm:'MB',sort:'unknown'});
  assert.equal(seen.url,env.VIP_CRAWLER_URL);assert.equal(seen.options.redirect,'error');
  assert.equal(seen.options.headers['X-VIP-Crawler-Token'],env.VIP_CRAWLER_KEY);
  const body=JSON.parse(seen.options.body);assert.equal(body.action,'search');assert.equal(body.q.length,300);assert.equal(body.page,1);assert.equal(body.pageSize,25);assert.equal(body.sort,'newest');assert.ok(!('url' in body));
  assert.equal(result.status,200);assert.ok(!JSON.stringify(result).includes(env.VIP_CRAWLER_KEY));
});
test('crawler proxy fails closed and does not expose provider errors',async()=>{
  let called=false;
  const bad=createCrawlerClient({...env,VIP_CRAWLER_URL:'http://127.0.0.1/private'},async()=>{called=true;});
  assert.equal((await bad.request('status')).status,503);assert.equal(called,false);
  const client=createCrawlerClient(env,async()=>new Response('secret database detail',{status:500}));
  const result=await client.request('status');assert.equal(result.status,502);assert.ok(!JSON.stringify(result).includes('secret database detail'));
  assert.equal((await client.request('unknown')).status,400);
});

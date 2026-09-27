import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {createVipHandler} from './lib/handler.mjs';

export function createVipServer(handleVip){
  const server=createServer(async(req,res)=>{
    try{
      // This health endpoint belongs only to the separate VIP backend.
      if(['GET','HEAD'].includes(req.method)&&req.url.split('?')[0]==='/healthz'){
        res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
        res.end(req.method==='HEAD'?undefined:JSON.stringify({ok:true}));return;
      }
      if(await handleVip(req,res))return;
      // Integrate handleVip before the existing site's route/static handler.
      res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff'});
      res.end('Nerasta.');
    }catch{
      // Do not let a rejected request terminate the process or disclose internals.
      if(res.destroyed||res.writableEnded)return;
      if(res.headersSent){res.destroy();return;}
      res.writeHead(500,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      res.end(req.method==='HEAD'?undefined:JSON.stringify({error:'Užklausa nepavyko.'}));
    }
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  return server;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const server=createVipServer(await createVipHandler());
  server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('VIP modulis paleistas.'));
}

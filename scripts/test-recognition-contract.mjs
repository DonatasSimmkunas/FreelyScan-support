import fs from 'node:fs';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import assert from 'node:assert/strict';
let source=fs.readFileSync('supabase/functions/recognize-vent-plan/index.ts','utf8').replace(/^import .*;\n/gm,'');
let handler, draft;
const context={Deno:{serve(fn){handler=fn},env:{get(){return 'test'}}},createClient(){return{auth:{async getUser(){return{data:{user:{id:'test'}},error:null}}}}},fetch:async()=>({ok:true,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify(draft)}]}]})}),Request,Response,Headers,AbortController,setTimeout,clearTimeout,console};
vm.runInNewContext(stripTypeScriptTypes(source),context);
async function invoke(){return handler(new Request('https://example.test',{method:'POST',headers:{origin:'https://vent-it-com.onrender.com',authorization:'Bearer test','content-type':'application/json'},body:JSON.stringify({image:'data:image/jpeg;base64,/9j/'})}));}
const room=(name,x,y,areaM2)=>({name,type:'bedroom',x,y,w:100,h:100,polygon:[{x,y},{x:x+100,y},{x:x+100,y:y+100},{x,y:y+100}],areaM2});
draft={expectedRoomCount:3,rooms:[room('One',100,100,12),room('Two',160,100,null)],unit:{x:900,y:90},uncertainties:[]};
let response=await invoke(),data=await response.json();assert.equal(response.status,200);assert.deepEqual(Array.from(data.quality).sort(),['overlapping_rooms','room_count_mismatch','unverified_area']);assert.equal(data.rooms.length,2);
draft={expectedRoomCount:0,rooms:[],unit:{x:900,y:90},uncertainties:['Two floors ambiguous']};response=await invoke();data=await response.json();assert.equal(response.status,422);assert.equal(data.uncertainties[0],'Two floors ambiguous');
console.log('Edge response contract: overlap, missing count, unreadable area, ambiguous plan PASS');

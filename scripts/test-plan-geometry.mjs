import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={};vm.runInNewContext(fs.readFileSync('plan-geometry.js','utf8'),ctx);
const g=ctx.VentPlanGeometry;
const room={x:50,y:50,w:200,h:200,polygon:[{x:50,y:50},{x:250,y:50},{x:250,y:120},{x:120,y:120},{x:120,y:250},{x:50,y:250}]};
assert(!g.inside({x:200,y:200},room.polygon));
assert(g.inside(g.roomPoint(room,{x:200,y:200}),room.polygon));
const pixels=new Uint8ClampedArray(400*400*4).fill(255);
for(let y=40;y<=260;y++)for(let x=47;x<=51;x++){const k=(y*400+x)*4;pixels[k]=pixels[k+1]=pixels[k+2]=0;}
const draft={x:57,y:50,w:200,h:200,polygon:[{x:57,y:50},{x:257,y:50},{x:257,y:250},{x:57,y:250}]};
const snapped=g.snapRooms(pixels,400,400,[draft])[0];assert(snapped.x>=47&&snapped.x<=51);assert.equal(snapped.polygon[1].x,257);
const blank=new Uint8ClampedArray(400*400*4).fill(255);assert.equal(g.snapRooms(blank,400,400,[draft])[0].x,57);
console.log('Plan geometry: concave-room placement, nearby wall snap, blank-plan preservation PASS');

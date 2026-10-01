import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c={};vm.runInNewContext(fs.readFileSync('plan-geometry.js','utf8'),c);const g=c.VentPlanGeometry;
const living=[{x:174,y:80},{x:524,y:80},{x:524,y:258},{x:646,y:258},{x:646,y:184},{x:755,y:184},{x:755,y:343},{x:525,y:343},{x:525,y:521},{x:174,y:521}];
assert(g.validPolygon(living));assert(!g.validPolygon([{x:0,y:0},{x:100,y:100},{x:0,y:100},{x:100,y:0}]));assert(!g.validPolygon([{x:0,y:0},{x:2,y:0},{x:2,y:2}]));assert(g.inside({x:300,y:300},living));assert(!g.inside({x:600,y:150},living));assert(!g.inside({x:600,y:450},living));
console.log('Traced real-plan geometry PASS: concave living / hallway footprint, bathroom and bedroom excluded, crossed and tiny outlines rejected. Automatic recognition accuracy is not asserted.');

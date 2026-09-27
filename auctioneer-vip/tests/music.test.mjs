import test from 'node:test';
import assert from 'node:assert/strict';

test('explicit Play retries an already opened player and closing still stops automatic playback',async()=>{
  const ids=['musicDock','musicToggle','musicLabel','playerMount','playFromLogin','closeMusic'];
  const elements=new Map(ids.map(id=>[id,{children:[],listeners:{},
    setAttribute(name,value){this[name]=value;},
    addEventListener(name,callback){this.listeners[name]=callback;},
    replaceChildren(...children){this.children=children;}
  }]));
  const previousDocument=globalThis.document,previousLocation=globalThis.location;
  globalThis.document={getElementById:id=>elements.get(id),createElement:tagName=>({tagName})};
  globalThis.location={origin:'https://auctioneer.it.com'};
  try{
    const {startOnEntry}=await import('../public/music.js');
    startOnEntry();
    const initial=elements.get('playerMount').children[0];assert.ok(initial);
    startOnEntry();assert.equal(elements.get('playerMount').children[0],initial);
    elements.get('playFromLogin').listeners.click();
    const retry=elements.get('playerMount').children[0];assert.ok(retry);assert.notEqual(retry,initial);
    assert.equal(new URL(retry.src).searchParams.get('autoplay'),'1');
    elements.get('closeMusic').listeners.click();assert.equal(elements.get('playerMount').children.length,0);
    startOnEntry();assert.equal(elements.get('playerMount').children.length,0);
    elements.get('playFromLogin').listeners.click();assert.equal(elements.get('playerMount').children.length,1);
  }finally{
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
    if(previousLocation===undefined)delete globalThis.location;else globalThis.location=previousLocation;
  }
});

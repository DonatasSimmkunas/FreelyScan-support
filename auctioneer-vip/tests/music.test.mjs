import test from 'node:test';
import assert from 'node:assert/strict';

let moduleVersion=0;
async function musicHarness({apiReady=true}={}){
  const globalKeys=['document','location','YT','onYouTubeIframeAPIReady'];
  const previous=new Map(globalKeys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const players=[],scripts=[],documentListeners=new Map();
  class Element{
    constructor(tagName='div'){this.tagName=tagName;this.children=[];this.listeners={};}
    setAttribute(name,value){this[name]=value;}
    addEventListener(name,callback){this.listeners[name]=callback;}
    replaceChildren(...children){this.children=children;}
    contains(element){return this.children.includes(element);}
    scrollIntoView(){}
  }
  const ids=['musicDock','musicToggle','musicLabel','playerMount','playFromLogin','closeMusic'];
  const elements=new Map(ids.map(id=>[id,new Element()]));
  class Player{
    constructor(frame,options){this.frame=frame;this.events=options.events;this.calls=[];players.push(this);}
    getIframe(){return this.frame;}
    unMute(){this.calls.push('unMute');}
    playVideo(){this.calls.push('playVideo');}
    destroy(){this.calls.push('destroy');}
    emit(name,data){this.events[name]?.({target:this,data});}
  }
  globalThis.document={getElementById:id=>elements.get(id),createElement:tag=>new Element(tag),head:{append:script=>scripts.push(script)},
    addEventListener(name,callback){documentListeners.set(name,callback);}};
  globalThis.location={origin:'https://auctioneer.it.com'};
  if(apiReady)globalThis.YT={Player};else delete globalThis.YT;
  delete globalThis.onYouTubeIframeAPIReady;
  const music=await import(`../public/music.js?test=${++moduleVersion}`);
  return{...music,elements,players,scripts,Player,
    click:id=>elements.get(id).listeners.click(),
    gesture:(type,extra={})=>documentListeners.get(type)?.({type,isTrusted:true,pointerType:'mouse',key:'a',...extra}),
    restore(){for(const[key,descriptor]of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
  };
}

test('entry attempts audible autoplay through official API and retains one iframe across login',async()=>{
  const h=await musicHarness({apiReady:false});
  try{
    h.startOnEntry();const frame=h.elements.get('playerMount').children[0],src=new URL(frame.src);
    assert.equal(src.origin,'https://www.youtube-nocookie.com');assert.equal(src.pathname,'/embed/WflAReA2cqs');
    assert.equal(src.searchParams.get('autoplay'),'1');assert.equal(src.searchParams.get('enablejsapi'),'1');
    assert.equal(src.searchParams.get('loop'),'1');assert.equal(src.searchParams.get('playlist'),'WflAReA2cqs');
    assert.equal(src.searchParams.get('origin'),'https://auctioneer.it.com');assert.ok(Number(frame.height)>=200);
    assert.match(frame.allow,/autoplay/);assert.equal(h.scripts[0].src,'https://www.youtube.com/iframe_api');
    globalThis.YT={Player:h.Player};globalThis.onYouTubeIframeAPIReady();
    const player=h.players[0];player.emit('onReady');assert.deepEqual(player.calls,['unMute','playVideo']);
    player.emit('onStateChange',1);h.startOnEntry();
    assert.equal(h.elements.get('playerMount').children[0],frame);assert.equal(h.players.length,1);
    assert.deepEqual(player.calls,['unMute','playVideo']);
  }finally{h.restore();}
});

test('first trusted pointer or keyboard gesture retries audible playback; synthetic events do not',async()=>{
  const h=await musicHarness();
  try{
    h.startOnEntry();const player=h.players[0];player.emit('onReady');
    h.gesture('pointerdown',{isTrusted:false});assert.equal(player.calls.length,2);
    h.gesture('pointerdown');assert.deepEqual(player.calls,['unMute','playVideo','unMute','playVideo']);
    player.emit('onAutoplayBlocked');h.gesture('keydown',{key:'Shift'});assert.equal(player.calls.length,4);
    h.gesture('keydown',{key:'a'});assert.deepEqual(player.calls.slice(-2),['unMute','playVideo']);assert.equal(player.calls.length,6);
    player.emit('onStateChange',1);h.gesture('click');assert.equal(player.calls.length,6);
    player.emit('onAutoplayBlocked');h.gesture('pointerdown',{pointerType:'touch'});assert.equal(player.calls.length,6);
    h.gesture('pointerup',{pointerType:'touch'});assert.equal(player.calls.length,8);
  }finally{h.restore();}
});

test('close and native pause preserve stop intent, while explicit Play resumes without resetting a ready player',async()=>{
  const h=await musicHarness();
  try{
    h.startOnEntry();const first=h.players[0];first.emit('onReady');first.emit('onAutoplayBlocked');
    h.gesture('pointerdown',{target:{closest:selector=>selector==='#closeMusic'}});assert.equal(first.calls.length,2);
    h.click('closeMusic');h.startOnEntry();h.gesture('keydown');assert.equal(h.elements.get('playerMount').children.length,0);
    h.click('playFromLogin');const second=h.players[1],frame=h.elements.get('playerMount').children[0];
    second.emit('onReady');second.emit('onStateChange',1);second.emit('onStateChange',2);
    h.gesture('keydown');h.startOnEntry();assert.equal(second.calls.length,2);
    h.click('playFromLogin');assert.equal(second.calls.length,4);assert.equal(h.elements.get('playerMount').children[0],frame);
  }finally{h.restore();}
});

test('stale player callbacks and unexpected iframe origins cannot trigger playback',async()=>{
  const h=await musicHarness();
  try{
    h.startOnEntry();const old=h.players[0];h.click('closeMusic');h.click('playFromLogin');const current=h.players[1];
    old.emit('onReady');old.emit('onAutoplayBlocked');assert.deepEqual(current.calls,[]);
    const original=current.frame.src;current.frame.src='https://other.example/embed/WflAReA2cqs';
    current.emit('onReady');assert.deepEqual(current.calls,[]);
    current.frame.src=original;current.emit('onReady');assert.deepEqual(current.calls,['unMute','playVideo']);
  }finally{h.restore();}
});

test('if the API script fails, explicit Play still retries a visible autoplay iframe',async()=>{
  const h=await musicHarness({apiReady:false});
  try{
    h.startOnEntry();const initial=h.elements.get('playerMount').children[0];h.scripts[0].listeners.error();
    h.click('playFromLogin');const retry=h.elements.get('playerMount').children[0];
    assert.notEqual(retry,initial);assert.equal(new URL(retry.src).searchParams.get('autoplay'),'1');assert.equal(h.scripts.length,2);
    assert.equal(h.elements.get('musicDock').hidden,false);
  }finally{h.restore();}
});

// js/ses.js — Ses: WebAudio / HTMLAudio / beep yedeği, müzik, efektler (SES). Tanımlar: BEEPV, beep, SES, initAudio, vib · Kullanır: AC
"use strict";
/* ---------- ses: WebAudio (http/https) -> HTMLAudio (file:// ya da hata) -> beep() sentezi ---------- */
let BEEPV=1;
function beep(f,d,type,v,when,f2){
  if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+(when||0);
    o.type=type||'triangle';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(Math.max(.0011,(v||.15)*BEEPV),t);g.gain.exponentialRampToValueAtTime(.001,t+d);
    o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);}catch(_){}
}
const SES=(()=>{
  const EFX=['yerlestir','sira','safsira','hata','eslesme','top','patlama','su','altin','onarim','kivilcim','yelken','satis','korsan','batis','dugme','kazandin','kaybettin'];
  const MUZ={deniz:'muzik_deniz',savas:'muzik_savas'},MUS_VOL=.3,FX_VOL=.9,FADE=.6,AYAR_KEY='muson-ayar';
  const url=n=>'assets/ses/'+n+'.mp3';
  const C=(typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext))||null;
  const proto=(typeof location!=='undefined'&&location&&location.protocol)||'';
  const canFetch=typeof fetch==='function'&&/^https?:$/.test(proto);
  const hasEl=typeof Audio!=='undefined';
  const mode=C&&canFetch?'webaudio':hasEl?'html':C?'beep':'yok';
  const BEEP={
    yerlestir:()=>beep(150,.12,'triangle',.3),
    sira:r=>[523,659,784].forEach((f,i)=>beep(f*r,.18,'sine',.13,i*.07)),
    safsira:()=>{beep(1319,.3,'sine',.1);beep(1568,.35,'sine',.08,.12);},
    hata:()=>beep(180,.12,'square',.07),
    eslesme:r=>[523,659].forEach((f,i)=>beep(f*r,.16,'sine',.12,i*.06)),
    top:()=>beep(115,.16,'square',.08,0,55),
    patlama:()=>beep(85,.22,'sawtooth',.07,0,30),
    su:()=>beep(500,.3,'sine',.06,0,1200),
    altin:()=>beep(1320,.06,'sine',.06),
    onarim:()=>{beep(620,.05,'square',.05);beep(620,.05,'square',.05,.12);},
    kivilcim:()=>beep(1800,.18,'sawtooth',.03,0,900),
    yelken:()=>{beep(392,.2,'sine',.1);beep(523,.3,'sine',.1,.15);},
    satis:()=>[659,784,988,1319].forEach((f,i)=>beep(f,.2,'sine',.12,i*.08)),
    korsan:()=>[220,165].forEach((f,i)=>beep(f,.3,'sawtooth',.08,i*.18)),
    batis:()=>beep(160,.9,'sine',.1,0,50),
    dugme:()=>beep(600,.04,'sine',.05),
    kazandin:()=>[523,659,784,1047].forEach((f,i)=>beep(f,.25,'sine',.14,i*.09)),
    kaybettin:()=>[392,330,262].forEach((f,i)=>beep(f,.3,'triangle',.12,i*.12))
  };
  let ctx=null,sfxG=null,musG=null,unlocked=false,hidden=false;
  const raw={},buf={},bad={},elBad={},lastT={},son=[],load={toplam:0,yuklenen:0,hatali:0};
  const ayar={ses:true,muzik:true};
  try{const a=JSON.parse(localStorage.getItem(AYAR_KEY)||'null');if(a&&typeof a==='object'){ayar.ses=a.ses!==false;ayar.muzik=a.muzik!==false;}}catch(_){}
  function saveAyar(){try{localStorage.setItem(AYAR_KEY,JSON.stringify(ayar));}catch(_){}}
  const quiet=p=>{if(p&&typeof p.catch==='function')p.catch(()=>{});};

  function decodeTo(store,badStore,n,ab,done){
    try{
      let fin=false;
      const ok=b=>{if(fin)return;fin=true;store[n]=b;done&&done(true);},no=()=>{if(fin)return;fin=true;badStore[n]=1;done&&done(false);};
      const p=ctx.decodeAudioData(ab,ok,no);
      if(p&&typeof p.then==='function')p.then(ok,no);
    }catch(_){badStore[n]=1;done&&done(false);}
  }
  function decode(n){if(!ctx||!raw[n]||buf[n])return;const ab=raw[n];raw[n]=null;decodeTo(buf,bad,n,ab);}
  // efektleri önyükle (müzik tembel)
  function preload(){
    if(mode==='webaudio'){
      load.toplam=EFX.length;
      for(const n of EFX){
        try{
          fetch(url(n)).then(r=>{if(!r||!r.ok)throw new Error('net');return r.arrayBuffer();})
            .then(ab=>{raw[n]=ab;load.yuklenen++;decode(n);},()=>{bad[n]=1;load.hatali++;});
        }catch(_){bad[n]=1;load.hatali++;}
      }
    }else if(mode==='html'){
      load.toplam=EFX.length;
      for(const n of EFX){
        try{
          const a=new Audio();let seen=false;
          const ok=()=>{if(!seen){seen=true;load.yuklenen++;}},no=()=>{elBad[n]=1;if(!seen){seen=true;load.hatali++;}};
          if(a.addEventListener){a.addEventListener('canplaythrough',ok);a.addEventListener('loadeddata',ok);a.addEventListener('error',no);}
          a.preload='auto';a.src=url(n);
          if(a.load)try{a.load();}catch(_){}
        }catch(_){elBad[n]=1;load.hatali++;}
      }
    }
  }
  // ilk dokunuşta ses bağlamını aç (tarayıcı kuralı); iOS için sessiz bir tampon çalınır
  function unlock(){
    if(C&&!ctx){
      try{ctx=new C();}catch(_){ctx=null;}
      if(ctx){
        try{sfxG=ctx.createGain();sfxG.gain.value=FX_VOL;sfxG.connect(ctx.destination);
          musG=ctx.createGain();musG.gain.value=1;musG.connect(ctx.destination);}catch(_){sfxG=musG=null;}
        AC=ctx;for(const n in raw)decode(n);
      }
    }
    if(ctx&&ctx.state==='suspended'&&!hidden){try{quiet(ctx.resume());}catch(_){}}
    if(!unlocked){
      unlocked=true;
      if(ctx){try{const b=ctx.createBuffer(1,1,22050),s=ctx.createBufferSource();s.buffer=b;s.connect(ctx.destination);s.start(0);}catch(_){}}
      syncMusic();
    }
  }
  function playEl(n,vol,rate,len){
    try{
      const a=new Audio(url(n));
      a.volume=Math.max(0,Math.min(1,vol*FX_VOL));
      try{a.preservesPitch=false;a.mozPreservesPitch=false;a.webkitPreservesPitch=false;a.playbackRate=rate;}catch(_){}
      if(a.addEventListener)a.addEventListener('error',()=>{elBad[n]=1;});
      quiet(a.play&&a.play());
      if(len)setTimeout(()=>{try{a.pause();}catch(_){}},len*1000);
      return true;
    }catch(_){elBad[n]=1;return false;}
  }
  // o: {vol, rate, len (sn; kısa kes), sabit (perde oynaması yok)}
  function cal(n,o){
    if(!ayar.ses||!BEEP[n])return false;
    o=o||{};const now=performance.now();
    if(lastT[n]!=null&&now-lastT[n]<60)return false; // art arda aynı efekt birleşir
    lastT[n]=now;son.push(n);if(son.length>20)son.shift();
    if(hidden)return true;
    const vol=o.vol==null?1:o.vol,rate=(o.rate||1)*(o.sabit?1:.96+Math.random()*.08);
    if(ctx&&buf[n]&&sfxG){
      try{
        const s=ctx.createBufferSource(),g=ctx.createGain(),t=ctx.currentTime;
        s.buffer=buf[n];s.playbackRate.value=rate;g.gain.value=vol;s.connect(g);g.connect(sfxG);
        if(o.len){g.gain.setValueAtTime(vol,t+Math.max(.01,o.len-.15));g.gain.linearRampToValueAtTime(.0001,t+o.len);s.start(t);s.stop(t+o.len+.02);}
        else s.start(t);
        return true;
      }catch(_){}
    }
    if(hasEl&&!elBad[n]&&(mode==='html'||bad[n]||unlocked)&&playEl(n,vol,rate,o.len))return true;
    if(AC){BEEPV=vol;try{BEEP[n](o.rate||1);}finally{BEEPV=1;}}
    return true;
  }

  /* müzik: döngülü, kısık; ekran değişiminde çapraz geçiş */
  let want=null,cur=null,duckT=0;
  const mbuf={},mbad={},mload={},mel={};
  function loadMus(name){
    if(mload[name]||mbuf[name]||mbad[name])return;
    mload[name]=1;
    try{
      fetch(url(MUZ[name])).then(r=>{if(!r||!r.ok)throw new Error('net');return r.arrayBuffer();})
        .then(ab=>{decodeTo(mbuf,mbad,name,ab,()=>{mload[name]=0;syncMusic();});},()=>{mbad[name]=1;mload[name]=0;syncMusic();});
    }catch(_){mbad[name]=1;mload[name]=0;}
  }
  function fadeOut(c){
    if(c.src&&ctx){
      try{const t=ctx.currentTime;c.g.gain.cancelScheduledValues(t);c.g.gain.setValueAtTime(c.g.gain.value,t);c.g.gain.linearRampToValueAtTime(0,t+FADE);c.src.stop(t+FADE+.05);}catch(_){}
    }else if(c.el)elRamp(c.el,0,()=>{try{c.el.pause();}catch(_){}});
  }
  function elRamp(el,to,done){
    const from=el.volume||0,t0=performance.now(),D=FADE*1000;
    el._ramp=(el._ramp||0)+1;const tok=el._ramp;
    const st=()=>{if(el._ramp!==tok)return;const k=Math.min(1,(performance.now()-t0)/D);try{el.volume=Math.max(0,Math.min(1,from+(to-from)*k));}catch(_){}
      if(k<1)setTimeout(st,40);else if(done)done();};
    st();
  }
  function startTrack(name){
    if(mode==='webaudio'&&ctx&&musG&&!mbad[name]){
      if(!mbuf[name]){loadMus(name);return null;}
      try{
        const src=ctx.createBufferSource(),g=ctx.createGain(),t=ctx.currentTime;
        src.buffer=mbuf[name];src.loop=true;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(MUS_VOL,t+FADE);
        src.connect(g);g.connect(musG);src.start(t);
        return{name,src,g};
      }catch(_){return null;}
    }
    if(hasEl){
      try{
        const el=mel[name]||(mel[name]=new Audio(url(MUZ[name])));
        el.loop=true;el.volume=0;quiet(el.play&&el.play());elRamp(el,MUS_VOL);
        return{name,el};
      }catch(_){return null;}
    }
    return null;
  }
  function syncMusic(){
    const target=ayar.muzik&&unlocked&&!hidden?want:null;
    if(cur&&cur.name===target)return;
    if(cur){fadeOut(cur);cur=null;}
    if(target)cur=startTrack(target);
  }
  function muzik(name){want=name&&MUZ[name]?name:null;syncMusic();}
  // kaybetme/kazanma ezgisi çalarken müzik kısılır
  function duck(ms){
    duckT++;const tok=duckT;
    if(musG&&ctx){try{const t=ctx.currentTime;musG.gain.cancelScheduledValues(t);musG.gain.setValueAtTime(musG.gain.value,t);musG.gain.linearRampToValueAtTime(.2,t+.2);}catch(_){}}
    else if(cur&&cur.el)elRamp(cur.el,MUS_VOL*.2);
    setTimeout(()=>{if(tok!==duckT||kisik)return;
      if(musG&&ctx){try{const t=ctx.currentTime;musG.gain.cancelScheduledValues(t);musG.gain.setValueAtTime(musG.gain.value,t);musG.gain.linearRampToValueAtTime(1,t+.9);}catch(_){}}
      else if(cur&&cur.el)elRamp(cur.el,MUS_VOL);},ms||4000);
  }
  // reklam sırasında müzik susar, bitince geri gelir
  let kisik=false;
  function kis(on){
    kisik=!!on;duckT++;
    if(musG&&ctx){try{const t=ctx.currentTime;musG.gain.cancelScheduledValues(t);musG.gain.setValueAtTime(musG.gain.value,t);musG.gain.linearRampToValueAtTime(kisik?0:1,t+.3);}catch(_){}}
    else if(cur&&cur.el)elRamp(cur.el,kisik?0:MUS_VOL);
  }
  // sekme gizlenince her şey durur, dönünce sürer
  function vis(){
    hidden=!!(typeof document!=='undefined'&&document.hidden);
    if(ctx){try{if(hidden){if(ctx.state==='running')quiet(ctx.suspend());}else if(unlocked)quiet(ctx.resume());}catch(_){}}
    if(cur&&cur.el){try{if(hidden)cur.el.pause();else quiet(cur.el.play());}catch(_){}}
    if(!hidden&&!cur)syncMusic();
  }
  try{document.addEventListener('visibilitychange',vis);}catch(_){}
  function set(ad,deger){
    if(ad!=='ses'&&ad!=='muzik')return false;
    ayar[ad]=!!deger;saveAyar();if(ad==='muzik')syncMusic();return ayar[ad];
  }
  preload();
  return{cal,muzik,duck,kis,unlock,set,load,mode,get kisik(){return kisik;},
    get ready(){return unlocked&&(load.toplam===0||load.yuklenen+load.hatali>=load.toplam);},
    get kilit(){return !unlocked;},get sesAcik(){return ayar.ses;},get muzikAcik(){return ayar.muzik;},
    get calan(){return cur?cur.name:null;},get istenen(){return want;},get son(){return son.slice();}};
})();
function initAudio(){SES.unlock();}
function vib(p){if(navigator.vibrate)try{navigator.vibrate(p);}catch(_){}}

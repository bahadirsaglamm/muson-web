// js/akis.js — Ekran geçişleri (go) ve yolculuk akışı: başlat, sürdür, korsan penceresi, otomatik savunma. Tanımlar: SCREEN_EL, magazaDon, magazaGeri, magazaAc, go, resumeTrip, startStop, startNext, sailOn, savunmaSatiri, korsanPenceresi, otomatikSavun · Kullanır: t, tx, OYUN, screen, hideModal, $, S, showModal, modalOn, save, fmt, jingle, SES, Yol, renderTitle, renderMap, renderPort, GemiUI, MagazaUI, SeferUI, SavasUI, SatisUI
"use strict";
// ekran adları: title, map, yukleme, savas, satis, port ('sefer' eski ad, yukleme'ye gider)
const SCREEN_EL={title:'scr-title',map:'scr-map',yukleme:'scr-sefer',savas:'scr-savas',satis:'scr-satis',port:'scr-port',gemi:'scr-gemi',magaza:'scr-magaza'};
let magazaDon='map';
// magazaGeri: mağaza bir pencereden (kurtarma) açıldıysa, kapanınca çağrılır (pencereye dönüş)
let magazaGeri=null;
function magazaAc(geri){go('magaza');magazaGeri=geri||null;}
function go(name){
  if(name==='sefer')name='yukleme';
  if(!SCREEN_EL[name])return false;
  if(name==='yukleme'&&!SeferUI.hasGame())return false;
  if(name==='savas'&&!SavasUI.hasGame())return false;
  if(name==='satis'&&!SatisUI.canShow())return false;
  if(name==='magaza'&&screen!=='magaza'){magazaDon=['map','port','gemi'].includes(screen)?screen:'map';magazaGeri=null;}
  screen=name;hideModal();Yol.stop();
  for(const k in SCREEN_EL)$(SCREEN_EL[k]).classList.toggle('on',k===name);
  SES.muzik(name==='savas'?'savas':'deniz');
  if(name==='title')renderTitle();
  else if(name==='map')renderMap();
  else if(name==='port')renderPort();
  else if(name==='gemi')GemiUI.show();
  else if(name==='magaza')MagazaUI.show();
  else if(name==='yukleme')SeferUI.show();
  else if(name==='savas')SavasUI.show();
  else if(name==='satis')SatisUI.show();
  return true;
}
// yarım kalan yolculuk kaldığı aşamadan sürer
function resumeTrip(){
  const tr=S.trip;if(!tr)return false;
  if(tr.phase==='savas'){SavasUI.start(OYUN.tripInfo(tr.i).battle,tr.i);return go('savas');}
  SatisUI.reset();return go('satis');
}
function startStop(i){
  // haritadan yarım korsan yolculuğuna dönülünce önce "Korsanlar!" penceresi (savunma yetiyorsa otomatik savun da)
  if(S.trip&&S.trip.phase==='savas'&&screen==='map'){korsanPenceresi(OYUN.tripInfo(S.trip.i));return true;}
  if(S.trip)return resumeTrip();
  if(i>S.stop||i<0)return false;
  SeferUI.start(i+1,i);go('yukleme');
  return true;
}
function startNext(){return startStop(S.stop);}
// yükleme bitti: yol sahnesi oynar (dokununca geçilir), ardından pencere: korsan varsa savaş, yoksa varış.
// Pencere hemen kurulur (kanca çağrıları beklemez); sahne bitene dek görünmez.
function sailOn(){
  const tr=S.trip;if(!tr)return go('map');
  const t=OYUN.tripInfo(tr.i),pir=t.pirate&&tr.phase==='savas';
  if(pir)korsanPenceresi(t);
  else
    showModal(`<h2>${tx('voyage.sailed.title')}</h2><div class="route">${t.from} → ${t.to}</div><p>${tx('voyage.sailed.text',{city:t.to})}</p>
      <div class="row"><button class="primary" data-act="go">${tx('voyage.sailed.dock')}</button></div>`,{go:resumeTrip});
  const m=$('modal');m.classList.add('voy','wait');
  Yol.start(pir,()=>{if(!modalOn)return;m.classList.remove('wait');const c=$('card');c.style.animation='none';void c.offsetWidth;c.style.animation='';});
}
// "Korsanlar!" penceresi: savunma ve korsan gücü; savunma yetiyorsa "Otomatik savun" da çıkar
function savunmaSatiri(battle){
  const d=OYUN.savunma(S),k=OYUN.korsanGucu(battle),ok=d>=k;
  return{d,k,ok,html:`<div class="dfn"><span class="${ok?'ok':'bad'}">🛡 ${t('battle.pre.def',{n:d})}</span><span class="bad">⚔ ${t('battle.pre.pirate',{n:k})}</span></div>`};
}
function korsanPenceresi(t){
  const sv=savunmaSatiri(t.battle),half=OYUN.autoLoot(t.battle);
  showModal(`<h2>${tx('battle.pre.title')}</h2><div class="route">${t.from} → ${t.to}</div>${sv.html}
    <p>${sv.ok?tx('battle.pre.strong',{gold:half}):tx('battle.pre.weak')}</p>
    <div class="row">${sv.ok?`<button data-act="savun">🛡 ${tx('battle.pre.auto')}</button>`:''}<button class="primary" data-act="go">⚔ ${tx('battle.pre.fight')}</button></div>`,
    sv.ok?{go:resumeTrip,savun:otomatikSavun}:{go:resumeTrip});
}
function otomatikSavun(){
  const tr=S.trip;if(!tr)return null;
  const t=OYUN.tripInfo(tr.i),reward=OYUN.autoDefend(S);
  if(reward==null)return null;
  save();
  showModal(`<h2 class="t-win">${tx('battle.auto.title')}</h2><div class="route">${t.from} → ${t.to}</div>
    <ul><li><span>${tx('battle.auto.half')}</span><b>${tx('ui.goldPlus',{n:reward})}</b></li><li><span>${tx('battle.auto.cargo')}</span><b>${tx('battle.auto.safe')}</b></li></ul>
    <div class="row"><button class="primary" data-act="go">${tx('battle.toPort')}</button></div>`,{go:()=>{SatisUI.reset();go('satis');}});
  const m=$('modal');m.classList.add('voy','wait');
  Yol.start(true,()=>{if(!modalOn)return;m.classList.remove('wait');jingle(true);},{savun:true});
  return reward;
}

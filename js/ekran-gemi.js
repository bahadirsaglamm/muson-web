// js/ekran-gemi.js — Tersane ekranı: gemi geliştirmeleri (GemiUI). Tanımlar: GemiUI · Kullanır: t, gemiAdi, parcaEtki, OYUN, $, fmt, S, screen, save, shipKey, IMG, shipTier, SES, vib, initAudio, go, dotsHtml
"use strict";
/* ================= tersane: gemi geliştirmeleri ================= */
const GemiUI=(()=>{
  let shownTier=-1;
  function shipImg(k,cls){const key=shipKey(k);return `<img class="${cls||''}" src="${IMG.src(key)}" alt="" draggable="false" style="height:${Math.round(100*(k?440:400)/440)}%" onerror="this.parentNode.classList.add('noimg')">`;}
  function show(){
    const k=shipTier();
    $('g-gold').textContent=t('ui.gold',{n:S.gold});
    if(shownTier!==k||!$('g-ship').innerHTML){$('g-ship').innerHTML=shipImg(k);$('g-ship').classList.toggle('noimg',IMG.failed(shipKey(k)));}
    shownTier=k;
    $('g-tier').textContent=gemiAdi(k);
    $('g-def').textContent=OYUN.savunma(S);
    const left=OYUN.toNextTier(S.ship);
    $('g-next').innerHTML=left?t('ship.next',{name:gemiAdi(k+1),n:left}):t('ship.maxTier');
    list();
  }
  function list(jumpId){
    $('g-list').innerHTML=OYUN.SHIP.map(p=>{
      const k=S.ship[p.id]|0,pr=OYUN.shipPrice(S,p.id),base=k<OYUN.MAXK?p.prices[k]:null;
      const eff=k?t('ui.now',{x:'<b>'+parcaEtki(p.id,k)+'</b>'}):t('ui.none');
      const nx='<br>'+(pr!=null?t('ui.nextLevel',{x:parcaEtki(p.id,k+1)}):t('ui.maxLevel'));
      const can=pr!=null&&S.gold>=pr,miss=pr!=null&&!can?`<div class="pmiss">${t('ui.goldShort',{n:pr-S.gold})}</div>`:'';
      const price=pr!=null&&base!==pr?`<s style="opacity:.55">${fmt(base)}</s> ${fmt(pr)}`:pr!=null?fmt(pr):'';
      const btn=pr==null?`<button disabled>${t('ui.full')}</button>`:`<button class="${can?'primary':''}" data-up="${p.id}" data-sessiz ${can?'':'disabled'}>${t('ship.upgrade')}<small>${t('ui.gold',{n:price})}</small></button>`;
      return `<div class="prow${pr!=null&&!can?' cant':''}"><div class="pic${jumpId===p.id?' jump':''}">${p.e}</div><div class="pinfo"><div class="pname">${t('ship.part.'+p.id+'.name')}${dotsHtml(k)}</div><div class="peff">${eff}${nx}</div>${miss}</div>${btn}</div>`;
    }).join('');
  }
  // kademe atlama kutlaması: eski görselden yenisine geçiş, parıltı, ses
  function celebrate(from,to){
    const sh=$('g-ship');
    sh.innerHTML=shipImg(from,'old')+shipImg(to,'new');sh.classList.toggle('noimg',IMG.failed(shipKey(to)));shownTier=to;
    const gl=$('g-glint');gl.classList.remove('on');void gl.offsetWidth;gl.classList.add('on');
    const up=$('g-up');up.textContent=t('ship.newShip',{name:gemiAdi(to)});up.classList.remove('on');void up.offsetWidth;up.classList.add('on');
    SES.cal('safsira',{sabit:true});SES.cal('kazandin',{sabit:true});SES.duck(3800);vib([20,40,20,40,60]);
    setTimeout(()=>{if(shownTier===to&&screen==='gemi'){const o=sh.querySelector?sh.querySelector('img.old'):null;if(o)try{o.remove();}catch(_){}}},900);
  }
  function upgrade(id){
    const r=OYUN.upgradeShip(S,id);
    if(!r){SES.cal('hata');return null;}
    save();SES.cal('onarim');SES.cal('satis');vib([12,30,12]);
    if(screen==='gemi'){
      show();list(id);
      if(r.tierUp)celebrate(r.from,r.to);
    }
    return r;
  }
  $('g-list').addEventListener('click',e=>{
    const b=e.target&&e.target.closest?e.target.closest('[data-up]'):null;if(!b)return;
    initAudio();upgrade(b.getAttribute('data-up'));
  });
  $('g-back').onclick=()=>go('map');
  $('g-port').onclick=()=>go('port');
  return{show,upgrade};
})();

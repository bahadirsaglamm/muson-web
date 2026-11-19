// js/ekran-harita.js — Harita ekranı: rota, şehirler (sıradakinde rota koşulu), alt düğmeler, sıfırlama. Tanımlar: ISLE, renderMap, mapPara, resetAll · Kullanır: t, tx, kosulAd, OYUN, SIRKET, sirketHarita, sirketSifirla, $, fmt, S, GOODS, TIER_NAME, SAVE_KEY, save, screen, IMG, shipKey, shipTier, initAudio, SES, savunmaSatiri, startStop, startNext, go
"use strict";
/* ================= harita ================= */
const ISLE=c=>c%2?'sehir2':'sehir1';
function renderMap(){
  $('m-gold').textContent=t('ui.gold',{n:S.gold});
  const next=OYUN.tripInfo(S.stop),tr=S.trip;
  if(tr){
    const t=OYUN.tripInfo(tr.i);
    $('m-tip').innerHTML=tx(tr.phase==='savas'?'map.tip.resumeBattle':'map.tip.resumeSale',{from:t.from,to:t.to});
  }else if(S.stop===0)
    $('m-tip').innerHTML=t('map.tip.welcome');
  else
    $('m-tip').innerHTML=t('map.tip.next',{from:next.from,to:next.to,extra:(next.pirate?' · ⚔ '+t('map.tip.pirate'):'')+(next.kosul?` · ${next.kosul.e} ${kosulAd(next.kosul.id)}`:'')})
      +' '+t('map.tip.pricey',{city:next.to,good:GOODS[next.pricey].s})+' '+t('map.tip.replay');
  const cFrom=Math.max(0,S.stop-5),cTo=S.stop+7,STEP=96,TOP=62,pos=c=>[50+26*Math.sin(c*0.95),TOP+(c-cFrom)*STEP];
  const shipAt=tr?tr.i:S.stop;
  const pts=[],html=[];
  const islImg=(c,cls,inner)=>`<div class="node ${cls}${IMG.failed(ISLE(c))?' noimg':''}" ${inner}><img src="${IMG.src(ISLE(c))}" alt="" draggable="false" onerror="this.parentNode.classList.add('noimg')">`;
  for(let c=cFrom;c<=cTo;c++){
    const[x,y]=pos(c);pts.push([x,y]);
    // etiket genişliği ekranın kenarına kadar (uzun şehir adları alt satıra geçer)
    const right=x<50,side=right?`left:calc(${x}% + 44px);max-width:calc(${100-x}% - 52px)`:`right:calc(${100-x}% + 44px);max-width:calc(${x}% - 52px);text-align:right`,ml=right?'':' style="margin-left:auto"';
    if(c===0){
      html.push(islImg(c,'home',`style="left:${x}%;top:${y}px"`)+`<span class="num">⚓</span></div>`);
      html.push(`<div class="nlabel" style="${side};top:${y}px">${OYUN.cityName(0)}<span class="b-home"${ml}>${t('map.home')}</span></div>`);
    }else{
      const i=c-1,t=OYUN.tripInfo(i),st=i<S.stop?'done':i===S.stop?'cur':'lock',r=S.stops[i];
      if(t.pirate&&c-1>=cFrom){const[px,py]=pos(c-1),past=st==='done'&&!(tr&&tr.i===i);
        html.push(`<div class="pirate${past?' past':''}${IMG.failed('korsan')?' noimg':''}" style="left:${(px+x)/2}%;top:${(py+y)/2}px" title="${tx('map.pirate')}"><img src="${IMG.src('korsan')}" alt="" draggable="false" onerror="this.parentNode.classList.add('noimg')"></div>`);
        // önündeki korsanlarda savunma karşılaştırması
        if(!past){const sv=savunmaSatiri(t.battle);html.push(`<div class="pw ${sv.ok?'ok':'bad'}" style="left:${(px+x)/2}%;top:${(py+y)/2}px">🛡 ${sv.d} · ⚔ ${sv.k}</div>`);}}
      html.push(islImg(c,st,`data-stop="${i}" style="left:${x}%;top:${y}px" role="button" aria-label="${t.to}"`)+`<span class="num">${t.n}</span></div>`);
      let badge='';
      const yolda=()=>tx(tr.phase==='savas'?'map.badge.pirate':'map.badge.sale');
      if(st==='done'&&r)badge=`<span class="b-${r.r}"${ml}>${TIER_NAME[r.r]} · ${tx('ui.gold',{n:r.gold})}</span>`;
      else if(st==='cur')badge=`<span class="b-next"${ml}>${tr&&tr.i===i?yolda():tx('ui.upNext')}</span>`;
      // sıradaki yolculuğun rota koşulu (yükleme başlamadıysa): küçük ikon + ad
      if(st==='cur'&&!(tr&&tr.i===i)&&t.kosul)badge+=`<span class="b-kosul k-${t.kosul.id}"${ml}>${t.kosul.e} ${kosulAd(t.kosul.id)}</span>`;
      else if(tr&&tr.i===i)badge=`<span class="b-next"${ml}>${yolda()}</span>`;
      html.push(`<div class="nlabel ${st==='lock'?'lock':''}" style="${side};top:${y}px">${t.to}<em>${tx('ui.voyage',{n:t.n})}</em>${badge}</div>`);
    }
    if(c===shipAt){const sk=shipKey();html.push(`<div class="ship t${shipTier()+1}${IMG.failed(sk)?' noimg':''}" style="left:${x}%;top:${y}px"><img src="${IMG.src(sk)}" alt="" draggable="false" onerror="this.parentNode.classList.add('noimg')"></div>`);}
  }
  const H=TOP*2+(cTo-cFrom)*STEP,route=$('route');
  route.style.height=H+'px';
  const path=pts.map((p,k)=>(k?'L':'M')+p[0]+' '+p[1]).join(' ');
  route.innerHTML=`<svg viewBox="0 0 100 ${H}" preserveAspectRatio="none"><path d="${path}" fill="none" stroke="rgba(10,50,60,.35)" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="${path}" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`+html.join('');
  const map=$('map'),cy=pos(S.stop+1)[1];
  map.scrollTop=Math.max(0,cy-map.clientHeight/2);
  mapPara();
  sirketHarita();
  $('m-go').textContent=tr?t('map.continue'):t('map.sail');
}
// zemin rotadan yavaş kayar (dikeyde yinelenir)
function mapPara(){$('map-bg').style.backgroundPosition='0 '+Math.round(-$('map').scrollTop*.5)+'px';}
$('map').addEventListener('scroll',mapPara,{passive:true});
$('route').addEventListener('click',e=>{
  const n=e.target&&e.target.closest?e.target.closest('[data-stop]'):null;if(!n)return;
  const i=+n.getAttribute('data-stop');
  initAudio();
  if(i<=S.stop){SES.cal('dugme');startStop(i);}
  else SES.cal('hata',{vol:.6});
});
$('m-go').onclick=()=>{initAudio();startNext();};
$('m-port').onclick=()=>go('port');
$('m-muhurb').onclick=()=>{initAudio();go('port');};
$('m-gemi').onclick=()=>go('gemi');
for(const id of['m-goldb','p-goldb','g-goldb'])$(id).onclick=()=>{initAudio();SES.cal('dugme',{vol:.6});go('magaza');};
function resetAll(){S=OYUN.newSave();try{localStorage.removeItem(SAVE_KEY);}catch(e){}save();sirketSifirla();go(screen==='title'?'title':'map');}

// js/ana.js — Başlatma: ses kilidi, düğme tık sesi, altın simgeleri, geç görsel yansıması, ilk ekran, service worker. Tanımlar: yok · Kullanır: $, screen, loadSave, ODEME, pic, IMG, shipKey, initAudio, SES, go, Rihtim, SeferUI, SavasUI
"use strict";
/* ================= başlat ve kanca ================= */
for(const ev of['pointerdown','touchend','keydown'])document.addEventListener(ev,initAudio,true);
// düğmelerde tık sesi (kendi sesi olanlar data-sessiz taşır)
document.addEventListener('click',e=>{
  const b=e.target&&e.target.closest?e.target.closest('button'):null;
  if(b&&!b.disabled&&!(b.hasAttribute&&b.hasAttribute('data-sessiz')))SES.cal('dugme',{vol:.6});
},true);
// kasa rozetlerinde altın simgesi
for(const id of['t-goldw'])try{$(id).insertAdjacentHTML('afterbegin',pic('altin','🪙'));}catch(_){}
for(const id of['p-gold','m-gold','g-gold','z-gold','b-lootv'])try{$(id).insertAdjacentHTML('beforebegin',pic('altin','🪙'));}catch(_){}
// geç yüklenen görseller açık tuvale yansısın
IMG.on(()=>{if(screen==='yukleme'){Rihtim.paintBg();SeferUI.redraw();}else if(screen==='savas')SavasUI.repaint();else if(screen==='gemi'&&!IMG.failed(shipKey()))$('g-ship').classList.remove('noimg');});
loadSave();go('title');
// ödeme: kayıt yüklendikten SONRA başlar (Play'den gelen onaylı alım yüklenmiş kayda eklenir); ODEME_ACIK false iken hiçbir şey yapmaz
ODEME.baslat();
// çevrimdışı ve ana ekrana ekleme: yalnız https ya da localhost altında; web sitesi sürümünde (window.__WEB, Yayin/web-derle.sh) kapalı
try{
  const L=typeof location!=='undefined'?location:null;
  if(L&&!window.__WEB&&navigator.serviceWorker&&(L.protocol==='https:'||/^(localhost|127\.0\.0\.1|\[::1\])$/.test(L.hostname)))
    window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
}catch(_){}

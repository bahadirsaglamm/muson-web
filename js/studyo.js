// js/studyo.js — açılışta stüdyo logosu (IronLane Studios): ~2 sn görünür, dokununca geçilir, sonra kendini kaldırır; dil değişimindeki yenilemede gösterilmez. Tanımlar: (yok; kendi kendine çalışır) · Kullanır: #studyo (index.html), css/studyo.css
"use strict";
(function(){
  var el=document.getElementById('studyo');if(!el)return;
  // dil değişince sayfa yenilenir: logo yeniden gösterilmez (js/dil.js dilSec)
  try{if(sessionStorage.getItem('muson-studyo-gec')){sessionStorage.removeItem('muson-studyo-gec');el.parentNode.removeChild(el);window.__studyoKapat=function(){};return;}}catch(_){}
  var bitti=false,SURE=2000;
  function kapat(){
    if(bitti)return;bitti=true;
    el.classList.add('cik');
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},500);
  }
  el.addEventListener('pointerdown',kapat);
  // logo görseli gelmezse yazıyla devam eder; süre sayfa açılınca başlar
  setTimeout(kapat,SURE);
  window.__studyoKapat=kapat;
})();

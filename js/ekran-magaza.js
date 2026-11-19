// js/ekran-magaza.js — Mağaza ekranı (MagazaUI). ODEME_ACIK false iken adı "Hediye"dir ve yalnız günlük hediyeyi gösterir; true iken altın paketleri (Google Play ya da tarayıcıda deneme) ve "geri yükle". Tanımlar: MagazaUI · Kullanır: t, OYUN, $, fmt, S, screen, pic, initAudio, ODEME_ACIK, MZ, URUNLER, EK_HAMLE, ODEME, baslangicAlindi, hediyeAl, magazaAl, go, magazaDon, magazaGeri
"use strict";
/* ================= mağaza / hediye ================= */
const MagazaUI=(()=>{
  const AD=ODEME_ACIK?t('shop.title'):t('shop.gift');
  // ekranın ve onu açan düğmelerin adı (ayar kapalıyken "Hediye"; altın sayacındaki "+" yerine hediye simgesi)
  try{
    $('z-baslik').textContent=AD;$('p-shop').textContent=AD;
    for(const id of['m-goldb','p-goldb','g-goldb']){const b=$(id);if(b.setAttribute)b.setAttribute('aria-label',AD);
      if(!ODEME_ACIK&&b.querySelector){const i=b.querySelector('b');if(i)i.textContent='🎁';}}
  }catch(_){}
  function row(o){
    return `<div class="zrow${o.best?' best':''}"><div class="zi">${o.icon}</div><div class="zt"><div class="zn">${o.n}${o.tags||''}</div><div class="zd">${o.d}</div></div>${o.btn}</div>`;
  }
  const altinPic=()=>pic('altin','🪙');
  const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); // Play'den gelen fiyat metni
  function show(){
    $('z-gold').textContent=t('ui.gold',{n:S.gold});
    const h=OYUN.effects(S.port,S.ship).hediye,out=[];
    if(ODEME_ACIK){
      const k=ODEME.kip,d=ODEME.durum;
      out.push(`<div class="znote">${t(k==='deneme'?'shop.note.demo':d==='yok'?'shop.note.offline':d==='hazirlaniyor'?'shop.note.loading':'shop.note.play')}</div>`);
      out.push(`<div class="zh">${t('shop.free')}</div>`);
    }
    out.push(row({icon:'🎁',n:t('shop.daily'),d:t('shop.dailyText',{n:h}),
      btn:MZ.hediyeHazir?`<button class="primary" data-z="hediye" data-sessiz>${t('shop.claim')}<small>+${fmt(h)}</small></button>`:`<button disabled>${t('shop.tomorrow')}<small>${t('shop.claimed')}</small></button>`}));
    if(ODEME_ACIK){
      out.push(`<div class="zh">${t('shop.packs')}</div>`);
      const deneme=ODEME.kip==='deneme';
      for(const u of URUNLER){
        if(u.tek&&baslangicAlindi())continue; // başlangıç paketi tek seferlik: alınınca kalkar
        const b=ODEME.bilgi(u);
        const d=u.jeton?t('shop.packTokens',{gold:u.altin,n:u.jeton}):t('ui.gold',{n:u.altin});
        const tags=`${deneme?`<span class="tag">${t('shop.demoTag')}</span>`:''}${u.best?`<span class="tag best">${t('shop.best')}</span>`:''}`;
        out.push(row({icon:u.altin&&!u.jeton?altinPic():u.e,n:u.n,d,tags,best:u.best,
          btn:`<button class="primary" data-z="al" data-id="${u.id}" data-sessiz${b.hazir?'':' disabled'}>${esc(b.fiyat)}${deneme?`<small>${t('shop.demoTag')}</small>`:''}</button>`}));
      }
    }
    if(S.jeton)out.push(`<div class="znote">${t('shop.tokens',{n:S.jeton})}</div>`);
    if(ODEME_ACIK)out.push(`<div class="znote"><button class="zlink" data-z="geri">${t('shop.restore')}</button></div>`);
    $('z-list').innerHTML=out.join('');
  }
  // kasa sayacı yükselerek artar (satın alım ve hediyede)
  let anim=0;
  function sayac(a,b){
    const my=++anim,t0=performance.now(),D=900;
    const adim=()=>{if(my!==anim||screen!=='magaza')return;const k=Math.min(1,(performance.now()-t0)/D);
      $('z-gold').textContent=t('ui.gold',{n:Math.round(a+(b-a)*(1-Math.pow(1-k,3)))});if(k<1)requestAnimationFrame(adim);};
    requestAnimationFrame(adim);
  }
  // once: değişiklikten önceki altın (verilirse sayaç oradan yükselir)
  function refresh(once){if(screen!=='magaza')return;show();if(typeof once==='number'&&once<S.gold){$('z-gold').textContent=t('ui.gold',{n:once});sayac(once,S.gold);}}
  $('z-list').addEventListener('click',e=>{
    const b=e.target&&e.target.closest?e.target.closest('[data-z]'):null;if(!b||b.disabled)return;
    initAudio();const k=b.getAttribute('data-z');
    if(k==='hediye')hediyeAl();
    else if(k==='al')magazaAl(b.getAttribute('data-id'));
    else if(k==='geri')ODEME.geriYukle();
  });
  // geri: kurtarma penceresinden açıldıysa pencereye dönülür
  $('z-back').onclick=()=>{if(magazaGeri){const f=magazaGeri;magazaGeri=null;f();}else go(magazaDon||'map');};
  return{show,refresh,AD};
})();

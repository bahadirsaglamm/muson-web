// js/varlik.js — Savaş dışı görsel yükleyici (IMG) ve görsel yardımcıları (pic, gemi, kaptan portresi). Tanımlar: IMG, pic, malPic, shipTier, shipKey, shipBig, kaptanPic · Kullanır: SEFER, OYUN, GOODS, S
"use strict";
/* ---------- görseller (savaş dışı): arka planda yüklenir; yüklenemeyenin yerine emoji ya da kodla çizim ---------- */
const IMG=(()=>{
  const FILES={};
  for(const g of SEFER.GOOD_KEYS)FILES['mal_'+g]='assets/mallar/'+g+'.png';
  for(const f of['harita_bg.jpg','sehir1.png','sehir2.png','gemi1.png','gemi2.png','gemi3.png','gemi4.png','pazar_bg.jpg','liman_bg.jpg','bina_depo.png','bina_pazar.png','bina_tersane.png','bina_dokumhane.png',
    'gemi1_b.png','gemi2_b.png','gemi3_b.png','gemi4_b.png','kaptan_biz.png','kaptan_korsan.png','rihtim_dikey.jpg','savas_dikey.jpg'])
    FILES[f.replace(/\..*$/,'')]='assets/ui/'+f;
  // yatay düzenin (yalnız web sitesi sürümü) geniş rıhtım zemini: telefonda ve Android'de hiç yüklenmez;
  // savaşın yatay düzenindeki güverte (küpeştenin altı) de öyle
  try{if(window.__WEB){FILES.rihtim_genis='assets/ui/rihtim_genis.jpg';FILES.guverte_genis='assets/savas/guverte_genis.jpg';}}catch(_){}
  FILES.ikon='assets/ikon-512.png';
  FILES.korsan='assets/savas/korsan.png';FILES.altin='assets/savas/altin.png';
  const img={},st={},subs=[];
  const note=()=>{for(const f of subs)try{f();}catch(_){}};
  for(const k in FILES){
    st[k]=0;
    try{
      if(typeof Image==='undefined'){st[k]=-1;continue;}
      const im=new Image();
      im.onload=()=>{st[k]=1;note();};
      im.onerror=()=>{st[k]=-1;note();};
      im.src=FILES[k];img[k]=im;
    }catch(_){st[k]=-1;}
  }
  const cnt=v=>Object.keys(st).filter(k=>st[k]===v).length;
  return{src:k=>FILES[k],get:k=>st[k]===1?img[k]:null,failed:k=>st[k]===-1,on:f=>subs.push(f),
    get toplam(){return Object.keys(FILES).length;},get yuklenen(){return cnt(1);},get hatali(){return cnt(-1);}};
})();
// DOM içinde görsel; yüklenemezse emoji görünür
function pic(k,emo,cls){
  return `<span class="pic-w${cls?' '+cls:''}${IMG.failed(k)?' noimg':''}"><img src="${IMG.src(k)}" alt="" draggable="false" onerror="this.parentNode.classList.add('noimg')"><i class="emo">${emo||''}</i></span>`;
}
const malPic=g=>pic('mal_'+g,GOODS[g].e,'mi');
// oyuncunun gemisi: görünüş kademesi (0-3) ve görsel anahtarı
const shipTier=()=>OYUN.shipTier(S.ship);
const shipKey=k=>'gemi'+(1+(k==null?shipTier():k));
// büyük gösterimde (~200 px üstü) gemi: önce büyük boy (_b), yoksa küçük
const shipBig=k=>IMG.get(shipKey(k)+'_b')||IMG.get(shipKey(k));
// yuvarlak çerçevede kaptan portresi (yüklenemezse emoji)
const kaptanPic=(k,emo)=>`${IMG.failed(k)?'':`<img src="${IMG.src(k)}" alt="" draggable="false" onerror="this.parentNode.classList.add('noimg')">`}<i class="emo">${emo}</i>`;

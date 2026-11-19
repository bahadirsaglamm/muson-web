// js/ortak.js — Ortak arayüz: $, biçimleme, mal tablosu, kayıt (S), pencere (modal) ve onay kutusu; mantıktaki kimliklerin görünen adları (şehir, gemi kademesi, koşul, unvan, yapı, işletme ve gemi parçası etkisi, armağan, şirket adı). Tanımlar: $, fmt, pctf, pct, SAVE_KEY, S, screen, AC, GOODS, TIER_NAME, RM, gemiAdi, kosulAd, kosulTip, ozelHedefAd, unvanAd, yapiAd, isletmeEtki, parcaEtki, armaganYazi, sirketAdi, loadSave, save, modalActs, modalOn, modalGuard, showModal, hideModal, modalAct, confirmBox, jingle · Kullanır: OYUN, SES, SIRKET, t, sayi, dilUygula
"use strict";
/* ================= ortak arayüz ================= */
const $=id=>document.getElementById(id);
// sayılar seçili dilin biçimiyle (js/dil.js): fmt tam sayı, pctf en çok iki ondalık, pct yüzde ("+%10" / "+10%")
const fmt=n=>sayi(Math.round(n));
const pctf=x=>sayi(Math.round(x*100)/100);
const pct=n=>t('ui.pctPlus',{n:Math.round(n)});
// index.html'deki sabit metinler (data-t) ilk arayüz betiğinde yazılır; sonraki betikler bazılarını kendileri günceller
dilUygula();
const SAVE_KEY='muson-oyun';
let S=OYUN.newSave(),screen='title',AC=null;
// mallar: n görünen ad (başlık biçimi), s cümle içi biçim (ör. "+3 baharat"), c renk, e emoji
const GOODS={
  baharat:{c:'#d8483a',e:'🌶️'},
  su:{c:'#3b8fe2',e:'💧'},
  tuz:{c:'#eef0ee',e:'🧂'},
  ipek:{c:'#8d5bd1',e:'🧵'},
  kahve:{c:'#7a5238',e:'☕'},
  barut:{c:'#4a4f58',e:'🧨'},
  tavuk:{c:'#f1c232',e:'🐔'},
  cay:{c:'#4dab5c',e:'🍃'}
};
for(const g in GOODS){GOODS[g].n=t('goods.'+g);GOODS[g].s=t('goods.'+g+'.s');}
// istif derecesi (Dağınık / Düzgün / Usta)
const TIER_NAME={usta:t('grade.usta'),duzgun:t('grade.duzgun'),daginik:t('grade.daginik')};
/* ---------- mantıktaki kimliklerin görünen adları (mantık dosyaları dilden bağımsız) ---------- */
OYUN.adlar.sehir=id=>t('city.'+id);
const gemiAdi=k=>t('ship.tier.'+OYUN.tierName(k));
const kosulAd=id=>t('cond.'+id+'.name');
// özel siparişin hedefi: {tur:'cift'|'saf'|'hamle', hedef}
const ozelHedefAd=o=>o?t('cond.ozel.'+o.tur,{n:o.hedef}):'';
// koşulun açıklaması (kaptanın balonu); özel siparişte hedef de eklenir
const kosulTip=K=>t('cond.'+K.id+'.tip')+(K.ozel?' '+t('cond.target',{x:ozelHedefAd(K.ozel)}):'');
const unvanAd=lv=>t('title.'+SIRKET.unvan(lv));
const yapiAd=id=>t('building.'+id);
// işletme (Depo, Pazar, Tersane, Dökümhane) ve gemi parçası (Gövde, Toplar, Ambar) etkisi k. kademede
function isletmeEtki(id,k){
  const n=id==='depo'?OYUN.HEDIYE[k]:id==='pazar'?10*k:id==='tersane'?5*k:2*k;
  return t('business.'+id+'.eff',{n});
}
function parcaEtki(id,k){return t('ship.part.'+id+'.eff',{n:id==='govde'?4*k:id==='toplar'?10*k:k});}
// armağan: {altin, jeton} → "200 altın + 1 ek hamle jetonu"
function armaganYazi(a){
  const p=[];if(a&&a.altin)p.push(t('ui.gold',{n:a.altin}));if(a&&a.jeton)p.push(t('ui.tokens',{n:a.jeton}));
  return p.join(' + ');
}
// şirket adı: kayıtta boşsa dilin varsayılan adı ("Muson Kumpanyası", "Muson Trading Co.")
const sirketAdi=st=>(st&&st.ad)||t('company.default');
// hareket azaltma tercihi: salınım ve parçacıklar kısılır
const RM=(()=>{try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(_){return false;}})();

// S.odeme (satın alımlarda teslim edilen işlem kimlikleri) OYUN.sanitize'ın dışında taşınır: ödül ile kimlik aynı kayıtta durur (çift ödül olmasın)
function loadSave(){try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const o=JSON.parse(raw);S=OYUN.sanitize(o);
  if(o&&Array.isArray(o.odeme))S.odeme=o.odeme.filter(x=>x&&typeof x.t==='string'&&typeof x.u==='string').slice(-200).map(x=>({t:x.t,u:x.u}));}}catch(e){S=OYUN.newSave();}}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}

// pencere: düğmeler data-act ile acts içindeki işleve bağlanır
let modalActs={},modalOn=false,modalGuard=0;
function showModal(html,acts){modalActs=acts||{};$('card').innerHTML=html;const m=$('modal');m.classList.remove('voy','wait');m.classList.add('on');modalOn=true;}
function hideModal(){$('modal').classList.remove('on','voy','wait');modalOn=false;modalActs={};}
function modalAct(name){const f=modalActs[name];if(f)f();return!!f;}
$('card').addEventListener('click',e=>{
  const b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
  if(b&&performance.now()>=modalGuard)modalAct(b.getAttribute('data-act'));
});
function confirmBox(title,text,okLabel,onOk){
  showModal(`<h2>${title}</h2><p>${text}</p><div class="row"><button data-act="no">${t('ui.cancel')}</button><button class="primary" data-act="yes">${okLabel}</button></div>`,
    {no:hideModal,yes:()=>{hideModal();onOk();}});
}
// kazanma/kaybetme penceresi: ezgi çalar, müzik kısılır
function jingle(win){SES.cal(win?'kazandin':'kaybettin',{sabit:true});SES.duck(win?3800:4600);}

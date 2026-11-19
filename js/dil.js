// js/dil.js — Dil: seçim (DIL), sözlükler (DIL_SOZLUK, dil/<kod>.js), çeviri t(), çoğul, sayı biçimi (sayi), yazı tipi zinciri (DIL_YAZI), sayfadaki data-t metinleri (dilUygula), dil değiştirme (dilSec). Diğer betiklerden önce yüklenir. Tanımlar: DIL_SOZLUK, DIL_KEY, DIL, DIL_BILGI, DIL_YEREL, DIL_YAZI, dilKodu, dilBul, t, tx, sayi, dilUygula, dilSec · Kullanır: DILLER (dil/diller.js)
"use strict";
/* ================= dil =================
   Sözlük dosyaları: dil/<kod>.js, her biri DIL_SOZLUK['<kod>']={ 'anahtar':'metin', ... } (düz anahtar → metin).
   t('anahtar', {ad:'x', n:3}) → metin; {ad} biçiminde yer tutucular. Sayı olan değişken o dilin biçimiyle yazılır (1,180 / 1.180).
   Çoğul: değişkenlerde sayı olan n varsa önce 'anahtar_<kategori>' (Intl.PluralRules: one, few, many, other…), sonra 'anahtar_other', sonra 'anahtar' aranır.
   Eksik anahtar İngilizceye, o da yoksa anahtarın kendisine düşer (konsola bir kez uyarı).
   Dil seçimi: kayıtlı seçim (localStorage 'muson-dil') → cihaz dili (navigator.languages) → İngilizce. Seçim değişince sayfa yenilenir (kayıt korunur). */
var DIL_SOZLUK=(typeof window!=='undefined'&&window.DIL_SOZLUK)||{};
const DIL_KEY='muson-dil';
// 'pt-BR' → 'pt', 'zh-Hant-TW' → 'zh', 'in' (eski Endonezce kodu) → 'id'; desteklenmiyorsa null
function dilKodu(x){
  if(typeof x!=='string'||!x)return null;
  let b=x.trim().toLowerCase().replace(/_/g,'-').split('-')[0];
  if(b==='in')b='id';
  return DILLER.some(d=>d.kod===b)?b:null;
}
function dilBul(){
  let k=null;
  try{k=dilKodu(localStorage.getItem(DIL_KEY));}catch(_){}
  if(k)return k;
  try{
    const n=typeof navigator!=='undefined'&&navigator||{};
    const L=n.languages&&n.languages.length?n.languages:[n.language||n.userLanguage||''];
    for(const x of L){const c=dilKodu(x);if(c)return c;}
  }catch(_){}
  return 'en';
}
const DIL=dilBul();
const DIL_BILGI=DILLER.find(d=>d.kod===DIL)||DILLER[0];
const DIL_YEREL=DIL_BILGI.yerel||DIL;
// yazı tipi zinciri: ortak yuvarlak yazı + dile özgü (CJK) sistem yazı tipleri; CSS (--yazi) ve kanvas (CILA.YAZI) aynısını kullanır
const DIL_YAZI='ui-rounded,"SF Pro Rounded","Arial Rounded MT Bold",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI"'+(DIL_BILGI.yazi?','+DIL_BILGI.yazi:'')+',sans-serif';
// geliştirmede (localhost, APK değil) bu dilin sözlüğünde olmayan anahtar da uyarılır
const DIL_GELISTIRME=(()=>{try{return !window.__APK&&/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);}catch(_){return false;}})();

// sözlükler: İngilizce (yedek) her zaman, seçili dil ayrıca; ayrıştırma sırasında bu betiğin hemen ardından yüklenir
(function(){
  try{
    if(typeof document==='undefined'||typeof document.write!=='function')return;
    const yaz=k=>document.write('<script src="dil/'+k+'.js"><\/script>');
    yaz('en');if(DIL!=='en')yaz(DIL);
  }catch(_){}
})();
// sayfanın dili ve yazı tipi (CJK yazı tipi seçimi ve heceleme buna bakar)
try{const h=document.documentElement;h.lang=DIL_YEREL;h.style.setProperty('--yazi',DIL_YAZI);}catch(_){}

const SAYI_BICIM=(()=>{try{return new Intl.NumberFormat(DIL_YEREL,{maximumFractionDigits:2});}catch(_){return null;}})();
function sayi(x){
  x=+x;if(!isFinite(x))return String(x);
  if(SAYI_BICIM)try{return SAYI_BICIM.format(x);}catch(_){}
  return String(Math.round(x*100)/100);
}
const COGUL={};
function cogulKat(n,kod){
  try{const L=(DILLER.find(d=>d.kod===kod)||{}).yerel||kod;return(COGUL[kod]||(COGUL[kod]=new Intl.PluralRules(L))).select(n);}
  catch(_){return n===1?'one':'other';}
}
function sozlukBul(kod,k,n){
  const s=DIL_SOZLUK[kod];if(!s)return undefined;
  if(n!=null){const c=cogulKat(n,kod);if(s[k+'_'+c]!=null)return s[k+'_'+c];if(s[k+'_other']!=null)return s[k+'_other'];}
  return s[k];
}
const DIL_UYARI={};
function dilUyar(k,neden){if(DIL_UYARI[k])return;DIL_UYARI[k]=1;try{console.warn('[dil] '+neden+': '+k);}catch(_){}}
function t(k,v){
  const n=v&&typeof v.n==='number'?v.n:null;
  let s=sozlukBul(DIL,k,n);
  if(s==null&&DIL!=='en'){if(DIL_GELISTIRME&&DIL_SOZLUK[DIL])dilUyar(k,'not in '+DIL+' dictionary');s=sozlukBul('en',k,n);}
  if(s==null){dilUyar(k,'missing key');s=k;}
  s=String(s);
  if(v)s=s.replace(/\{(\w+)\}/g,(m,a)=>Object.prototype.hasOwnProperty.call(v,a)?(typeof v[a]==='number'?sayi(v[a]):String(v[a])):m);
  return s;
}
// tx: t'nin eşi; yerel değişkeni t olan (ör. yolculuk bilgisi) işlevlerde kullanılır
const tx=t;
// index.html'deki sabit metinler: data-t (içerik, HTML olabilir), data-t-aria (aria-label), data-t-content (meta content)
function dilUygula(){
  try{
    if(typeof document.querySelectorAll!=='function')return;
    for(const e of document.querySelectorAll('[data-t]'))e.innerHTML=t(e.getAttribute('data-t'));
    for(const e of document.querySelectorAll('[data-t-aria]'))e.setAttribute('aria-label',t(e.getAttribute('data-t-aria')));
    for(const e of document.querySelectorAll('[data-t-content]'))e.setAttribute('content',t(e.getAttribute('data-t-content')));
  }catch(_){}
}
// dil değiştir: seçim kaydedilir, sayfa yenilenir (oyun kaydı localStorage'da durur; stüdyo logosu yeniden gösterilmez)
function dilSec(kod){
  if(!DILLER.some(d=>d.kod===kod))return false;
  try{localStorage.setItem(DIL_KEY,kod);}catch(_){}
  if(kod===DIL)return false;
  try{sessionStorage.setItem('muson-studyo-gec','1');}catch(_){}
  try{location.reload();}catch(_){}
  return true;
}

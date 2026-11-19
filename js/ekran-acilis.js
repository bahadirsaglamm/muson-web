// js/ekran-acilis.js — Açılış ekranı, önyükleme göstergesi, ayarlar penceresi (ses, müzik, dil seçici, sıfırla) ve gizlilik özeti. Tanımlar: renderTitle, varlik, loadWatch, watchLoad, ayarlar, dilPenceresi, gizlilikGoster · Kullanır: t, DIL, DILLER, dilSec, $, S, ODEME_ACIK, showModal, hideModal, confirmBox, pic, IMG, SES, initAudio, go, resetAll, SAVAS_IMG
"use strict";
/* ================= açılış ve ayarlar ================= */
function renderTitle(){
  $('ti-play').textContent=(S.stop>0||S.trip)?t('start.continue'):t('start.play');
  if(!$('ti-logo').innerHTML)$('ti-logo').innerHTML=pic('ikon','⛵');
  watchLoad();
}
// önyükleme göstergesi: görseller ve efekt sesleri
function varlik(){
  const sv=SAVAS_IMG.durum;
  return{toplam:IMG.toplam+sv.toplam+SES.load.toplam,yuklenen:IMG.yuklenen+sv.yuklenen+SES.load.yuklenen,hatali:IMG.hatali+sv.hatali+SES.load.hatali};
}
let loadWatch=0;
function watchLoad(){
  if(loadWatch)return;loadWatch=1;const t0=performance.now();
  const st=()=>{
    const v=varlik(),k=v.toplam?(v.yuklenen+v.hatali)/v.toplam:1;
    $('ti-bar').style.width=Math.round(100*k)+'%';
    if(k>=1||performance.now()-t0>20000){$('ti-load').classList.add('done');loadWatch=0;return;}
    setTimeout(st,150);
  };
  st();
}
// web sürümünde (oyun siteleri) ilk kez gelen oyuncu haritayı ve tanıtım metnini atlayıp doğrudan ilk yolculuğa girer: siteler oyuncunun hemen
// oyuna girmesini istiyor (Bahadır, 19 Kasım: "Yalnız web'de atla"). Telefon ve Play akışı aynı: Oyna → harita → Yelken aç.
$('ti-play').onclick=()=>{initAudio();
  if(window.__WEB&&S.stop===0&&!S.trip&&!(S.stops&&S.stops.length)&&startNext())return;
  go('map');};
function ayarlar(){
  const dilAd=(DILLER.find(d=>d.kod===DIL)||DILLER[0]).ad;
  const yaz=()=>showModal(`<h2>${t('settings.title')}</h2>
    <div class="set"><span>${t('settings.sfx')}</span><button class="tog${SES.sesAcik?' on':''}" data-act="ses">${SES.sesAcik?t('settings.on'):t('settings.off')}</button></div>
    <div class="set"><span>${t('settings.music')}</span><button class="tog${SES.muzikAcik?' on':''}" data-act="muzik">${SES.muzikAcik?t('settings.on'):t('settings.off')}</button></div>
    <div class="set"><span>${t('settings.language')}</span><button class="tog dil" data-act="dil" lang="${(DILLER.find(d=>d.kod===DIL)||{}).yerel||DIL}">${dilAd} ›</button></div>
    <div class="row mt"><button class="tehlike" data-act="reset">${t('settings.reset')}</button><button class="primary" data-act="close">${t('ui.close')}</button></div>
    <p style="margin:12px 0 0;font-size:13px;opacity:.85"><a href="#" data-act="gizlilik" style="color:inherit;text-decoration:underline">${t('settings.privacy')}</a> · IronLane Studios · Muson 1.0.2</p>`,
    {gizlilik:gizlilikGoster,dil:dilPenceresi,
     ses:()=>{SES.set('ses',!SES.sesAcik);yaz();if(SES.sesAcik)SES.cal('dugme');},
     muzik:()=>{SES.set('muzik',!SES.muzikAcik);yaz();},
     close:hideModal,
     reset:()=>confirmBox(t('settings.resetTitle'),t('settings.resetText')+' '+(ODEME_ACIK?t('settings.resetKeepPaid'):t('settings.resetKeep')),t('settings.reset'),resetAll)});
  initAudio();yaz();
}
// dil seçici: 12 dil, her biri kendi adıyla; seçilince kaydedilir ve sayfa yenilenir (kayıt korunur)
function dilPenceresi(){
  const acts={geri:ayarlar,close:hideModal};
  const btns=DILLER.map(d=>{acts['dil-'+d.kod]=()=>{if(d.kod===DIL){ayarlar();return;}hideModal();dilSec(d.kod);};
    return `<button class="${d.kod===DIL?'primary':''}" data-act="dil-${d.kod}" lang="${d.yerel}">${d.ad}</button>`;}).join('');
  showModal(`<h2>${t('settings.language')}</h2><div class="dil-izgara">${btns}</div>
    <div class="row mt"><button data-act="geri">${t('ui.back')}</button></div>`,acts);
}
// Gizlilik politikası (uygulama içi özet; web sitesi sürümünde p2, p4, p5 tarayıcıya göre yazılmış privacy.web.* metinleri; tam metin Yayin/gizlilik-politikasi.html ile aynı içerik, mağazadaki bağlantıda yayımlanır)
function gizlilikGoster(){
  showModal(`<h2>${t('privacy.title')}</h2>
    <div style="text-align:left;font-size:14px;line-height:1.45;max-height:52vh;overflow:auto">
    <p>${t('privacy.p1')}</p>
    <p>${t(window.__WEB?'privacy.web.p2':'privacy.p2')}</p>
    <p>${t('privacy.p3')}</p>
    <p>${t(window.__WEB?'privacy.web.p4':'privacy.p4')}</p>
    <p style="opacity:.8">${t(window.__WEB?'privacy.web.p5':'privacy.p5')}</p>
    </div>
    <div class="row mt"><button data-act="geri">${t('ui.back')}</button><button class="primary" data-act="close">${t('ui.close')}</button></div>`,
    {geri:ayarlar,close:hideModal});
}
$('ti-ayar').onclick=ayarlar;
$('m-ayar').onclick=ayarlar;

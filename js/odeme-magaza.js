// js/odeme-magaza.js — Ödeme ayarı (ODEME_ACIK), mağaza ürünleri ve kaydı (MZ), ödeme bağdaştırıcısı (ODEME: Google Play ya da tarayıcıda deneme), satın alım teslimi, günlük hediye, kurtarma bedelleri, kısa bildirim. Tanımlar: ODEME_ACIK, PLAY_URUN, URUNLER, MZ_KEY, EK_HAMLE, EK_HAMLE_ALTIN, KURTAR_EN_AZ, MZ, ODEME, urunBul, kurtarBedeli, teslim, magazaAl, hediyeAl, bildir · Kullanır: t, tx, OYUN, S, save, SES, vib, fmt, showModal, hideModal, MagazaUI, muhurTost
"use strict";
/* ================= ödeme ve mağaza ================= */
// İLK YAYIN AYARI. false: oyunda hiçbir ödeme yoktur. Mağaza ekranı yalnız günlük hediyeyi gösterir ve "Hediye" adını taşır;
// ürünler, fiyatlar ve "geri yükle" görünmez; CdvPurchase (Google Play) hiç başlatılmaz; tarayıcıdaki deneme ödeme kipi de kapalıdır;
// kurtarmalarda "Altın al" düğmesi çıkmaz. true: aşağıdaki bütün ödeme davranışı açılır (ikinci sürüm).
const ODEME_ACIK=false;

// Google Play Console'daki ürün kimlikleri (hepsi tüketilebilir / consumable). Play Console'da AYNEN bu adlarla oluşturulur.
const PLAY_URUN={kese:'muson_kese',sandik:'muson_sandik',hazine:'muson_hazine',baslangic:'muson_baslangic'};
// deneme: tarayıcıdaki deneme kipinde gösterilen temsilî fiyat (Play kipinde fiyat Play'den gelir)
// n: görünen ad (dil sözlüğü shop.pack.<id>: Kese, Sandık, Hazine, Başlangıç paketi)
const URUNLER=[
  {id:'kese',play:PLAY_URUN.kese,altin:2000,deneme:'₺39,99',e:'💰'},
  {id:'sandik',play:PLAY_URUN.sandik,altin:6000,deneme:'₺99,99',e:'🧰'},
  {id:'hazine',play:PLAY_URUN.hazine,altin:15000,deneme:'₺199,99',e:'👑',best:true},
  {id:'baslangic',play:PLAY_URUN.baslangic,altin:4000,jeton:5,deneme:'₺29,99',e:'🎁',tek:true} // tek seferlik (yerel bayrak)
];
for(const u of URUNLER)u.n=t('shop.pack.'+u.id);
const urunBul=id=>URUNLER.find(u=>u.id===id||u.play===id)||null;

// kurtarma bedelleri: +5 hamle ve "ambarda yer aç" aynı fiyat; savaş kaybında yük kurtarma yağmalanacak yükün satış değerinin yarısı (en az 300)
const EK_HAMLE=5,EK_HAMLE_ALTIN=900,KURTAR_EN_AZ=300;
function kurtarBedeli(tr){
  if(!tr||!tr.cargo)return KURTAR_EN_AZ;
  const once=OYUN.saleQuote(tr,S.port).total,k=JSON.parse(JSON.stringify(tr));
  OYUN.plunderCargo(k.cargo);
  const kayip=Math.max(0,once-OYUN.saleQuote(k,S.port).total);
  return Math.max(KURTAR_EN_AZ,Math.round(kayip/2/10)*10);
}

// Mağaza kaydı ayrı anahtarda ("Sıfırla" ilerlemeyi siler, bunu silmez): günlük hediye günü, başlangıç paketi bayrağı,
// teslim edilen işlem kimlikleri (son 200). Eski kayıttaki reklam alanları (gun, reklam, mreklam) sessizce yok sayılır;
// eski "reklamsiz" alımı yalnız bayrak olarak kalır, etkisi yoktur.
const MZ_KEY='muson-magaza',ISLEM_MAX=200;
const MZ=(()=>{
  const st={hediye:'',baslangic:false,reklamsiz:false,islem:[]};
  try{const a=JSON.parse(localStorage.getItem(MZ_KEY)||'null');
    if(a&&typeof a==='object'){st.hediye=String(a.hediye||'');st.baslangic=!!a.baslangic;st.reklamsiz=!!a.reklamsiz;
      if(Array.isArray(a.islem))st.islem=a.islem.filter(x=>typeof x==='string').slice(-ISLEM_MAX);}}catch(_){}
  const iki=n=>(n<10?'0':'')+n;
  function bugun(){const d=new Date();return d.getFullYear()+'-'+iki(d.getMonth()+1)+'-'+iki(d.getDate());}
  function kaydet(){try{localStorage.setItem(MZ_KEY,JSON.stringify(st));}catch(_){}}
  return{st,bugun,kaydet,get hediyeHazir(){return st.hediye!==bugun();}};
})();
// oyun kaydındaki teslim listesi (S.odeme: [{t: işlem kimliği, u: ürün}]); ortak.js loadSave taşır
const odemeListe=()=>Array.isArray(S.odeme)?S.odeme:(S.odeme=[]);
function verildi(t){return MZ.st.islem.includes(t)||odemeListe().some(x=>x.t===t);}
function baslangicAlindi(){return MZ.st.baslangic||odemeListe().some(x=>x.u==='baslangic');}

// Satın alımın ödülü: tek bir işlem kimliği yalnız bir kez ödül verir.
// Sıra (çökmeye dayanıklı): 1) altın, jeton ve işlem kimliği AYNI oyun kaydına tek yazımla girer; 2) mağaza kaydına da işlenir;
// 3) ancak bundan sonra çağıran Play'e "tamamlandı" (finish) der. 1'den önce çökerse Play işlemi açılışta yeniden verir (kayıp yok);
// 1'den sonra çökerse kimlik kayıtta olduğundan ikinci ödül verilmez, yalnız finish yinelenir (çift ödül yok).
function teslim(t,id,adet){
  const u=urunBul(id);t=String(t||'');
  if(!u||!t||verildi(t))return false;
  const n=Math.max(1,adet|0),altin=(u.altin|0)*n,jeton=(u.jeton|0)*n,once=S.gold;
  if(altin){S.gold+=altin;S.denemeAltin=(S.denemeAltin|0)+altin;} // denemeAltin: mağazadan gelen altın (ekonomi ölçümünden ayrı)
  if(jeton)S.jeton=(S.jeton|0)+jeton;
  const L=odemeListe();L.push({t,u:u.id});if(L.length>ISLEM_MAX)L.splice(0,L.length-ISLEM_MAX);
  save();
  MZ.st.islem.push(t);if(MZ.st.islem.length>ISLEM_MAX)MZ.st.islem.splice(0,MZ.st.islem.length-ISLEM_MAX);
  if(u.tek)MZ.st.baslangic=true;
  MZ.kaydet();
  SES.cal('satis');vib([12,30,12]);
  try{MagazaUI.refresh(once);}catch(_){}
  return true;
}

// kısa bildirim (şirket ekranının tost öğesi)
function bildir(m){try{muhurTost('<b>'+m+'</b>','insa');}catch(_){}ODEME.son=m;}

/* ---------- ödeme bağdaştırıcısı ----------
   kip: 'kapali' (ODEME_ACIK false) | 'deneme' (tarayıcı; eklenti yok) | 'play' (Android; cordova-plugin-purchase, CdvPurchase)
   durum (yalnız play): 'hazirlaniyor' | 'hazir' | 'yok' (eklenti gelmedi ya da mağaza açılmadı)
   al(id) -> Promise<'tamam'|'bekliyor'|'iptal'|'hata'|'yok'>; 'tamam' Play'de ödeme ekranının başarıyla kapandığını söyler,
   ödül "approved" olayında teslim() ile verilir.
   Sunucu tarafı makbuz doğrulaması YOK (bu sürümde kabul edildi): eklentinin Google Play için yerel imza doğrulaması bulunmuyor;
   ödül Play'in "approved" bildirimine güvenilerek verilir. */
const ODEME={
  kip:'kapali',durum:'',hizliOnay:false,son:'',mesgul:false,sonBekleyen:null,
  C:null,store:null,bekleyen:new Set(),
  // kip seçimi: yerel uygulamada (APK / Capacitor / Cordova) deviceready + window.CdvPurchase beklenir (en çok 8 sn).
  // Tarayıcıda deneme kipi hemen seçilir. Yerel uygulamada eklenti gelmezse deneme kipine DÜŞÜLMEZ (bedava altın olmasın): mağaza "ulaşılamıyor" der.
  baslat(){
    if(!ODEME_ACIK){this.kip='kapali';return;}
    const W=typeof window!=='undefined'?window:{};
    let yerel=false;
    try{yerel=!!(W.__APK||W.cordova||W.CdvPurchase||(W.Capacitor&&typeof W.Capacitor.isNativePlatform==='function'&&W.Capacitor.isNativePlatform()));}catch(_){}
    if(!yerel){this.kip='deneme';return;}
    this.kip='play';this.durum='hazirlaniyor';
    let bitti=false;
    const kur=()=>{if(bitti)return;bitti=true;this.playKur(W.CdvPurchase);};
    try{document.addEventListener('deviceready',kur,false);}catch(_){}
    setTimeout(kur,8000);
  },
  playKur(C){
    if(!C||!C.store){this.durum='yok';this.yenile();return;}
    this.C=C;const st=this.store=C.store,P=C.Platform.GOOGLE_PLAY;
    try{
      st.register(URUNLER.map(u=>({id:u.play,type:C.ProductType.CONSUMABLE,platform:P})));
      st.when()
        .productUpdated(()=>this.yenile())
        .initiated(t=>{if(t&&t.isPending)this.bekliyor(t);})   // Google Play'de bekleyen ödeme "initiated + isPending" gelir
        .pending(t=>this.bekliyor(t))
        .approved(t=>this.onaylandi(t));
      if(typeof st.error==='function')st.error(()=>{}); // hatalar order() sonucunda kullanıcıya söylenir
      Promise.resolve(st.initialize([P])).then(()=>{this.durum='hazir';this.yenile();},()=>{this.durum='yok';this.yenile();});
    }catch(_){this.durum='yok';this.yenile();}
  },
  yenile(){try{MagazaUI.refresh();}catch(_){}},
  anahtar(t){return String((t&&(t.purchaseId||t.transactionId))||'');}, // purchaseToken; bekleyen ödemede orderId sonradan gelebilir
  bekliyor(t){
    const k=this.anahtar(t);if(!k||verildi(k))return;
    this.sonBekleyen=t.products&&t.products[0]&&t.products[0].id||null;
    if(this.bekleyen.has(k))return;
    this.bekleyen.add(k);bildir(tx('shop.msg.pending'));this.yenile();
  },
  // onaylanan satın alım: ödül ver ve kaydet, SONRA finish (tüketilebilir için consume = Play onayı; 3 gün içinde yapılmazsa iade edilir).
  // Aynı işlem yeniden gelirse (açılışta, yenilemede) ödül verilmez, yalnız finish yinelenir.
  onaylandi(t){
    if(!t||t.isPending)return;
    const k=this.anahtar(t),pid=t.products&&t.products[0]&&t.products[0].id,u=urunBul(pid);
    if(!k||!u)return; // tanınmayan ürün: dokunulmaz
    const yeni=teslim(k,u.id,t.quantity||1);
    this.bekleyen.delete(k);
    if(yeni){const g=u.altin*Math.max(1,t.quantity|0||1);bildir(u.jeton?tx('shop.msg.gotTokens',{name:u.n,gold:g,n:u.jeton}):tx('shop.msg.got',{name:u.n,gold:g}));}
    try{Promise.resolve(t.finish()).catch(()=>{});}catch(_){}
    this.yenile();
  },
  // ürünün mağazadaki hâli: {fiyat, hazir}
  bilgi(u){
    if(this.kip==='deneme')return{fiyat:u.deneme,hazir:!this.mesgul};
    if(this.kip!=='play'||this.durum!=='hazir'||!this.store)return{fiyat:'—',hazir:false};
    let p=null;try{p=this.store.get(u.play,this.C.Platform.GOOGLE_PLAY);}catch(_){}
    const fiyat=p&&p.pricing&&p.pricing.price?String(p.pricing.price):'';
    return{fiyat:fiyat||'—',hazir:!!fiyat&&p.canPurchase!==false&&!this.mesgul};
  },
  al(id){
    const u=urunBul(id);
    if(!ODEME_ACIK||!u||(u.tek&&baslangicAlindi())||this.mesgul)return Promise.resolve('yok');
    if(this.kip==='deneme')return this.denemeAl(u);
    if(this.kip!=='play'||!this.bilgi(u).hazir)return Promise.resolve('yok');
    let off=null;try{const p=this.store.get(u.play,this.C.Platform.GOOGLE_PLAY);off=p&&p.getOffer&&p.getOffer();}catch(_){}
    if(!off)return Promise.resolve('yok');
    this.mesgul=true;this.sonBekleyen=null;this.yenile();
    const C=this.C;
    return Promise.resolve().then(()=>off.order()).then(err=>{
      this.mesgul=false;this.yenile();
      if(err&&err.isError){
        if(Number(err.code)===C.ErrorCode.PAYMENT_CANCELLED){bildir(t('shop.msg.cancelled'));return 'iptal';}
        bildir(t('shop.msg.failed'));return 'hata';
      }
      return this.sonBekleyen===u.play?'bekliyor':'tamam';
    },()=>{this.mesgul=false;this.yenile();bildir(t('shop.msg.failed'));return 'hata';});
  },
  // tarayıcı: gerçek ödeme alınmaz; onaylanırsa paket ücretsiz eklenir (aynı teslim yolu, "deneme-" kimlikli)
  denemeAl(u){
    const ver=()=>teslim('deneme-'+Date.now()+'-'+Math.floor(Math.random()*1e9),u.id)?'tamam':'hata';
    if(this.hizliOnay)return Promise.resolve(ver());
    return new Promise(res=>{
      showModal(`<h2>${u.n}</h2><p>${t('shop.demo.text')}</p>
        <div class="row"><button data-act="no">${t('ui.cancel')}</button><button class="primary" data-act="yes">${t('shop.demo.add')}</button></div>`,
        {no:()=>{hideModal();res('iptal');},yes:()=>{hideModal();res(ver());}});
    });
  },
  // satın alımları geri yükle: tüketilebilirlerde ağırlıkla bekleyen/onaylanmamış alımları yeniden ister (approved olayı teslim eder)
  geriYukle(){
    if(!ODEME_ACIK)return Promise.resolve(false);
    if(this.kip==='deneme'){bildir(t('shop.msg.demoRestore'));return Promise.resolve(true);}
    if(this.kip!=='play'||!this.store){bildir(t('shop.note.offline'));return Promise.resolve(false);}
    const st=this.store;
    return Promise.resolve().then(()=>st.restorePurchases()).then(err=>{
      if(err&&err.isError){bildir(t('shop.msg.restoreFail'));return false;}
      return Promise.resolve(typeof st.update==='function'?st.update():null).then(()=>{bildir(t('shop.msg.restored'));return true;});
    },()=>{bildir(t('shop.msg.restoreFail'));return false;});
  }
};
// mağaza işlemleri (DOM'dan bağımsız; ekran MagazaUI'de)
function magazaAl(id){return ODEME.al(id).then(s=>{try{MagazaUI.refresh();}catch(_){}return s;});}
function hediyeAl(){
  if(!MZ.hediyeHazir)return 0;
  const a=OYUN.effects(S.port,S.ship).hediye,once=S.gold;
  S.gold+=a;MZ.st.hediye=MZ.bugun();save();MZ.kaydet();SES.cal('altin');vib(12);MagazaUI.refresh(once);
  return a;
}

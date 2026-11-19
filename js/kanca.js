// js/kanca.js — Test ve hata ayıklama kancası (window.__oyun). Tanımlar: window.__oyun · Kullanır: t, DIL, DIL_YEREL, DILLER, DIL_SOZLUK, dilSec, gemiAdi, unvanAd, yapiAd, sirketAdi, SIRKET, sk, skKaydet, sirketInsa, sirketSifirla, sirketAdKaydet, sirketDuzen, renderPort, SEFER, SAVAS, OYUN, S, screen, modalOn, $, modalAct, SES, MZ, ODEME_ACIK, ODEME, URUNLER, baslangicAlindi, magazaAl, hediyeAl, duzenHesap, duzenSimdi, Yol, go, startNext, startStop, otomatikSavun, ayarlar, varlik, resetAll, buy, GemiUI, Rihtim, SeferUI, SavasUI, SAVAS_IMG, SatisUI
"use strict";
window.__oyun={
  get state(){
    const tr=S.trip;let trip=null;
    if(tr)trip=Object.assign(OYUN.tripInfo(tr.i),{phase:tr.phase,tier:tr.tier,early:tr.early,loot:tr.loot,plundered:!!tr.plundered,replay:tr.replay,oto:!!tr.oto,kurtar:!!tr.kurtar});
    else if(screen==='yukleme'&&SeferUI.state)trip=Object.assign(OYUN.tripInfo(SeferUI.state.stopIdx),{phase:'yukleme',replay:SeferUI.state.replay});
    const cargo=tr?JSON.parse(JSON.stringify(tr.cargo)):(screen==='yukleme'&&SeferUI.state?SeferUI.state.cargo:null);
    const k=OYUN.shipTier(S.ship);
    return{screen,phase:screen,gold:S.gold,stop:S.stop,next:OYUN.tripInfo(S.stop),stops:S.stops.map(r=>({...r})),port:{...S.port},modal:modalOn,cargo,trip,
      ship:Object.assign({},S.ship,{tier:k+1,ad:gemiAdi(k),savunma:OYUN.savunma(S)}),jeton:S.jeton|0,denemeAltin:S.denemeAltin|0,v:S.v,
      quote:tr&&tr.phase==='satis'?OYUN.saleQuote(tr,S.port):null};
  },
  go,startNext,startStop,sell:()=>SatisUI.sell(),
  gelistir:id=>GemiUI.upgrade(id),
  savun:()=>otomatikSavun(),
  // mağaza: kip ('kapali' ayar kapalıyken | 'deneme' tarayıcı | 'play' Android), durum (play: hazirlaniyor|hazir|yok),
  // urunler [{id, play, ad, fiyat, hazir}] (ayar kapalıyken boş), al(id) -> Promise<'tamam'|'bekliyor'|'iptal'|'hata'|'yok'>, geriYukle(), hizliOnay (deneme onayı atlanır)
  magaza:{get acik(){return ODEME_ACIK;},get kip(){return ODEME.kip;},get durum(){return ODEME.durum;},
    get urunler(){return ODEME_ACIK?URUNLER.filter(u=>!(u.tek&&baslangicAlindi())).map(u=>{const b=ODEME.bilgi(u);return{id:u.id,play:u.play,ad:u.n,fiyat:b.fiyat,hazir:b.hazir};}):[];},
    ac:()=>go('magaza'),al:id=>magazaAl(id),geriYukle:()=>ODEME.geriYukle(),hediye:()=>hediyeAl(),get hediyeHazir(){return MZ.hediyeHazir;},
    get hizliOnay(){return ODEME.hizliOnay;},set hizliOnay(v){ODEME.hizliOnay=!!v;},get baslangic(){return baslangicAlindi();},get son(){return ODEME.son;},
    get islem(){return MZ.st.islem.slice();}},
  rihtim:{get esya(){return Rihtim.items;},get batma(){return Rihtim.sink;},get yelken(){return Rihtim.sailing;},SAHNE:Rihtim.SAHNE},
  sefer:{place:(slot,gx,gy)=>SeferUI.doPlace(slot,gx,gy),canPlace:(cells,gx,gy)=>SeferUI.canPlace(cells,gx,gy),get state(){return SeferUI.state;},get _game(){return SeferUI._game;},
    get layout(){return SeferUI.layout;},calcLayout:(W,H,safeT,safeB)=>SeferUI.calcLayout(W,H,safeT,safeB)},
  savas:{swap:(x1,y1,x2,y2)=>SavasUI.doSwap(x1,y1,x2,y2,true),validMoves:()=>SavasUI.validMoves(),fire:()=>SavasUI.doFire(),get state(){return SavasUI.state;},
    get assetsReady(){return SAVAS_IMG.ready;},get fx(){return SavasUI.fxCount;},get layout(){return SavasUI.layout;},calcLayout:(W,H,safeT,safeB)=>SavasUI.calcLayout(W,H,safeT,safeB)},
  buy,reset:resetAll,ayarlar,
  // şirket kasabası: state (ad, muhur, seviye, unvan, adimlar), siradaki (ad, bedel), insa(), muhurVer(n) (test), sifirla(), ad(yeni), duzen(W,H,safeT,safeB)
  sirket:{get state(){const st=sk(),lv=SIRKET.seviye(st);return{ad:sirketAdi(st),muhur:st.muhur,seviye:lv,unvan:unvanAd(lv),adimlar:SIRKET.ADIMLAR.slice(0,st.adim).map(s=>s.id),
      tamam:SIRKET.tamam(st),kazanilan:st.kazanilan,en:Object.assign({},st.en)};},
    get siradaki(){const s=SIRKET.siradaki(sk());return s?{id:s.id,ad:yapiAd(s.id),bedel:s.bedel,armagan:Object.assign({},s.armagan)}:null;},
    insa:()=>sirketInsa(),muhurVer:n=>{const st=sk();st.muhur=Math.max(0,st.muhur+(n|0));skKaydet();if(screen==='port')renderPort();else if(screen==='map')sirketHarita();return st.muhur;},
    sifirla:()=>{sirketSifirla();if(screen==='port')renderPort();return true;},ad:a=>sirketAdKaydet(a),duzen:(W,H,t,b)=>sirketDuzen(W,H,t,b),SIRKET},
  modal:{get open(){return modalOn;},get html(){return $('card').innerHTML;},act:modalAct},
  ses:{get ready(){return SES.ready;},get sesAcik(){return SES.sesAcik;},get muzikAcik(){return SES.muzikAcik;},get muzik(){return SES.calan;},
    get son(){return SES.son;},set:(ad,deger)=>SES.set(ad,deger),get mod(){return SES.mode;},get kilit(){return SES.kilit;},get istenen(){return SES.istenen;}},
  varlik:{get toplam(){return varlik().toplam;},get yuklenen(){return varlik().yuklenen;},get hatali(){return varlik().hatali;}},
  yol:{get acik(){return Yol.on;},get savun(){return Yol.savun;}},
  // dil: kod, yerel kod, liste (12 dil), sozluk (yüklü sözlüklerin anahtar sayısı), t(anahtar, değişkenler), sec(kod) (kaydeder, sayfayı yeniler)
  dil:{get kod(){return DIL;},get yerel(){return DIL_YEREL;},get liste(){return DILLER.map(d=>d.kod);},
    get sozluk(){const o={};for(const k in DIL_SOZLUK)o[k]=Object.keys(DIL_SOZLUK[k]).length;return o;},t:(k,v)=>t(k,v),sec:k=>dilSec(k)},
  // ekranın güncel yerleşim ölçüleri: {W,H,sahneH,hucre,tahtaY,toplam}; W,H (ve güvenli alan) verilirse o boyut için hesaplar ('port': şirket ekranı)
  duzen:(ekran,W,H,safeT,safeB)=>{if(ekran==='sefer')ekran='yukleme';
    if(ekran==='port'){const[t0,b0]=W?[safeT||0,safeB||0]:safeTB(),d=sirketDuzen(W||window.innerWidth||375,H||window.innerHeight||812,t0,b0);
      return{W:d.W,H:d.H,sahneH:d.sahneH,toplam:d.toplam,oran:d.oran,satir:d.satir};}
    const d=W?duzenHesap(ekran,W,H,safeT,safeB):duzenSimdi(ekran);
    return d?{W:d.W,H:d.H,sahneH:d.sahneH,hucre:d.hucre,tahtaY:d.tahtaY,toplam:d.toplam,oran:d.oran,tepsi:d.tepsi}:null;},
  SEFER,SAVAS,OYUN
};

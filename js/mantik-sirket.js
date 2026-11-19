// js/mantik-sirket.js — şirket kasabası mantığı (mühür, inşa adımları, kayıt). Sahibi: şirket kasabası işi. DOM'suz. Tanımlar: SIRKET · Kullanır: yok
"use strict";
/*SIRKET-LOGIC-START*/
// Mühür: her satışta dereceye göre (Dağınık 1, Düzgün 2, Usta 3). Aynı yolculuk yeniden oynanırsa yalnız öncekinden
// yüksek dereceyle gelen fark verilir. Mühür yalnız kasaba inşasında harcanır; altınla karışmaz.
// Kasaba adımları doğrusal: her seferinde sıradaki yapı inşa edilir. İnşa edilen adım sayısı = şirket seviyesi.
// Yapılar savaş ya da yükleme gücü vermez; her adımın küçük bir armağanı (altın ya da "ek hamle" jetonu) vardır.
// Kayıt ayrı anahtarda (muson-sirket): {v, ad, muhur, adim, en:{yolculukIndeksi: o yolculuktan alınan en yüksek mühür}, kazanilan, bildir: gösterilmemiş geriye dönük mühür}
const SIRKET=(()=>{
  "use strict";
  // ad: boş ('') = dilin varsayılan adı (arayüzde company.default). Eski kayıtlardaki Türkçe varsayılan ad da boş sayılır.
  const VERSION=1,AD_VARSAYILAN='',AD_ESKI_VARSAYILAN='Muson Kumpanyas\u0131',AD_MAX=20;
  const MUHUR={daginik:1,duzgun:2,usta:3};
  // yapi: kasabadaki görsel ve yer anahtarı (assets/sirket/<yapi>.png); aynı yapı ikinci kez gelirse büyütmedir
  // adımın görünen adı arayüzde (building.<id>): bayrak direği, kâtip evi, çeşmeli meydan, şirket merkezi, bahçe, han, tüccar evi,
  // yel değirmeni, lonca binası, deniz feneri, şirket merkezini büyüt
  const ADIMLAR=[
    {id:'bayrak',yapi:'bayrak',bedel:2,armagan:{altin:200}},
    {id:'ev1',yapi:'ev1',bedel:3,armagan:{jeton:1}},
    {id:'cesme',yapi:'cesme',bedel:3,armagan:{altin:400}},
    {id:'kumpanya',yapi:'kumpanya',bedel:4,armagan:{jeton:2}},
    {id:'bahce',yapi:'bahce',bedel:4,armagan:{altin:600}},
    {id:'han',yapi:'han',bedel:5,armagan:{jeton:2}},
    {id:'ev2',yapi:'ev2',bedel:5,armagan:{altin:800}},
    {id:'degirmen',yapi:'degirmen',bedel:6,armagan:{jeton:3}},
    {id:'lonca',yapi:'lonca',bedel:7,armagan:{altin:1200}},
    {id:'fener',yapi:'fener',bedel:8,armagan:{jeton:3}},
    {id:'kumpanya2',yapi:'kumpanya',bedel:8,armagan:{altin:2000}}
  ];
  // seviye eşiği -> unvan kimliği (görünen ad arayüzde, title.<kimlik>): Acemi Tüccar, Liman Tüccarı, Kumpanya Sahibi, Lonca Başı, Denizlerin Efendisi
  const UNVAN=[[0,'acemi'],[2,'liman'],[4,'kumpanya'],[9,'lonca'],[11,'efendi']];
  const TOPLAM_BEDEL=ADIMLAR.reduce((a,s)=>a+s.bedel,0);
  const muhurOf=tier=>MUHUR[tier]||0;
  // ad: baştaki/sondaki boşluk atılır, iç boşluklar teke iner, en çok 20 karakter; boşsa (ya da eski Türkçe varsayılan adsa) '' = varsayılan
  function adTemizle(ad){
    let s=typeof ad==='string'?ad.replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim():'';
    s=Array.from(s).slice(0,AD_MAX).join('').trim();
    return s===AD_ESKI_VARSAYILAN?AD_VARSAYILAN:s||AD_VARSAYILAN;
  }
  // yeni kayıt; stops (ana kayıttaki geçilmiş yolculuklar, derece r alanında) verilirse geçmiş yolculuklar o dereceyle
  // "alınmış" sayılır. ver=true ise (şirket kaydı ilk kez oluşuyor) bunların mühürü geriye dönük verilir ve
  // bildir alanına yazılır (arayüz bir kez "Önceki yolculukların için n mühür" gösterip sıfırlar).
  function yeni(stops,ver){
    const st={v:VERSION,ad:AD_VARSAYILAN,muhur:0,adim:0,en:{},kazanilan:0,bildir:0};
    if(Array.isArray(stops))stops.forEach((r,i)=>{const m=r&&muhurOf(r.r);if(m)st.en[i]=m;});
    if(ver){const n=Object.keys(st.en).reduce((a,k)=>a+st.en[k],0);st.muhur=n;st.kazanilan=n;st.bildir=n;}
    return st;
  }
  // bozuk ya da sürümsüz kayıt: yeni; geçmiş dereceler alınmış sayılır ama mühür yeniden verilmez (iki kez verilmesin)
  function temizle(raw,stops){
    if(!raw||typeof raw!=='object'||raw.v!==VERSION)return yeni(stops,false);
    const st=yeni();
    st.ad=adTemizle(raw.ad);
    st.muhur=Math.max(0,Math.floor(+raw.muhur||0));
    st.adim=Math.min(ADIMLAR.length,Math.max(0,Math.floor(+raw.adim||0)));
    st.kazanilan=Math.max(0,Math.floor(+raw.kazanilan||0));
    st.bildir=Math.max(0,Math.floor(+raw.bildir||0));
    const en=raw.en&&typeof raw.en==='object'?raw.en:{};
    for(const k of Object.keys(en)){const i=+k,m=Math.floor(+en[k]||0);if(Number.isInteger(i)&&i>=0&&m>0)st.en[i]=Math.min(3,m);}
    return st;
  }
  // satılan yolculuk (trip: {i, tier}) için verilecek mühür; durumu günceller ve verilen sayıyı döner
  function satis(st,trip){
    if(!st||!trip||!(trip.i>=0))return 0;
    const i=trip.i|0,m=muhurOf(trip.tier),eski=st.en[i]|0,ver=Math.max(0,m-eski);
    if(m>eski)st.en[i]=m;
    st.muhur+=ver;st.kazanilan+=ver;
    return ver;
  }
  function siradaki(st){return ADIMLAR[st.adim]||null;}
  function tamam(st){return st.adim>=ADIMLAR.length;}
  function eksik(st){const s=siradaki(st);return s?Math.max(0,s.bedel-st.muhur):0;}
  function insaEdilebilir(st){const s=siradaki(st);return !!s&&st.muhur>=s.bedel;}
  // sıradaki yapıyı inşa eder: {ok:true, adim, tamam} ya da {ok:false, neden:'tamam'|'muhur', eksik}
  // armağanı (altın, jeton) uygulamak çağıranın işi (oyun kaydı ayrı)
  function insa(st){
    const s=siradaki(st);
    if(!s)return{ok:false,neden:'tamam',eksik:0};
    if(st.muhur<s.bedel)return{ok:false,neden:'muhur',eksik:s.bedel-st.muhur};
    st.muhur-=s.bedel;st.adim++;
    return{ok:true,adim:s,tamam:tamam(st)};
  }
  function seviye(st){return st.adim;}
  function unvan(lv){let u=UNVAN[0][1];for(const[e,n]of UNVAN)if(lv>=e)u=n;return u;} // unvan kimliği
  // kasabada duran yapılar: {yapi: kaç kez inşa edildi} (2 = büyütülmüş)
  function yapilar(st){const o={};ADIMLAR.slice(0,st.adim).forEach(s=>{o[s.yapi]=(o[s.yapi]|0)+1;});return o;}
  // armağanın yazısı arayüzde (js/ortak.js armaganYazi)
  return{VERSION,AD_VARSAYILAN,AD_MAX,MUHUR,ADIMLAR,UNVAN,TOPLAM_BEDEL,muhurOf,adTemizle,yeni,temizle,satis,siradaki,tamam,eksik,
    insaEdilebilir,insa,seviye,unvan,yapilar};
})();
/*SIRKET-LOGIC-END*/
if(typeof module!=='undefined'&&module.exports)module.exports=SIRKET;

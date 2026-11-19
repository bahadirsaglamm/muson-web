// js/ekran-liman.js — Şirket ekranı (ekran kimliği port): kasaba sahnesi, mühürle inşa, şirket adı, altınla alınan işletmeler (4 bina), mühür bildirimi. Tanımlar: BINA, LIMAN_YER, LIMAN_BOY, SIRKET_YER, ZEMIN_BOY, SIRKET_YATAY_UST, SIRKET_YATAY_ARA, kasabaKutu, kasabaYerles, KUMPANYA_BUYUK, SIRKET_KEY, SIRKET_OLCU, KASABA_IMG, YEDEK_RENK, kEsc, kasabaPic, muhurI, renderUst, renderInsa, sirketBoyutla, sirketAdKaydet, dotsHtml, sk, skKaydet, sirketSifirla, sirketDuzen, geriyeBildir, sirketHarita, sirketInsa, sirketAdPenceresi, muhurTost, renderPortView, renderPort, buy · Kullanır: t, unvanAd, yapiAd, isletmeEtki, armaganYazi, sirketAdi, TIER_NAME, OYUN, SIRKET, $, S, fmt, save, screen, pic, initAudio, SES, vib, go, showModal, hideModal, jingle, safeTB, yatayAcik, RM
"use strict";
/* ================= şirket kasabası ================= */
const BINA={depo:'bina_depo',pazar:'bina_pazar',tersane:'bina_tersane',dokum:'bina_dokumhane'};
// altınla alınan binaların kademeye göre boyu (px; 3. kademe = SIRKET_YER'deki tam boy). LIMAN_YER eski adıyla korunur.
const LIMAN_BOY=[38,44,52,60];
// Kasabadaki yerler ZEMİN RESMİNİN yüzdesiyle (assets/sirket/zemin.jpg, 900×1205): x = yapının ortası, y = tabanı, b = genişlik (resim genişliğinin %'si).
// Yapı katmanı resme kilitli (kasabaYerles): ekran oranı değişse de her yapı kendi arsasında kalır. z sırası y'ye göre (aşağıdaki öne).
// Zemin (17 Kasım, Görseller/uretim-betikleri/zemin2_gen.py, varyant c; Bahadır simetrik ızgarayı istemedi: "geçen zemin daha doğal görünüyordu"):
// kıvrılan yol ve eğri taraçalar, yolun iki yanına serpiştirilmiş taş çerçeveli tek yapılık arsalar. Arsa iç alanları (x, y aralığı):
//   üst büyük x35–61 y18–28 · sağ üst çimenlik x66–93 y20–31 · sol x1–22 y34–42 · sol küçük x17–33 y39–45
//   sağ alt küme: x63–80 y55–61 · x46–64 y59–65 · x72–89 y60–66 · x55–72 y64–70
//   sol alt küme: x12–28 y64–70 · x1–15 y67–73 (bayrak) · x23–40 y70–77 · x11–24 y74–79 (boş; tersanenin arkasında)
//   kıyı: sol kum x0–25 y82–90 · kaya x85–96 y75–81 · iskele ortada (resimdeki boş tekne süs olarak kalır)
// Mühürle inşa edilenler: bayrak … fener; altınla alınan işletmeler: depo, pazar, tersane, dokum (b = 3. kademedeki boy).
const SIRKET_YER={
  kumpanya:{x:48,y:27,b:22},                                       // üst büyük arsa (şirket merkezi)
  bahce:{x:72.5,y:30,b:15},     degirmen:{x:85,y:29.5,b:13},       // sağ üst çimenlik
  lonca:{x:11.5,y:41.5,b:17},   ev1:{x:25,y:44.5,b:14},            // sol arsalar
  han:{x:71.5,y:60.5,b:16},     cesme:{x:55,y:64.5,b:15},  ev2:{x:80.5,y:65.5,b:15},  dokum:{x:63.5,y:69.5,b:15}, // sağ alt küme
  depo:{x:20,y:69.5,b:15},      pazar:{x:31.5,y:76,b:16},  bayrak:{x:8,y:72.5,b:7},  // sol alt küme
  tersane:{x:13,y:87,b:17},     fener:{x:90.5,y:80,b:15}         // kıyı
};
// resmin boyu, yapıların kapladığı dikey bant (UST = şirket merkezinin çatısı, ALT = tersanenin tabanı) ve her ekranda görünmesi gereken yatay şerit
const ZEMIN_BOY={W:900,H:1205,UST:.10,ALT:.875,SOL:.02,SAG:.98};
const LIMAN_YER=SIRKET_YER; // eski ad (geriye uyum)
const KUMPANYA_BUYUK=1.25; // şirket merkezi büyütülünce boy çarpanı
const SIRKET_KEY='muson-sirket';
// yerleşim sabitleri (css/sirket.css'teki yükseklikler bunlarla aynı tutulur)
// BINDIR: inşaat kartı sahnenin altına bu kadar biner (negatif üst boşluk)
// yatay düzende (web) kasaba resminin üstünde başlık için bırakılan en çok pay (px)
const SIRKET_YATAY_UST=28;
// yatay düzende kasaba ile sağdaki kartlar arası (px)
const SIRKET_YATAY_ARA=8;
const SIRKET_OLCU={ORAN:.52,SAHNE_MIN:220,INSA:88,BINDIR:22,BASLIK:18,ALT:46,ARA:8,SATIR:62,UST:10,ALT_PAY:14};
// kasaba görselleri: kendi yükleyicisi (varlik.js'e dokunmadan); yüklenemeyen yerine renkli kutu + ad
const KASABA_IMG=(()=>{
  const AD=['bayrak','ev1','ev2','cesme','kumpanya','bahce','han','degirmen','lonca','fener'],st={};
  const src=k=>'assets/sirket/'+k+'.png';
  for(const k of AD.concat(['zemin'])){
    st[k]=0;
    try{
      if(typeof Image==='undefined'){st[k]=-1;continue;}
      const im=new Image();im.onload=()=>{st[k]=1;};im.onerror=()=>{st[k]=-1;};
      im.src=k==='zemin'?'assets/sirket/zemin.jpg':src(k);
    }catch(_){st[k]=-1;}
  }
  return{src,failed:k=>st[k]===-1,ok:k=>st[k]===1,get durum(){return Object.assign({},st);}};
})();
const YEDEK_RENK={bayrak:'#d26a2c',ev1:'#e9d3a6',ev2:'#8fa7b8',cesme:'#7fc4d8',kumpanya:'#e0a526',bahce:'#5aa55a',han:'#b5864f',degirmen:'#d9c9a3',lonca:'#9b7bc4',fener:'#e65b4f'};
const kEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function kasabaPic(k,ad){
  return `<span class="ky-pic${KASABA_IMG.failed(k)?' noimg':''}"><img src="${KASABA_IMG.src(k)}" alt="" draggable="false" onerror="this.parentNode.classList.add('noimg')"><i class="ky-yedek" style="background:${YEDEK_RENK[k]||'#c99a62'}">${kEsc(ad||'')}</i></span>`;
}
const dotsHtml=k=>'<span class="dots" aria-label="'+k+'/'+OYUN.MAXK+'">'+Array.from({length:OYUN.MAXK},(_,j)=>`<i${j<k?' class="on"':''}></i>`).join('')+'</span>';
const muhurI='<i class="muhur-i"></i>';

/* ---------- kayıt (ayrı anahtar) ---------- */
let SK=null;
// ilk erişimde yüklenir. Anahtar hiç yoksa (ilk oluşturma) geçilmiş yolculuklar kayıtlı dereceleriyle alınmış sayılır ve
// mühürleri geriye dönük verilir (bildirim bir kez). Anahtar var ama bozuksa mühür yeniden verilmez.
function sk(){
  if(SK)return SK;
  let raw=null,kayitVar=false;
  try{const r=localStorage.getItem(SIRKET_KEY);if(r!=null){kayitVar=true;raw=JSON.parse(r);}}catch(_){raw=null;}
  SK=kayitVar?SIRKET.temizle(raw,S&&S.stops):SIRKET.yeni(S&&S.stops,true);
  if(!kayitVar||!raw)skKaydet();
  return SK;
}
function skKaydet(){try{localStorage.setItem(SIRKET_KEY,JSON.stringify(SK));}catch(_){}}
// oyunun "Sıfırla"sı (resetAll) çağırır
function sirketSifirla(){SK=SIRKET.yeni();try{localStorage.removeItem(SIRKET_KEY);}catch(_){}skKaydet();return SK;}

/* ---------- yerleşim ---------- */
// Şirket ekranı yukarıdan aşağı: kasaba sahnesi (güvenli alanın arkasına uzanır) · sıradaki inşaat · "İşletmeler" · liste (kendi içinde kayar) · alt düğmeler.
// Sahne yüksekliğin ORAN'ı kadar; liste en az iki satır alacak kadar yer kalmazsa sahne küçülür. Sayfa kaymaz.
function sirketDuzen(W,H,safeT,safeB){
  const K=SIRKET_OLCU;safeT=safeT||0;safeB=safeB||0;
  const ic=H-(K.UST+safeT)-(K.ALT_PAY+safeB);          // ekran kutusu
  const sabit=K.INSA-K.BINDIR+K.BASLIK+K.ALT+4*K.ARA;            // sahne dışındaki sabit parçalar ve aralar
  const listeMin=2*K.SATIR+K.ARA;
  // sahne üst boşluğa (K.UST) taşar: akıştaki payı sahneH - K.UST
  const sahneH=Math.max(K.SAHNE_MIN,Math.min(Math.round(K.ORAN*H),ic+K.UST-sabit-listeMin));
  const liste=ic-(sahneH-K.UST)-sabit;
  const toplam=K.UST+safeT+(sahneH-K.UST)+sabit+liste+K.ALT_PAY+safeB;
  return{W,H,sahneH,liste,satir:Math.max(0,Math.floor((liste+K.ARA)/(K.SATIR+K.ARA))),toplam,oran:Math.round(100*sahneH/H)};
}
// Zemin resmini ve yapı katmanını aynı kutuya oturtur. Yapı bandı (ZEMIN_BOY.UST–ALT) başlık kartının altındaki alana (hdr..H) sığdırılır:
// sahneyi dolduran ölçek (cover) yetiyorsa o; yetmiyorsa resim en çok %10 küçülür (yanlarda kalan ince şeridi .k-arka'daki bulanık kopya doldurur),
// yine sığmazsa 1. sıra başlığın hemen altında kalır ve kıyı alttan kırpılır. Resim sahneyi dikeyde dolduruyorsa üstte/altta boşluk bırakılmaz.
// tam: yapı bandının tamamı sığar (yatay düzende: resim gerekirse daha çok küçülür; çevresi deniz, kenarları denize karışır)
function kasabaKutu(W,H,hdr,alt,tam){
  const Z=ZEMIN_BOY,band=(Z.ALT-Z.UST)*Z.H;hdr=Math.max(0,Math.min(hdr||0,H*.4));
  const ic=H-hdr-(alt||0),cover=Math.max(W/Z.W,H/Z.H),sx=W/((Z.SAG-Z.SOL)*Z.W); // sx: yatay şerit sığsın (dar ve uzun sahnede)
  let s=Math.min(cover,sx);
  if(band*s>ic)s=tam?ic/band:Math.max(ic/band,.9*Math.min(cover,sx));
  const iw=Z.W*s,ih=Z.H*s,left=(W-iw)/2;
  let top=band*s<=ic?hdr+(ic-band*s)/2-Z.UST*Z.H*s:hdr-Z.UST*Z.H*s;
  if(ih>=H)top=Math.min(0,Math.max(H-ih,top));
  return{left,top,w:iw,h:ih,s};
}
function kasabaYerles(){
  const el=$('k-sahne');if(!el)return null;
  let W=el.clientWidth;const H=el.clientHeight;if(!W||!H)return null;
  const ust=el.querySelector('.k-ust'),hdr=ust?ust.offsetTop+ust.offsetHeight+2:0;
  // yatay düzende (web) sahne bütün ekrandır, kartlar sağda resmin üstünde: kasaba kartların soluna (sahnenin sol kenarından kartlara) sığar.
  // İnşaat kartı binmez; başlık köşelerde durduğu için bandın üstüne az pay
  if(yatayAcik){const k=$('k-insa');if(k&&k.getBoundingClientRect){const x=k.getBoundingClientRect().left-el.getBoundingClientRect().left-SIRKET_YATAY_ARA;if(x>120)W=Math.min(W,x);}}
  const k=yatayAcik?kasabaKutu(W,H,Math.min(hdr,SIRKET_YATAY_UST),0,true):kasabaKutu(W,H,hdr,SIRKET_OLCU.BINDIR),css=`left:${k.left.toFixed(1)}px;top:${k.top.toFixed(1)}px;width:${k.w.toFixed(1)}px;height:${k.h.toFixed(1)}px`;
  for(const e of [el.querySelector('.k-zemin'),$('p-view')])if(e)e.style.cssText=css;
  return k;
}
function sirketBoyutla(){
  try{const[t,b]=typeof safeTB==='function'?safeTB():[0,0];
    const d=sirketDuzen(window.innerWidth||375,window.innerHeight||812,t,b);$('k-sahne').style.height=yatayAcik?'':d.sahneH+'px';kasabaYerles();return d;}catch(_){return null;}
}

/* ---------- sahne ---------- */
// yeniId: az önce inşa edilen yapı (düşme, toz, parıltı); jumpId: az önce alınan işletme (zıplama)
function renderPortView(jumpId,yeniId){
  const st=sk(),duran=SIRKET.yapilar(st),nx=SIRKET.siradaki(st),can=SIRKET.insaEdilebilir(st),out=[];
  for(const k of Object.keys(duran)){
    const p=SIRKET_YER[k];if(!p)continue;
    const lv=duran[k],b=p.b*(k==='kumpanya'&&lv>1?KUMPANYA_BUYUK:1),yeni=yeniId===k;
    const ad=yapiAd((SIRKET.ADIMLAR.find(s=>s.yapi===k)||{}).id);
    const sira=nx&&nx.yapi===k?`<span class="ky-sira${can?' can':''}">${t('ui.upNext')}</span>`:'';
    const toz=yeni&&!RM?'<span class="toz"><i></i><i></i><i></i><i></i><i></i></span><span class="pirilti"></span>':'';
    out.push(`<div class="ky on${lv>1?' buyuk':''}${yeni?' dus':''}" data-yapi="${k}" style="left:${p.x}%;top:${p.y}%;--w:${b}%;z-index:${Math.round(p.y)}"><div class="ky-in">${kasabaPic(k,ad)}</div>${toz}${sira}</div>`);
  }
  // sıradaki yapının arsası (yapı zaten varsa, büyütmede, işaret yapının üstünde)
  if(nx&&!duran[nx.yapi]){
    const p=SIRKET_YER[nx.yapi];
    if(p)out.push(`<div class="ky arsa${can?' can':''}" data-yapi="${nx.yapi}" style="left:${p.x}%;top:${p.y}%;--w:${p.b}%;z-index:${Math.round(p.y)}"><span class="ky-sira${can?' can':''}">${kEsc(yapiAd(nx.id))}</span></div>`);
  }
  // altınla alınan işletmeler (alınmamışsa soluk siluet)
  for(const p of OYUN.PORT){
    const k=S.port[p.id]|0,y=SIRKET_YER[p.id],w=y.b*LIMAN_BOY[k]/LIMAN_BOY[3];
    out.push(`<div class="lb ${k?'on k'+k:'off'}${jumpId===p.id?' jump':''}" data-bina="${p.id}" style="left:${y.x}%;top:${y.y}%;--s:${LIMAN_BOY[k]}px;--w:${w.toFixed(1)}%;z-index:${Math.round(y.y)}">${pic(BINA[p.id],p.e)}${k?`<span class="st">${'★'.repeat(k)}</span>`:''}</div>`);
  }
  $('p-view').innerHTML=out.join('');
}
function renderUst(){
  const st=sk(),lv=SIRKET.seviye(st);
  $('k-adyazi').textContent=sirketAdi(st);
  $('k-unvan').textContent=t('port.level',{n:lv,title:unvanAd(lv)});
  $('k-muhur').textContent=t('ui.seals',{n:st.muhur});
  $('p-gold').textContent=t('ui.gold',{n:S.gold});
}
function renderInsa(){
  const st=sk(),nx=SIRKET.siradaki(st),N=SIRKET.ADIMLAR.length;
  if(!nx){
    $('k-insa').innerHTML=`<div class="ki-pic ki-tamam">🏁</div><div class="ki-bilgi"><small>${t('port.town',{a:N,b:N})}</small><b>${t('port.done')}</b><span class="ki-arm">${t('port.soon')}</span></div>`;
    $('k-insa').className='k-insa cila bitti';return;
  }
  const can=st.muhur>=nx.bedel,eks=nx.bedel-st.muhur;
  const btn=can?`<button class="primary" id="k-insa-b" data-insa data-sessiz>${t('port.build')}<small>${muhurI}${t('ui.seals',{n:nx.bedel})}</small></button>`
    :`<button id="k-insa-b" data-insa data-sessiz disabled>${t('port.sealsMore',{n:eks})}<small>${muhurI}${st.muhur}/${nx.bedel}</small></button>`;
  const alt=can?t('port.gift',{x:armaganYazi(nx.armagan)}):t('port.sealHint',{a:TIER_NAME.daginik,b:TIER_NAME.duzgun,c:TIER_NAME.usta});
  $('k-insa').innerHTML=`<div class="ki-pic">${kasabaPic(nx.yapi,'')}</div><div class="ki-bilgi"><small>${t('port.nextBuild',{a:st.adim+1,b:N})}</small><b>${kEsc(yapiAd(nx.id))}</b><span class="ki-arm${can?'':' ipucu'}">${alt}</span></div>${btn}`;
  $('k-insa').className='k-insa cila'+(can?' can':'');
}
function renderPort(jumpId,yeniId){
  sirketBoyutla();geriyeBildir();
  renderUst();
  renderPortView(jumpId,yeniId);
  renderInsa();
  $('p-list').innerHTML=OYUN.PORT.map(p=>{
    const k=S.port[p.id]|0,pr=OYUN.nextPrice(S,p.id);
    // satır sabit yükseklikte (SIRKET_OLCU.SATIR): ad · şimdiki etki · sonraki (altın yetmiyorsa önce eksik). Tersane'de "Gemiye git" adın yanında küçük düğme.
    const eff=k?t('ui.now',{x:'<b>'+isletmeEtki(p.id,k)+'</b>'}):(p.id==='depo'?t('ui.now',{x:isletmeEtki(p.id,0)}):t('ui.none'));
    const can=pr!=null&&S.gold>=pr,miss=pr!=null&&!can?`<span class="pmiss">${t('ui.goldShort',{n:pr-S.gold})}</span> · `:'';
    const nx=pr!=null?t('ui.nextLevel',{x:isletmeEtki(p.id,k+1)}):t('ui.maxLevel');
    const btn=pr==null?`<button disabled>${t('ui.full')}</button>`:`<button class="${can?'primary':''}" data-buy="${p.id}" data-sessiz ${can?'':'disabled'}>${t('port.buy')}<small>${t('ui.gold',{n:pr})}</small></button>`;
    const gemi=p.id==='tersane'?`<button class="go dark" data-gemi>${t('port.toShip')}</button>`:'';
    return `<div class="prow${pr!=null&&!can?' cant':''}"><div class="pic${jumpId===p.id?' jump':''}">${pic(BINA[p.id],p.e)}</div><div class="pinfo"><div class="pname"><span class="pn">${t('business.'+p.id+'.name')}</span>${dotsHtml(k)}${gemi}</div><div class="peff">${eff}</div><div class="peff p2">${miss}${nx}</div></div>${btn}</div>`;
  }).join('');
}

/* ---------- inşa ---------- */
let kutlamaZamani=0;
function sirketInsa(){
  const st=sk(),r=SIRKET.insa(st);
  if(!r.ok){SES.cal('hata');if(screen==='port')renderInsa();return null;}
  const a=r.adim.armagan||{};
  if(a.altin)S.gold+=a.altin;
  if(a.jeton)S.jeton=(S.jeton|0)+a.jeton;
  save();skKaydet();
  SES.cal('onarim');SES.cal('safsira');vib([14,40,20]);
  if(screen==='port')renderPort(null,r.adim.yapi);
  muhurTost(t('port.built',{name:kEsc(yapiAd(r.adim.id)),gift:armaganYazi(a)}),'insa');
  if(r.tamam){
    const my=++kutlamaZamani;
    setTimeout(()=>{if(my!==kutlamaZamani||screen!=='port')return;
      showModal(`<h2 class="t-win">${t('port.done')}</h2><div class="route">${kEsc(sirketAdi(st))}</div><p>${t('port.doneText',{title:unvanAd(SIRKET.seviye(st))})}</p>
        <div class="row"><button class="primary" data-act="ok">${t('ui.great')}</button></div>`,{ok:hideModal});
      jingle(true);},RM?0:1000);
  }
  return{adim:r.adim.id,armagan:a,tamam:r.tamam};
}
$('k-insa').addEventListener('click',e=>{
  const b=e.target&&e.target.closest?e.target.closest('[data-insa]'):null;if(!b||b.disabled)return;
  initAudio();sirketInsa();
});

/* ---------- şirket adı ---------- */
// dilin varsayılan adı aynen kaydedilirse ad boş (varsayılan) kalır: dil değişince varsayılan ad da değişir
function sirketAdKaydet(ad){const st=sk();let a=SIRKET.adTemizle(ad);if(a===t('company.default'))a='';st.ad=a;skKaydet();if(screen==='port')renderUst();if(screen==='map')sirketHarita();return sirketAdi(st);}
function sirketAdPenceresi(){
  const st=sk();
  showModal(`<h2>${t('port.name.title')}</h2><p>${t('port.name.text',{n:SIRKET.AD_MAX})}</p>
    <input class="k-giris" id="k-ad-gir" type="text" maxlength="${SIRKET.AD_MAX}" autocomplete="off" spellcheck="false" value="${kEsc(sirketAdi(st))}">
    <div class="row mt"><button data-act="no">${t('ui.cancel')}</button><button class="primary" data-act="yes">${t('ui.save')}</button></div>`,
    {no:hideModal,yes:()=>{const el=$('k-ad-gir');sirketAdKaydet(el?el.value:'');hideModal();}});
  const el=$('k-ad-gir');
  try{el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sirketAdKaydet(el.value);hideModal();}});
    if(el.focus){el.focus();if(el.select)el.select();}}catch(_){}
}
$('k-ad').onclick=()=>{initAudio();sirketAdPenceresi();};

/* ---------- mühür ödülü (satış olayı) ve bildirim ---------- */
let tostSaat=0;
function muhurTost(html,tur){
  const el=$('k-tost');if(!el)return;
  el.innerHTML=(tur==='insa'?'':muhurI)+html;el.className='';void el.offsetWidth;el.className='on'+(tur?' '+tur:'');
  const my=++tostSaat;setTimeout(()=>{if(my===tostSaat)el.className='';},2600);
}
document.addEventListener('muson:satis',e=>{
  const d=e&&e.detail;if(!d||!d.trip)return;
  const n=SIRKET.satis(sk(),d.trip);skKaydet();
  if(n>0)setTimeout(()=>muhurTost(`<b>${t('ui.sealsPlus',{n})}</b>`),RM?0:650);
  if(screen==='map')sirketHarita();
});

// geriye dönük mühür bildirimi: haritada ya da şirket ekranında bir kez
function geriyeBildir(){
  const st=sk();if(!(st.bildir>0))return 0;
  const n=st.bildir;st.bildir=0;skKaydet();
  setTimeout(()=>muhurTost(t('port.backSeals',{n})),RM?0:400);
  return n;
}
/* ---------- harita başlığı ve "Şirket" düğmesi ---------- */
function sirketHarita(){
  const st=sk();geriyeBildir();
  $('m-ad').textContent=sirketAdi(st);
  $('m-muhur').textContent=fmt(st.muhur);
  $('m-port').classList.toggle('nokta',SIRKET.insaEdilebilir(st));
}

/* ---------- işletmeler (altınla; mevcut mantık) ---------- */
$('p-list').addEventListener('click',e=>{
  if(e.target&&e.target.closest&&e.target.closest('[data-gemi]')){go('gemi');return;}
  const b=e.target&&e.target.closest?e.target.closest('[data-buy]'):null;if(!b)return;
  initAudio();buy(b.getAttribute('data-buy'));
});
$('p-shop').onclick=()=>go('magaza');
function buy(id){
  const ok=OYUN.buy(S,id);
  if(ok){save();SES.cal('satis');vib([12,30,12]);}
  else SES.cal('hata');
  if(screen==='port')renderPort(ok?id:null);
  return ok;
}
$('p-back').onclick=()=>go('map');
try{window.addEventListener('resize',()=>{if(screen==='port')sirketBoyutla();});}catch(_){}

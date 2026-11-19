// js/yerlesim.js — Uçan görsel, güvenli alan, sahneli ekran yerleşimi (DUZEN), kanvas cilası (CILA), zemin ve ahşap çerçeve çizimi, konuşma balonu. Tanımlar: flyTo, safeV, viewH, safeTB, YATAY, yatayMi, yatayGuncelle, DUZEN, duzenHesap, duzenSimdi, CILA (kanvas arayüz dili: hücre, çerçeve, yazı, yol gösteren el), zeminBoya, ahsapCerceve, balon · Kullanır: RM, $, IMG, SCREEN_EL
"use strict";
// bir görsel ekranın bir yerinden başka bir öğeye (ya da o.to = {x,y} ekran noktasına) uçar (DOM; tarayıcı desteklemezse atlanır)
function flyTo(k,emo,x,y,toEl,o){
  o=o||{};
  if(RM||!toEl||typeof document.createElement!=='function'||!document.body)return;
  try{
    const r=toEl.getBoundingClientRect();
    const tx=o.to?o.to.x:r.left+(o.dx!=null?o.dx:r.width/2),ty=o.to?o.to.y:r.top+r.height/2;
    let el;
    if(IMG.get(k)){el=document.createElement('img');el.src=IMG.src(k);el.alt='';}
    else{el=document.createElement('div');el.textContent=emo||'•';el.style.fontSize='20px';el.style.textAlign='center';}
    el.className='fly';el.style.transform=`translate(${x}px,${y}px)`;
    if(typeof el.animate!=='function')return;
    document.body.appendChild(el);
    const mx=(x+tx)/2+(o.arc||0),my=Math.min(y,ty)-(o.lift==null?60:o.lift),s0=o.s0||1,s1=o.s1||.55;
    const an=el.animate([
      {transform:`translate(${x}px,${y}px) scale(${s0*.6})`,opacity:0},
      {transform:`translate(${x}px,${y-8}px) scale(${s0})`,opacity:1,offset:.12},
      {transform:`translate(${mx}px,${my}px) scale(${(s0+s1)/2})`,opacity:1,offset:.55},
      {transform:`translate(${tx}px,${ty}px) scale(${s1})`,opacity:.9}],
      {duration:o.dur||620,delay:o.delay||0,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'both'});
    an.onfinish=()=>{try{el.remove();}catch(_){}if(o.bump!==false&&!o.to){toEl.classList.remove('bump');void toEl.offsetWidth;toEl.classList.add('bump');}if(o.onHit)o.onHit();};
  }catch(_){}
}
// çentikli telefonlarda güvenli alan boşlukları (yerleşim hesabı için)
function safeV(){
  try{const p=$('safe-probe');if(!p||typeof getComputedStyle!=='function')return 0;const c=getComputedStyle(p);
    return (parseFloat(c.paddingTop)||0)+(parseFloat(c.paddingBottom)||0);}catch(_){return 0;}
}
function viewH(){return window.innerHeight-safeV();}

/* ================= web sitesi sürümünde yatay düzen (YATAY) =================
   Yalnız window.__WEB doğruyken (Yayin/web-derle.sh) ve görünüm genişken (en/boy ≥ ORAN) açılır: <html class="yatay">.
   Telefon, Android ve dikey görünümde hiç açılmaz; yatay stiller css/oyun.css sonunda yalnız html.yatay altında durur.
   Her ekran tek parça sahnedir (görsel bütün ekranı kaplar, içerik resmin üstünde). Yükleme ve savaşın ölçüleri js/ekran-yukleme.js ve
   js/ekran-savas.js calcYatay'da; şirket kasabasının kutusu js/ekran-liman.js kasabaYerles'te; öteki ekranlar yalnız CSS. */
const YATAY={ORAN:1.2};
let yatayAcik=false;
function yatayMi(){try{return !!window.__WEB&&(window.innerWidth||0)>=(window.innerHeight||1)*YATAY.ORAN;}catch(_){return false;}}
// sınıfı günceller (yeniden boyutlanınca ekranlardan önce çalışır: dinleyicisi ilk kaydedilen)
function yatayGuncelle(){
  try{
    const ac=yatayMi(),r=document.documentElement;
    if(ac!==yatayAcik){yatayAcik=ac;r.classList.toggle('yatay',ac);}
  }catch(_){}
  return yatayAcik;
}
yatayGuncelle();
try{window.addEventListener('resize',yatayGuncelle);}catch(_){}
function safeTB(){
  try{const p=$('safe-probe');if(!p||typeof getComputedStyle!=='function')return[0,0];const c=getComputedStyle(p);
    return[parseFloat(c.paddingTop)||0,parseFloat(c.paddingBottom)||0];}catch(_){return[0,0];}
}

/* ================= sahneli ekranların yerleşimi (yükleme, savaş) ================= */
// Ekran yukarıdan aşağı: sahne (güvenli alanın arkasına da uzanır) · [yüklemede sipariş çipleri] · ahşap çerçeveli tahta ·
// [yüklemede parça tepsisi | savaşta göstergeler] · alt boşluk (+ güvenli alan). Hiçbir boyutta kaydırma olmaz.
// Sahne önce SAHNE_UST oranıyla denenir; hücre CS_HEDEF'in altına düşerse sahne SAHNE_HEDEF'e iner, yüklemede parça
// tepsisi TEPSI_MIN'e kadar daralır; hücre hâlâ CS_MIN'in altındaysa sahne SAHNE_ALT'a kadar küçülür.
const DUZEN={
  yukleme:{N:8,SAHNE_UST:.46,SAHNE_HEDEF:.42,SAHNE_ALT:.34,CS_HEDEF:38,CS_MIN:36,CS_UST:52,
    CIP:36,CERCEVE:10,TEPSI_ARA:8,TEPSI:116,TEPSI_MIN:96,KENAR:12,ALT:8},
  savas:{N:7,SAHNE_UST:.46,SAHNE_HEDEF:.42,SAHNE_ALT:.34,CS_HEDEF:44,CS_MIN:42,CS_UST:56,
    ARA:6,CERCEVE:9,GOSTERGE:52,KENAR:12,ALT:8}
};
// W, H: ekran; safeT, safeB: çentik ve alt çubuk boşluğu
function duzenHesap(ekran,W,H,safeT,safeB){
  const D=DUZEN[ekran];if(!D)return null;
  const N=D.N,yk=ekran==='yukleme';safeT=safeT||0;safeB=safeB||0;
  const csW=Math.min(D.CS_UST,Math.floor((W-2*D.KENAR-2*D.CERCEVE)/N));
  const sabit=t=>(yk?D.CIP+2*D.CERCEVE+D.TEPSI_ARA+t:D.ARA+2*D.CERCEVE+D.GOSTERGE)+D.ALT+safeB;
  const fit=(sh,t)=>Math.min(csW,Math.floor((H-sh-sabit(t))/N));
  let tepsi=yk?D.TEPSI:0,sh=Math.round(H*D.SAHNE_UST),cs=fit(sh,tepsi);
  if(cs<D.CS_HEDEF){sh=Math.max(Math.ceil(H*D.SAHNE_HEDEF),Math.min(sh,H-sabit(tepsi)-D.CS_HEDEF*N));cs=fit(sh,tepsi);}
  if(cs<D.CS_HEDEF&&yk){tepsi=Math.max(D.TEPSI_MIN,Math.min(tepsi,H-sh-sabit(0)-D.CS_HEDEF*N));cs=fit(sh,tepsi);}
  if(cs<D.CS_MIN){sh=Math.max(Math.ceil(H*D.SAHNE_ALT),Math.min(sh,H-sabit(tepsi)-D.CS_MIN*N));cs=fit(sh,tepsi);}
  cs=Math.max(26,cs);
  const gw=cs*N,tahtaY=sh+(yk?D.CIP:D.ARA)+D.CERCEVE;
  return{W,H,sahneH:sh,hucre:cs,tahtaY,toplam:sh+sabit(tepsi)+gw,oran:Math.round(1000*sh/H)/10,tepsi,gw,gx:Math.round((W-gw)/2),safeT,safeB};
}
function duzenSimdi(ekran){
  const scr=$(SCREEN_EL[ekran]),[t,b]=safeTB();
  const W=(scr&&scr.clientWidth)||window.innerWidth||375,H=window.innerHeight||812;
  return duzenHesap(ekran,Math.min(W,440),H,t,b);
}
// dikey zemin görseli: m = {s, ox, oy} (görselden ekrana ölçek ve kayma); görsel bitince ekranın gerisi alt renkle dolar
function zeminBoya(cv,im,m,W,H,renk,yedek){
  try{
    const d=window.devicePixelRatio||1;cv.width=Math.round(W*d);cv.height=Math.round(H*d);
    const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);
    c.fillStyle=renk;c.fillRect(0,0,W,H);
    if(im){
      const dw=(im.naturalWidth||900)*m.s,dh=(im.naturalHeight||1613)*m.s;c.drawImage(im,m.ox,m.oy,dw,dh);
      const by=m.oy+dh;
      if(by<H){const g=c.createLinearGradient(0,by-36,0,by+2);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,renk);c.fillStyle=g;c.fillRect(0,by-36,W,38);c.fillStyle=renk;c.fillRect(0,by,W,H-by);}
    }else if(yedek)yedek(c);
  }catch(_){}
}
/* ================= CILA: kanvas için ortak arayüz dili (parlak, pahlı, pirinç süslü) =================
   CSS'teki "arayüz dili" (css/oyun.css :root) ile aynı aile. Yeni kanvas ekranları bunları kullanır.
   CILA.YAZI                         kanvas yazı tipi ailesi (sistemin yuvarlak yazısı; dosya indirmez)
   CILA.ton(renk,k)                  #rrggbb rengini k>0 beyaza, k<0 siyaha doğru karıştırır (k: -1..1)
   CILA.hucre(ctx,x,y,s,renk,o)      parlak, pahlı "mücevher kutu" taş zemini. x,y: hücrenin sol üstü; s: hücre boyu (CSS px);
                                     renk: taşın ana rengi (#rrggbb). o: {secili, soluk, pay, yalnizHalka}
                                       secili: parlayan altın halka · soluk: yarı saydam, renksiz (ör. kullanılamaz)
                                       pay: kenar boşluğu (hücre oranı, vars. .06) · yalnizHalka: taşı çizmeden yalnız seçim halkası
                                     Dönüş: {cx,cy,yuz} ikonun ortalanacağı nokta (taşın üst yüzü) ve yüz boyu.
                                     Görünüm (renk, boy, pay, dpr) başına bir kez kapalı kanvasa çizilir, sonra kopyalanır.
   CILA.cerceve(ctx,x,y,w,h,p,o)     koyu ahşap tahta çerçevesi: pah, pirinç köşe levhaları ve perçinler, oyuk iç zemin, gölge.
                                     x,y,w,h: tahtanın iç alanı; p: çerçeve kalınlığı. o: {izgara:N → N×N oyuk yuva, ic:'#rrggbb' iç zemin}
                                     Boyut başına bir kez çizilir (gölge dahil), sonra kopyalanır.
   CILA.yazi(ctx,t,x,y,boy,renk,o)   koyu dış çizgili, üstten açık renge geçen kalın sahne yazısı. o: {agirlik, kenar, cizgi, hiza, duz, sigdir}
                                       sigdir: en çok bu genişlik (px); yazı uzunsa (ör. Almanca, Rusça) yazı boyu küçülür (en az %60)
   CILA.el(ctx,x,y,boy,a,k,bas,ters,egim)  yol gösteren beyaz el, altın kolluklu (ilk yükleme ve ilk korsan savaşı ortak kullanır).
                                     x,y: işaret parmağının ucu; boy: px; a: saydamlık; k: ölçek; bas: basma halkası (0-1);
                                     ters: aşağıyı gösterir; egim: yatıklık (radyan, vars. -.32)
   CILA.elOk(ctx,x1,y1,x2,y2)        kesik çizgili ok (hareket azaltma açıkken elin hareketinin yerine)
*/
const CILA=(()=>{
  // yazı tipi zinciri seçili dile göre (js/dil.js DIL_YAZI: Japonca, Korece, Çince için sistem yazı tipleri); dil modülü yoksa ortak zincir
  const YAZI=typeof DIL_YAZI==='string'&&DIL_YAZI?DIL_YAZI:'ui-rounded,"SF Pro Rounded","Arial Rounded MT Bold",system-ui,-apple-system,"Segoe UI",sans-serif';
  const dprNe=()=>(typeof window!=='undefined'&&window.devicePixelRatio)||1;
  function hex(c){
    c=String(c||'#888888').trim();if(c[0]==='#')c=c.slice(1);
    if(c.length===3)c=c.split('').map(h=>h+h).join('');
    const n=parseInt(c.slice(0,6),16);return isNaN(n)?[136,136,136]:[(n>>16)&255,(n>>8)&255,n&255];
  }
  function ton(c,k){
    const[r,g,b]=hex(c),t=k>0?255:0,a=Math.min(1,Math.abs(k||0)),m=v=>Math.round(v+(t-v)*a);
    return'rgb('+m(r)+','+m(g)+','+m(b)+')';
  }
  function rr(c,X,Y,W,H,R){R=Math.max(0,Math.min(R,W/2,H/2));c.beginPath();c.moveTo(X+R,Y);c.arcTo(X+W,Y,X+W,Y+H,R);c.arcTo(X+W,Y+H,X,Y+H,R);c.arcTo(X,Y+H,X,Y,R);c.arcTo(X,Y,X+W,Y,R);c.closePath();}
  // kapalı kanvas (tarayıcı desteklemezse null: doğrudan çizilir)
  function kanvas(w,h){
    try{if(typeof document==='undefined'||typeof document.createElement!=='function')return null;
      const k=document.createElement('canvas');if(!k||typeof k.getContext!=='function')return null;
      k.width=Math.max(1,Math.ceil(w));k.height=Math.max(1,Math.ceil(h));const c=k.getContext('2d');return c?{k,c}:null;}catch(_){return null;}
  }
  const onbellek=new Map();
  function bellek(anahtar,w,h,ciz){
    if(onbellek.has(anahtar))return onbellek.get(anahtar);
    const d=dprNe(),o=kanvas(w*d,h*d);if(!o)return null;
    o.c.setTransform(d,0,0,d,0,0);try{ciz(o.c);}catch(_){}
    if(onbellek.size>96)onbellek.clear();
    onbellek.set(anahtar,o.k);return o.k;
  }
  /* ---- taş zemini ---- */
  function hucreCiz(c,s,renk,pay){
    const p=s*pay,w=s-2*p,R=s*.22,th=Math.max(2,s*.075),fh=w-th;
    // alttaki kalınlık (koyu kenar) ve dış çizgi
    c.fillStyle=ton(renk,-.55);rr(c,p,p+1,w,w-1,R);c.fill();
    // gövde: üst açık, alt koyu
    let g=c.createLinearGradient(0,p,0,p+fh);g.addColorStop(0,ton(renk,.38));g.addColorStop(.55,renk);g.addColorStop(1,ton(renk,-.2));
    c.fillStyle=g;rr(c,p,p,w,fh,R);c.fill();
    // pah: içte biraz çökük yüz
    const ins=s*.085;
    g=c.createLinearGradient(0,p+ins,0,p+fh-ins);g.addColorStop(0,ton(renk,-.1));g.addColorStop(1,ton(renk,.14));
    c.fillStyle=g;rr(c,p+ins,p+ins,w-2*ins,fh-2*ins,R*.7);c.fill();
    // ikon arkası yumuşak ışık
    const cx=s/2,cy=p+fh/2;
    g=c.createRadialGradient(cx,cy,0,cx,cy,w*.46);g.addColorStop(0,'rgba(255,255,240,.34)');g.addColorStop(1,'rgba(255,255,240,0)');
    c.fillStyle=g;c.fillRect(p,p,w,fh);
    // üst parlama şeridi
    g=c.createLinearGradient(0,p+1,0,p+fh*.42);g.addColorStop(0,'rgba(255,255,255,.62)');g.addColorStop(1,'rgba(255,255,255,.04)');
    c.fillStyle=g;rr(c,p+s*.09,p+s*.035,w-s*.18,fh*.36,R*.65);c.fill();
    // kenarlar: üstte ince ışık, dışta koyu çizgi
    c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.38)';rr(c,p+1.2,p+1.2,w-2.4,fh-2.4,R-1);c.stroke();
    c.lineWidth=1.3;c.strokeStyle='rgba(20,10,0,.5)';rr(c,p+.6,p+.6,w-1.2,w-1.2,R);c.stroke();
  }
  function hucre(ctx,x,y,s,renk,o){
    o=o||{};const pay=o.pay==null?.06:o.pay,p=s*pay,th=Math.max(2,s*.075),fh=s-2*p-th;
    if(!o.yalnizHalka){
    ctx.save();
    if(o.soluk){ctx.globalAlpha*=.42;}
    const im=bellek('h|'+renk+'|'+Math.round(s*4)+'|'+pay+'|'+dprNe(),s,s,c=>hucreCiz(c,s,renk,pay));
    if(im)ctx.drawImage(im,x,y,s,s);
    else{ctx.translate(x,y);hucreCiz(ctx,s,renk,pay);}
    ctx.restore();
    }
    if(o.secili){
      const w=s-2*p,R=s*.22;
      ctx.save();
      ctx.shadowColor='rgba(255,214,90,.95)';ctx.shadowBlur=Math.max(8,s*.28);
      ctx.strokeStyle='#ffe58a';ctx.lineWidth=Math.max(2.5,s*.075);rr(ctx,x+p-1,y+p-1,w+2,w+2,R+1);ctx.stroke();
      ctx.shadowBlur=0;ctx.strokeStyle='#fffbe6';ctx.lineWidth=Math.max(1,s*.03);rr(ctx,x+p-1,y+p-1,w+2,w+2,R+1);ctx.stroke();
      ctx.restore();
    }
    return{cx:x+s/2,cy:y+p+fh/2,yuz:fh};
  }
  /* ---- tahta çerçevesi ---- */
  function pirinc(c,cx,cy,r){
    const g=c.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);g.addColorStop(0,'#fff4c4');g.addColorStop(.45,'#e0b04a');g.addColorStop(1,'#7a5312');
    c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,7);c.fill();c.lineWidth=1;c.strokeStyle='rgba(50,28,4,.7)';c.stroke();
  }
  function cerceveCiz(c,x,y,w,h,p,o){
    const R=Math.max(10,p*1.5);
    // gölge ve ahşap gövde
    c.save();c.shadowColor='rgba(0,12,20,.55)';c.shadowBlur=16;c.shadowOffsetY=6;
    let g=c.createLinearGradient(0,y-p,0,y+h+p);g.addColorStop(0,'#8a5a2e');g.addColorStop(.45,'#66401f');g.addColorStop(1,'#46290f');
    c.fillStyle=g;rr(c,x-p,y-p,w+2*p,h+2*p,R);c.fill();c.restore();
    // pah: dış kenarda üstte ışık, altta koyu
    c.lineWidth=2;
    g=c.createLinearGradient(0,y-p,0,y+h+p);g.addColorStop(0,'rgba(255,214,150,.55)');g.addColorStop(.5,'rgba(255,214,150,.12)');g.addColorStop(1,'rgba(20,8,0,.45)');
    c.strokeStyle=g;rr(c,x-p+1,y-p+1,w+2*p-2,h+2*p-2,R-1);c.stroke();
    c.lineWidth=1;c.strokeStyle='rgba(25,12,2,.75)';rr(c,x-p+.5,y-p+.5,w+2*p-1,h+2*p-1,R);c.stroke();
    // damar çizgileri
    c.strokeStyle='rgba(35,18,5,.32)';c.lineWidth=1;c.beginPath();
    for(const f of[.3,.68]){const a=y-p+p*f,b=y+h+p*f;
      c.moveTo(x-p+R,a);c.quadraticCurveTo(x+w*.5,a+1.4,x+w+p-R,a);c.moveTo(x-p+R,b);c.quadraticCurveTo(x+w*.5,b-1.2,x+w+p-R,b);
      const l=x-p+p*f,r=x+w+p*f;c.moveTo(l,y-p+R);c.quadraticCurveTo(l+1.2,y+h*.5,l,y+h+p-R);c.moveTo(r,y-p+R);c.quadraticCurveTo(r-1,y+h*.5,r,y+h+p-R);}
    c.stroke();
    // iç pervaz ve oyuk zemin
    c.fillStyle='#2e1a09';rr(c,x-3.5,y-3.5,w+7,h+7,10);c.fill();
    c.fillStyle=o.ic||'#c99a62';rr(c,x-2,y-2,w+4,h+4,8.5);c.fill();
    if(o.izgara){
      const N=o.izgara,cs=w/N;
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){
        const X=x+i*cs+1.5,Y=y+j*cs+1.5,s=cs-3;
        c.fillStyle=(i+j)%2?'#a87743':'#b4844e';rr(c,X,Y,s,s,6);c.fill();
        // yuva: üst kenarda gölge, altta ışık (oyuk görünür)
        g=c.createLinearGradient(0,Y,0,Y+s);g.addColorStop(0,'rgba(60,30,8,.38)');g.addColorStop(.22,'rgba(60,30,8,0)');g.addColorStop(.85,'rgba(255,230,180,0)');g.addColorStop(1,'rgba(255,230,180,.22)');
        c.fillStyle=g;rr(c,X,Y,s,s,6);c.fill();
      }
    }
    // iç gölge: çerçevenin altına çöken zemin
    c.save();rr(c,x-2,y-2,w+4,h+4,8.5);c.clip();
    c.shadowColor='rgba(30,14,2,.6)';c.shadowBlur=9;c.shadowOffsetY=2.5;c.lineWidth=8;c.strokeStyle='rgba(30,14,2,.6)';
    rr(c,x-6,y-6,w+12,h+12,12);c.stroke();c.restore();
    c.lineWidth=1;c.strokeStyle='rgba(255,226,170,.25)';rr(c,x-4.5,y-4.5,w+9,h+9,11);c.stroke();
    // pirinç köşe levhaları ve perçinler
    const L=Math.max(R+4,p*2),q=p*.5;
    for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){
      const cx=sx<0?x-q:x+w+q,cy=sy<0?y-q:y+h+q;
      c.save();c.translate(cx,cy);c.scale(sx,sy);
      // L biçimli levha: köşeden iki kenara uzanır
      c.beginPath();c.moveTo(-q,L);c.lineTo(-q,-q+R);c.arcTo(-q,-q,-q+R,-q,R);c.lineTo(L,-q);c.lineTo(L,-q+p*.62);c.quadraticCurveTo(p*.62-q,p*.62-q,-q+p*.62,L);c.closePath();
      g=c.createLinearGradient(-q,-q,L,L);g.addColorStop(0,'#fff0b0');g.addColorStop(.35,'#e2b24c');g.addColorStop(1,'#8a5c14');
      c.fillStyle=g;c.fill();c.lineWidth=1;c.strokeStyle='rgba(55,30,4,.8)';c.stroke();
      c.restore();
      pirinc(c,cx,cy,Math.max(2.6,p*.3));
    }
    const rv=Math.max(2.2,p*.24);
    for(const[px,py]of[[x+w/2,y-q],[x+w/2,y+h+q],[x-q,y+h/2],[x+w+q,y+h/2]])pirinc(c,px,py,rv);
  }
  function cerceve(ctx,x,y,w,h,p,o){
    o=o||{};const M=22,W=w+2*p+2*M,H=h+2*p+2*M;
    const im=bellek('c|'+Math.round(w)+'|'+Math.round(h)+'|'+p+'|'+(o.izgara||0)+'|'+(o.ic||'')+'|'+dprNe(),W,H,c=>cerceveCiz(c,M+p,M+p,w,h,p,o));
    if(im)ctx.drawImage(im,x-p-M,y-p-M,W,H);
    else{ctx.save();cerceveCiz(ctx,x,y,w,h,p,o);ctx.restore();}
  }
  /* ---- sahne yazısı ---- */
  function yazi(ctx,t,x,y,boy,renk,o){
    o=o||{};
    ctx.save();
    ctx.font=(o.agirlik||900)+' '+boy+'px '+YAZI;
    if(o.sigdir>0){try{const m=ctx.measureText(t),w=m&&m.width||0;
      if(w>o.sigdir){const b2=Math.max(boy*.6,Math.floor(boy*o.sigdir/w*10)/10);if(o.cizgi!=null)o=Object.assign({},o,{cizgi:o.cizgi*b2/boy});boy=b2;ctx.font=(o.agirlik||900)+' '+boy+'px '+YAZI;}}catch(_){}}
    ctx.textAlign=o.hiza||'center';ctx.textBaseline='middle';ctx.lineJoin='round';
    ctx.lineWidth=o.cizgi==null?Math.max(3,boy*.24):o.cizgi;ctx.strokeStyle=o.kenar||'rgba(28,14,4,.9)';ctx.strokeText(t,x,y);
    if(o.duz)ctx.fillStyle=renk;
    else{const g=ctx.createLinearGradient(0,y-boy*.5,0,y+boy*.5);g.addColorStop(0,ton(renk,.6));g.addColorStop(.5,renk);g.addColorStop(1,ton(renk,-.18));ctx.fillStyle=g;}
    ctx.fillText(t,x,y);
    ctx.restore();
  }
  /* ---- yol gösteren el (ilk yükleme ve ilk korsan savaşı) ---- */
  // beyaz eldiven: işaret parmağının ucu (x, y) noktasında; boy px, a saydamlık, k ölçek, bas basma halkası (0-1),
  // ters: aşağıyı gösterir (gövde yukarıda), egim: elin yatıklığı (radyan)
  function el(ctx,x,y,boy,a,k,bas,ters,egim){
    if(a<=0)return;
    const u=boy/100;egim=egim==null?-.32:egim;
    ctx.save();ctx.globalAlpha*=Math.min(1,a);
    if(bas>0){ctx.strokeStyle=`rgba(255,240,170,${.85*bas})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,boy*(.16+.14*(1-bas)),0,7);ctx.stroke();}
    ctx.translate(x,y);ctx.rotate(ters?-egim:egim);ctx.scale(u*k,(ters?-1:1)*u*k);
    // parçalar: işaret parmağı, bükülü üç parmak, avuç, başparmak, altın kolluk
    const R=(X,Y,W,H,r)=>{rr(ctx,X,Y,W,H,r);};
    const sekil=[()=>R(-9,0,18,52,9),()=>R(8,32,15,26,7.5),()=>R(21,38,14,24,7),()=>R(33,46,12,20,6),()=>R(-13,36,56,52,17),
      ()=>{ctx.beginPath();ctx.ellipse(-15,64,9,17,-.7,0,7);}];
    ctx.lineJoin='round';
    ctx.shadowColor='rgba(0,15,25,.45)';ctx.shadowBlur=10;ctx.shadowOffsetY=4;
    ctx.fillStyle='#16222c';for(const f of sekil){f();ctx.lineWidth=7;ctx.strokeStyle='#16222c';ctx.stroke();ctx.fill();}
    ctx.shadowColor='transparent';
    const g=ctx.createLinearGradient(-10,0,40,90);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#e2e9f1');ctx.fillStyle=g;
    for(const f of sekil){f();ctx.fill();}
    // parmak araları ve tırnak
    ctx.strokeStyle='rgba(40,60,80,.45)';ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(9,48);ctx.lineTo(9,58);ctx.moveTo(22,52);ctx.lineTo(22,61);ctx.moveTo(34,58);ctx.lineTo(34,66);ctx.stroke();
    ctx.fillStyle='rgba(255,214,200,.9)';R(-5,4,10,11,5);ctx.fill();
    // kolluk
    const kg=ctx.createLinearGradient(0,84,0,102);kg.addColorStop(0,'#ffe58a');kg.addColorStop(1,'#d39a22');
    ctx.fillStyle='#16222c';R(-14,82,58,22,6);ctx.fill();ctx.fillStyle=kg;R(-11,85,52,16,4);ctx.fill();
    ctx.restore();
  }
  // kesik çizgili ok (hareket azaltma açıkken elin yerine hareketi gösterir)
  function elOk(ctx,x1,y1,x2,y2){
    const an=Math.atan2(y2-y1,x2-x1),h=12;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    for(const[c,w]of[['rgba(20,30,40,.75)',7],['#fff3c4',3.5]]){
      ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(c[0]==='#'?[10,8]:[]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(x2-h*Math.cos(an-.5),y2-h*Math.sin(an-.5));ctx.lineTo(x2,y2);ctx.lineTo(x2-h*Math.cos(an+.5),y2-h*Math.sin(an+.5));ctx.stroke();
    }
    ctx.restore();
  }
  return{YAZI,ton,rr,hucre,cerceve,yazi,el,elOk};
})();
// ahşap tahta çerçevesi (yükleme ve savaş; x,y,w,h tahtanın kendisi): CILA.cerceve'nin eski adı
function ahsapCerceve(ctx,x,y,w,h,p,o){CILA.cerceve(ctx,x,y,w,h,p,o);}
// kısa konuşma balonu: metni ms kadar gösterir, sonra kalıcı metne (varsa) döner
function balon(el,html,ms,kalici){
  if(!el)return;
  el._tok=(el._tok||0)+1;const tok=el._tok;
  el.innerHTML=html||'';el.classList.remove('off','on');void el.offsetWidth;if(html)el.classList.add('on');
  if(ms)setTimeout(()=>{if(el._tok!==tok)return;el.innerHTML=(kalici&&kalici())||'';el.classList.remove('on');},ms);
}

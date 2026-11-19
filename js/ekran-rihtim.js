// js/ekran-rihtim.js — Yükleme ekranının üstündeki rıhtım sahnesi: liman, gemi, vinç (Rihtim); rota koşulu görselleri ve porselen malı (CESIT). Tanımlar: CESIT, Rihtim · Kullanır: t, $, screen, RM, GOODS, IMG, malPic, shipBig, shipTier, zeminBoya, yatayAcik, SeferUI (yatayda zemin rihtim_genis.jpg; geminin su çizgisini js/ekran-yukleme.js size(wl) ile verir)
"use strict";
/* ---------- yolculuk çeşitliliği: koşul görselleri (tembel yüklenir; yoksa kodla çizilir) ve porselen malı ---------- */
if(typeof GOODS!=='undefined'&&!GOODS.porselen)GOODS.porselen={n:t('goods.porselen'),s:t('goods.porselen.s'),c:'#e6edf6',e:'🏺'};
const CESIT=(()=>{
  const SRC={eski_sandik:'assets/mallar/eski_sandik.png',kilit:'assets/mallar/kilit.png',porselen:'assets/mallar/porselen.png'};
  const im={},st={};
  function yukle(k){
    if(st[k]!==undefined||!SRC[k])return;st[k]=0;
    try{
      if(typeof Image==='undefined'){st[k]=-1;return;}
      const i=new Image();
      i.onload=()=>{st[k]=1;try{if(typeof SeferUI!=='undefined'&&SeferUI.redraw)SeferUI.redraw();}catch(_){}};
      i.onerror=()=>{st[k]=-1;};
      i.src=SRC[k];im[k]=i;
    }catch(_){st[k]=-1;}
  }
  const get=k=>{yukle(k);return st[k]===1?im[k]:null;};
  const failed=k=>{yukle(k);return st[k]===-1;};
  // mal görseli: porselen kendi dosyasından, diğerleri ortak yükleyiciden (IMG)
  const mal=g=>g==='porselen'?get('porselen'):IMG.get('mal_'+g);
  const malFailed=g=>g==='porselen'?failed('porselen'):IMG.failed('mal_'+g);
  const picHtml=(k,emo,cls)=>`<span class="pic-w${cls?' '+cls:''}${failed(k)?' noimg':''}"><img src="${SRC[k]}" alt="" draggable="false" onerror="this.parentNode.classList.add('noimg')"><i class="emo">${emo}</i></span>`;
  const malHtml=g=>g==='porselen'?picHtml('porselen',GOODS.porselen.e,'mi'):malPic(g);
  // koşul rozetinin ikonu: görseli olanlar görselle, diğerleri emojiyle
  const ikonHtml=K=>K.id==='eski'?picHtml('eski_sandik',K.e):K.id==='kilit'?picHtml('kilit',K.e):K.id==='porselen'?picHtml('porselen',K.e):`<i class="k-emo">${K.e}</i>`;
  return{SRC,get,failed,yukle,mal,malFailed,malHtml,picHtml,ikonHtml};
})();
/* ================= yükleme ekranının sahnesi: liman, gemi, vinç (canlı) ================= */
const Rihtim=(()=>{
  // Sahnedeki konumlar adlandırılmış oranlardır; tarayıcıda bakıp buradan düzeltilir.
  // ZEMIN_*, UFUK, ISKELE_*, VINC_*: rihtim_dikey.jpg'nin kendi boyuna oranla. GEMI_*: sahneye oranla. GUVERTE: gemi görseline oranla.
  const SAHNE={
    ZEMIN_ALT:0.56,          // rihtim_dikey.jpg'de sahnenin alt kenarına gelen yer (iskelenin ön kenarı)
    ZEMIN_ODAK_X:0.40,       // görsel ekrandan genişse yatay kırpmanın odağı (0 sol, 1 sağ)
    ZEMIN_RENK:'#1c5863',    // görselin alt rengi: görsel bitince ekranın gerisi bununla dolar
    ZEMIN_BOY:[900,1613],    // görsel yüklenmeden önceki hesap için boyutu
    UFUK:0.27,              // ufuk çizgisi
    ISKELE_UC_X:0.55,        // iskelenin sağ ucu
    VINC_KANCA:[0.64,0.325],// görseldeki vinç kancasının ucu: halat buradan iner
    VINC_ALIM:[0.30,0.40],   // sandığın iskeleden kalktığı nokta
    VINC_SURE:560,           // vinçle bir sandığın gemiye inişi (ms)
    VINC_SANDIK:0.075,       // vinçteki sandığın boyu (sahne boyu oranı)
    GEMI_X:0.74,             // geminin ortası (ekran genişliği oranı)
    GEMI_SU_Y:0.93,          // geminin su çizgisi (sahne boyu oranı)
    GEMI_BOY:0.74,           // 1. kademe geminin boyu (sahne boyu oranı)
    KADEME_BOY:[1,1.05,1.09,1.13], // kademeye göre boy çarpanı
    GEMI_SU:0.90,            // gemiN_b.png'de su çizgisi (görsel boyu oranı)
    GUVERTE:[[.52,.76],[.64,.77],[.74,.73],[.58,.82],[.70,.80],[.46,.80],[.80,.72],[.62,.71]], // güvertede yük yerleri (gemi görseli oranı)
    YUK_BOY:0.085,           // güvertedeki mal ikonunun boyu (sahne boyu oranı)
    BATMA_PX:10,             // tam yükte gemi bu kadar piksel suya gömülür
    SU_RENK:'70,196,204',   // geminin önündeki suyun rengi (ön dalga)
    // yatay düzen (web, geniş ekran): sahne bütün ekranın zeminidir; zemin rihtim_genis.jpg (16:9), "cover" ile sol üstten bağlanır.
    // Tahta ekranın ortasında durur (konumu js/ekran-yukleme.js calcYatay); gemi tahtanın üstündeki açık suda, su çizgisi sipariş çiplerinin hemen üstünde.
    GENIS:{
      UFUK:0.285,            // rihtim_genis.jpg'de ufuk çizgisi (görsel boyu oranı)
      UFUK_Y:0.215,          // ufkun ekrandaki yeri (ekran yüksekliği oranı); görsel üstten kırpılarak buraya getirilir
      UFUK_PAY:0.03,         // ufuk, geminin su çizgisinden en az bu kadar yukarıda (ekran yüksekliği oranı)
      ISKELE_UC_X:0.307,     // iskelenin sağ ucu
      VINC_KANCA:[0.336,0.33], // vinç kancasının ucu
      VINC_ALIM:[0.14,0.36], // iskeledeki sandık yığını: vincin sandığı kaldırdığı yer
      KAPTAN:[0,0.47],       // kaptan portresinin ortası iskelenin üstünde (y: görsel boyu oranı)
      GEMI_BOY:0.26,         // 1. kademe geminin boyu (ekran yüksekliği oranı); gemi ekranın üstünden taşmayacak kadar küçülür
      GEMI_ARA:[0.75,0.06],  // geminin ortası kancanın sağında: gemi genişliğinin [0] katı + ekran yüksekliğinin [1] katı
      GEMI_UST:4             // geminin direk ucu ile ekranın üstü arasında en az bu kadar boşluk (px)
    }
  };
  // yerin (iskele, vinç, ufuk) oranı: yatay düzende geniş görselin, dikeyde rihtim_dikey.jpg'nin
  const z=k=>yatayAcik&&SAHNE.GENIS[k]!=null?SAHNE.GENIS[k]:SAHNE[k];
  const cv=$('s-scene'),ctx=cv.getContext('2d'),dock=$('s-dock'),bg=$('s-bg');
  let W=375,H=340,SH=800,suY=0,map={s:.42,ox:0,oy:0,iw:900,ih:1613},raf=false,items=[],nItem=0,sink=0,sinkT=0,shineT0=-1e9,sailT0=0,goal=1,stars=[],crane=[];
  const zeminIm=()=>IMG.get(yatayAcik?'rihtim_genis':'rihtim_dikey');
  // yatay: ufuk ekranın UFUK_Y'sine (ama su çizgisinin üstüne) gelecek kadar üstten kırpılır, en az ekranı kaplar ("cover"), sola yaslanır
  function zeminGenis(){
    const G=SAHNE.GENIS,im=zeminIm(),iw=(im&&im.naturalWidth)||1920,ih=(im&&im.naturalHeight)||1080;
    const hy=Math.max(H*.12,Math.min(H*G.UFUK_Y,suY-H*G.UFUK_PAY)),f=hy/H,c=Math.max(0,(G.UFUK-f)/(1-f));
    const s=Math.max(W/iw,H/(ih*(1-c)));
    return{s,ox:0,oy:Math.min(0,hy-G.UFUK*ih*s),iw,ih};
  }
  function zeminMap(){
    if(yatayAcik)return zeminGenis();
    const im=IMG.get('rihtim_dikey'),iw=(im&&im.naturalWidth)||SAHNE.ZEMIN_BOY[0],ih=(im&&im.naturalHeight)||SAHNE.ZEMIN_BOY[1];
    const s=Math.max(W/iw,H/(ih*SAHNE.ZEMIN_ALT));
    return{s,ox:(W-iw*s)*SAHNE.ZEMIN_ODAK_X,oy:H-ih*s*SAHNE.ZEMIN_ALT,iw,ih};
  }
  const imgPt=(fx,fy)=>[map.ox+fx*map.iw*map.s,map.oy+fy*map.ih*map.s];
  // wl: yatay düzende geminin su çizgisi (ekranın üstünden px; sipariş çiplerinin hemen üstü, js/ekran-yukleme.js verir)
  function size(wl){
    if(wl!=null)suY=wl;
    W=dock.clientWidth||375;H=dock.clientHeight||340;
    const scr=$('scr-sefer');SH=Math.max(H,(scr&&scr.clientHeight)||window.innerHeight||800);
    const d=window.devicePixelRatio||1;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);
    map=zeminMap();paintBg();
    if(yatayAcik)yatayYerles();
  }
  // yatay: kaptan iskelenin üstünde, "Ambar" etiketi geminin sağında (ekrana sığdırılır); CSS değişkenleri css/oyun.css YATAY DÜZEN'de
  function yatayYerles(){
    try{
      const scr=$('scr-sefer'),g=geo(),hold=$('s-hold'),hw=(hold&&hold.offsetWidth)||130;
      const ky=imgPt(0,SAHNE.GENIS.KAPTAN[1])[1];
      scr.style.setProperty('--kapY',Math.round(Math.max(110,Math.min(H-90,ky-32)))+'px');
      scr.style.setProperty('--tutX',Math.round(Math.max(12,Math.min(W-12-hw,g.x+g.sw*.5+6)))+'px');
      scr.style.setProperty('--tutY',Math.round(g.wl-30)+'px');
    }catch(_){}
  }
  // zemin (durağan): görsel ya da yedek çizim (gökyüzü, su, iskele, basit vinç)
  function paintBg(){
    zeminBoya(bg,zeminIm(),map,W,SH,SAHNE.ZEMIN_RENK,c=>{
      const hy=imgPt(0,z('UFUK'))[1];
      let g=c.createLinearGradient(0,0,0,hy);g.addColorStop(0,'#6fc3ee');g.addColorStop(1,'#cdeefb');c.fillStyle=g;c.fillRect(0,0,W,hy);
      g=c.createLinearGradient(0,hy,0,SH);g.addColorStop(0,'#74c9cf');g.addColorStop(.5,'#3a8f99');g.addColorStop(1,SAHNE.ZEMIN_RENK);c.fillStyle=g;c.fillRect(0,hy,W,SH-hy);
      const[ex,ey]=imgPt(z('ISKELE_UC_X'),yatayAcik?0.6:SAHNE.ZEMIN_ALT),[kx,ky]=imgPt(z('VINC_KANCA')[0],z('VINC_KANCA')[1]),[ax,ay]=imgPt(z('VINC_ALIM')[0],z('VINC_ALIM')[1]);
      c.fillStyle='#9a6a3e';c.fillRect(0,ay,ex,ey-ay);c.fillStyle='#7a5230';for(let x=8;x<ex;x+=ex/5)c.fillRect(x,ey-4,7,26);
      c.strokeStyle='#7a5230';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(ax-30,ay);c.lineTo(ax-30,ky-30);c.lineTo(kx,ky-34);c.stroke();
      c.lineWidth=1.5;c.beginPath();c.moveTo(kx,ky-34);c.lineTo(kx,ky);c.stroke();
    });
  }
  function reset(g){items=[];nItem=0;sink=sinkT=0;shineT0=-1e9;sailT0=0;goal=Math.max(1,g|0);stars=[];crane=[];}
  function show(){size();draw(performance.now());kick();}
  function kick(){if(!raf&&screen==='yukleme'){raf=true;requestAnimationFrame(tick);}}
  function tick(){
    if(screen!=='yukleme'){raf=false;return;}
    try{draw(performance.now());}catch(_){}
    requestAnimationFrame(tick);
  }
  // gemi geometrisi (salınım hariç). u: sahnedeki küçük şeylerin (güverte yükü, vinç sandığı) ölçü birimi:
  // dikeyde sahne boyu; yatayda 1. kademe geminin sahne boyu karşılığı (gemiyle aynı oranda kalsınlar)
  function geo(){
    const im=shipBig(),nw=(im&&im.naturalWidth)||530,nh=(im&&im.naturalHeight)||640;
    const kb=SAHNE.KADEME_BOY[shipTier()]||1;
    if(yatayAcik){
      const G=SAHNE.GENIS,wl=suY||H*.25;
      const sh=Math.max(40,Math.min(H*G.GEMI_BOY*kb,(wl-G.GEMI_UST)/SAHNE.GEMI_SU)),sw=sh*nw/nh,taban=sh/kb;
      const kx=imgPt(G.VINC_KANCA[0],0)[0],x=Math.min(W-sw*.6,kx+sw*G.GEMI_ARA[0]+H*G.GEMI_ARA[1]);
      return{im,sh,sw,x,wl,u:taban/SAHNE.GEMI_BOY};
    }
    const sh=H*SAHNE.GEMI_BOY*kb,sw=sh*nw/nh;
    return{im,sh,sw,x:W*SAHNE.GEMI_X,wl:H*SAHNE.GEMI_SU_Y,u:H};
  }
  function spotLocal(i,g){const s=SAHNE.GUVERTE[i%SAHNE.GUVERTE.length];return[-g.sw/2+g.sw*s[0],-g.sh*SAHNE.GEMI_SU+g.sh*s[1]];}
  // teslim edilen mallar: her biri gecikmesiyle güverteye düşer; vinç bir sandığı iskeleden gemiye indirir; ekran noktaları (uçan ikonun hedefi) döner
  function receive(goods,landIn,hold){
    const now=performance.now(),g=geo(),r=cv.getBoundingClientRect?cv.getBoundingClientRect():{left:0,top:0},out=[];
    goods.forEach((good,k)=>{
      const i=nItem++,[lx,ly]=spotLocal(i,g);
      items.push({g:good,i,t0:now+(landIn[k]||0)});
      out.push({x:r.left+g.x+lx,y:r.top+g.wl+sink+ly});
    });
    if(items.length>SAHNE.GUVERTE.length)items=items.slice(-SAHNE.GUVERTE.length);
    if(goods.length&&!RM)crane.push({g:goods[0],i:nItem-1,t0:now});
    if(crane.length>3)crane=crane.slice(-3);
    sinkT=SAHNE.BATMA_PX*Math.min(1,(hold|0)/goal);kick();
    return out;
  }
  function shine(){shineT0=performance.now();stars=Array.from({length:12},()=>({a:Math.random()*Math.PI*2,r:.15+Math.random()*.4,d:Math.random()*300,s:2+Math.random()*2.5}));kick();}
  function sail(){if(!sailT0)sailT0=performance.now();kick();}
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  function crate(x,y,s,good){
    ctx.fillStyle='#b5864f';ctx.fillRect(x-s/2,y,s,s*.86);ctx.strokeStyle='#6b4423';ctx.lineWidth=1.4;ctx.strokeRect(x-s/2,y,s,s*.86);
    const im=CESIT.mal(good);
    if(im)ctx.drawImage(im,x-s*.36,y+s*.07,s*.72,s*.72);else{ctx.fillStyle=GOODS[good].c;ctx.fillRect(x-s*.28,y+s*.15,s*.56,s*.56);}
  }
  function draw(now){
    if(!W||!H)return;
    ctx.clearRect(0,0,W,H);
    const hy=imgPt(0,z('UFUK'))[1],dockX=imgPt(z('ISKELE_UC_X'),0)[0];
    // uzak dalgacıklar (iskelenin sağındaki açık suda)
    if(!RM){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.2;ctx.beginPath();
      // yatayda su ekranın altına kadar uzanır: dalgacıklar ufka yakın şeritte kalır (tahtanın arkasına düşmesin)
      const dy=yatayAcik?Math.min(H-hy,(suY||hy)-hy+H*.12):H-hy;
      for(let r=0;r<4;r++){const y=hy+dy*(.18+.2*r),off=(now*.012*(r+1))%44;
        for(let x=dockX-off;x<W;x+=44){ctx.moveTo(x,y);ctx.quadraticCurveTo(x+7,y-2.5,x+14,y);}}
      ctx.stroke();}
    // gemi (güncel kademe): salınır, yük arttıkça gömülür, kazanınca sağa açılır
    sink+=(sinkT-sink)*.08;
    const g=geo(),sk=sailT0?Math.min(1,(now-sailT0)/1100):0,sx=W*.8*sk*sk;
    const bob=RM?0:Math.sin(now*.0026)*2,rot=RM?0:Math.sin(now*.0019)*.026,wl=g.wl+sink+bob;
    ctx.save();ctx.beginPath();ctx.rect(0,0,W,g.wl+3);ctx.clip();
    ctx.translate(g.x+sx,wl);ctx.rotate(rot);
    if(g.im)ctx.drawImage(g.im,-g.sw/2,-g.sh*SAHNE.GEMI_SU,g.sw,g.sh);
    else{const gw=g.sw,gh=g.sh;
      ctx.fillStyle='#c98a4b';ctx.beginPath();ctx.moveTo(-gw*.45,-gh*.22);ctx.lineTo(gw*.45,-gh*.22);ctx.lineTo(gw*.32,gh*.08);ctx.lineTo(-gw*.32,gh*.08);ctx.closePath();ctx.fill();
      ctx.fillStyle='#6b4a2a';ctx.fillRect(-gw*.03,-gh*.85,gw*.06,gh*.62);
      ctx.fillStyle='#f3ead2';ctx.beginPath();ctx.moveTo(gw*.02,-gh*.82);ctx.lineTo(gw*.36,-gh*.3);ctx.lineTo(gw*.02,-gh*.3);ctx.closePath();ctx.fill();}
    // güvertedeki mallar (düşünce küçük zıplama)
    const ys=g.u*SAHNE.YUK_BOY;
    for(const it of items){
      const dt=now-it.t0;if(dt<0)continue;
      const[lx,ly]=spotLocal(it.i,g),j=dt<340?Math.abs(Math.sin(dt/340*Math.PI))*(1-dt/340)*ys*.9:0;
      const im=CESIT.mal(it.g);
      if(im)ctx.drawImage(im,lx-ys/2,ly-ys*.8-j,ys,ys);
      else{ctx.fillStyle=GOODS[it.g].c;ctx.fillRect(lx-ys*.4,ly-ys*.7-j,ys*.8,ys*.8);}
    }
    // saf sırada altın parıltı
    const shk=(now-shineT0)/900;
    if(shk>=0&&shk<1){
      const cy=-g.sh*SAHNE.GEMI_SU+g.sh*.38,gl=ctx.createRadialGradient(0,cy,0,0,cy,g.sh*.6);
      gl.addColorStop(0,`rgba(255,236,150,${.55*(1-shk)})`);gl.addColorStop(1,'rgba(255,213,74,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,cy,g.sh*.6,0,7);ctx.fill();
      for(const s of stars){const q=Math.max(0,Math.min(1,(now-shineT0-s.d)/500));if(q<=0||q>=1)continue;
        const x=Math.cos(s.a)*g.sw*s.r,y=cy+Math.sin(s.a)*g.sh*s.r*.8,r=s.s*(1-Math.abs(q*2-1))*1.9;
        ctx.fillStyle='#fff6c0';ctx.beginPath();ctx.moveTo(x,y-r*2);ctx.lineTo(x+r*.5,y-r*.5);ctx.lineTo(x+r*2,y);ctx.lineTo(x+r*.5,y+r*.5);ctx.lineTo(x,y+r*2);ctx.lineTo(x-r*.5,y+r*.5);ctx.lineTo(x-r*2,y);ctx.lineTo(x-r*.5,y-r*.5);ctx.closePath();ctx.fill();}
    }
    ctx.restore();
    // ön dalga: geminin altını örter (iskelenin ucundan ya da geminin başından sağa)
    const fy=g.wl+3;
    if(yatayAcik){
      // yatay: su ekranın bütün altını kaplar; dalga yalnız geminin altında, iki ucu suya karışan ince bir şerit
      const a0=g.x+sx-g.sw*.62,a1=g.x+sx+g.sw*.62,kal=Math.max(6,g.sh*.05);
      const gr=ctx.createLinearGradient(a0,0,a1,0);gr.addColorStop(0,`rgba(${SAHNE.SU_RENK},0)`);gr.addColorStop(.18,`rgba(${SAHNE.SU_RENK},.92)`);gr.addColorStop(.82,`rgba(${SAHNE.SU_RENK},.92)`);gr.addColorStop(1,`rgba(${SAHNE.SU_RENK},0)`);
      ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(a0,fy+kal);
      for(let x=a0;x<=a1+6;x+=6)ctx.lineTo(x,fy+Math.sin(x*.07+now*.004)*1.8);
      ctx.lineTo(a1,fy+kal);ctx.quadraticCurveTo((a0+a1)/2,fy+kal*1.6,a0,fy+kal);ctx.closePath();ctx.fill();
      const gb=ctx.createLinearGradient(a0,0,a1,0);gb.addColorStop(0,'rgba(255,255,255,0)');gb.addColorStop(.2,'rgba(255,255,255,.7)');gb.addColorStop(.8,'rgba(255,255,255,.7)');gb.addColorStop(1,'rgba(255,255,255,0)');
      ctx.strokeStyle=gb;ctx.lineWidth=1.5;ctx.beginPath();
      for(let x=a0;x<=a1+6;x+=6){const y=fy+Math.sin(x*.07+now*.004)*1.8;x<=a0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.stroke();
    }else{
    const fx0=Math.max(0,Math.min(dockX,g.x+sx-g.sw*.55));
    ctx.fillStyle=`rgba(${SAHNE.SU_RENK},.9)`;ctx.beginPath();ctx.moveTo(fx0,H);
    for(let x=fx0;x<=W+6;x+=6)ctx.lineTo(x,fy+Math.sin(x*.07+now*.004)*1.8);
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.5;ctx.beginPath();
    for(let x=fx0;x<=W+6;x+=6){const y=fy+Math.sin(x*.07+now*.004)*1.8;x<=fx0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.stroke();
    }
    // vinç: halat kancadan iner, sandık iskeleden kalkar, gemiye doğru savrulup güverteye iner
    crane=crane.filter(c=>now-c.t0<SAHNE.VINC_SURE);
    for(const c of crane){
      const k=(now-c.t0)/SAHNE.VINC_SURE;if(k<0)continue;
      const U=g.u,[hx,hk]=imgPt(z('VINC_KANCA')[0],z('VINC_KANCA')[1]),cs=Math.max(14,U*SAHNE.VINC_SANDIK),L=U*.07;
      let[ax,ay]=imgPt(z('VINC_ALIM')[0],z('VINC_ALIM')[1]);ay=Math.min(ay,H-cs-4);
      const[lx,ly]=spotLocal(c.i,g),dx=g.x+sx+lx,dy=wl+ly-cs*.9;
      const P=[[ax,ay-cs],[hx,hk+L],[dx,Math.min(hk+L,dy-U*.08)],[dx,dy]];
      const seg=k<.3?0:k<.72?1:2,q=ease(seg===0?k/.3:seg===1?(k-.3)/.42:(k-.72)/.28);
      const x=P[seg][0]+(P[seg+1][0]-P[seg][0])*q,y=P[seg][1]+(P[seg+1][1]-P[seg][1])*q-(seg===1?U*.05*Math.sin(Math.PI*q):0);
      ctx.save();ctx.globalAlpha=k>.9?Math.max(0,1-(k-.9)/.1):1;
      ctx.strokeStyle='#5b3a1c';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(hx,hk);ctx.lineTo(x,y-cs*.28);ctx.stroke();
      ctx.strokeStyle='#3a3f47';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y-cs*.12,cs*.16,Math.PI*1.1,Math.PI*2.1);ctx.stroke();
      crate(x,y,cs,c.g);
      ctx.restore();
    }
  }
  window.addEventListener('resize',()=>{if(screen==='yukleme'){size();draw(performance.now());}});
  return{SAHNE,reset,show,receive,shine,sail,size,paintBg:()=>{map=zeminMap();paintBg();},geo,get items(){return items.length;},get sink(){return sinkT;},get sailing(){return !!sailT0;},get vinc(){return crane.length;}};
})();

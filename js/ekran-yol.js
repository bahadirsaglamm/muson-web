// js/ekran-yol.js — Yol sahnesi (yükleme ile varış/savaş arası) (Yol). Tanımlar: Yol · Kullanır: t, $, RM, yatayAcik, modalGuard, shipBig, shipTier, SES, vib, SAVAS_IMG, CILA
"use strict";
/* ================= yol sahnesi: yükleme ile varış/savaş arası (~1,6 sn, dokununca geçilir) ================= */
const Yol=(()=>{
  const ov=$('voyage'),cv=$('v-cv'),ctx=cv.getContext('2d'),DUR=1600;
  // otomatik savunma sahnesi (o.savun): gemi yerinde, iki top atışı, korsan uzaklaşır
  const SAVUN={DUR:2100,ATIS:[250,620],UCUS:430,KACIS:1150,KACIS_SURE:800};
  // sahne yazıları (draw'ın t parametresi zaman olduğu için baştan alınır)
  const YAZI={puskurt:t('voyage.fx.repelled'),korsan:t('voyage.fx.pirates')};
  const YOL_YATAY_SAHNE=.74; // yatay düzende sahnenin ekran yüksekliğine oranı
  let on=false,t0=0,pir=false,sav=false,dur=DUR,cb=null,cried=false,W=375,H=700,raf=false,tok=0,ates={};
  function size(){
    W=ov.clientWidth||window.innerWidth||375;H=ov.clientHeight||window.innerHeight||700;
    const d=window.devicePixelRatio||1;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);
  }
  function start(p,done,o){
    on=true;pir=!!p;sav=!!(o&&o.savun);dur=sav?SAVUN.DUR:DUR;cb=done;cried=sav;ates={};t0=performance.now();
    ov.classList.add('on');size();if(!sav)SES.cal('yelken',{sabit:true});
    const my=++tok;setTimeout(()=>{if(my===tok)finish();},RM?300:dur);
    if(!raf){raf=true;requestAnimationFrame(tick);}
  }
  function cry(){if(pir&&!cried){cried=true;SES.cal('korsan',{sabit:true});vib([30,40,30]);}}
  // atlanırsa ya da hareket azaltılmışsa atış sesleri yine duyulur
  function finish(){if(!cb)return;cry();if(sav){if(!ates.a0){ates.a0=1;SES.cal('top');}if(!ates.p0){ates.p0=1;SES.cal('patlama');}}const f=cb;cb=null;f();}
  function stop(){if(!on)return;on=false;cb=null;tok++;ov.classList.remove('on');}
  // dokununca geçilir; aynı dokunuş beliren penceredeki düğmeye basmasın
  ov.addEventListener('pointerdown',()=>{if(cb){t0=Math.min(t0,performance.now()-dur);modalGuard=performance.now()+400;finish();}});
  window.addEventListener('resize',()=>{if(on)size();});
  function tick(){
    if(!on){raf=false;return;}
    try{draw(performance.now()-t0);}catch(_){}
    requestAnimationFrame(tick);
  }
  function draw(t){
    // yatay düzende (web) sahne ekranın büyük kısmını kaplar; altında pencere durur
    const SH=Math.round(yatayAcik?H*YOL_YATAY_SAHNE:Math.min(H*.64,W*1.3)),k=Math.min(1,t/dur);
    let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0f4c5c');g.addColorStop(1,'#0b3a47');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const bg=SAVAS_IMG.get('arkaplan');let hy;
    if(bg){
      const iw=bg.naturalWidth||1280,ih=bg.naturalHeight||714,s=Math.max((W+40)/iw,SH/ih),dw=iw*s,dh=ih*s,ox=(W-dw)/2+20-40*k,oy=(SH-dh)/2;
      ctx.drawImage(bg,ox,oy,dw,dh);hy=oy+dh*.595;
    }else{
      hy=SH*.42;
      g=ctx.createLinearGradient(0,0,0,hy);g.addColorStop(0,'#4fb3ec');g.addColorStop(1,'#c6ecfb');ctx.fillStyle=g;ctx.fillRect(0,0,W,hy);
      g=ctx.createLinearGradient(0,hy,0,SH);g.addColorStop(0,'#5cb7e2');g.addColorStop(1,'#2f8fc4');ctx.fillStyle=g;ctx.fillRect(0,hy,W,SH-hy);
    }
    // ufukta korsan (otomatik savunmada baştan görünür, vurulunca uzaklaşıp kaybolur)
    const kac=sav?Math.max(0,Math.min(1,(t-SAVUN.KACIS)/SAVUN.KACIS_SURE)):0;
    const pH=SH*.25,pW=pH*477/640,pX=W*.78+W*.4*kac*kac,pWl=hy+SH*.05+Math.sin(t*.003)*1.5;
    if(pir){
      const a=sav?1-kac:Math.max(0,Math.min(1,(t-450)/450)),im=SAVAS_IMG.get('korsan');
      ctx.save();ctx.globalAlpha=a;ctx.beginPath();ctx.rect(0,0,W,pWl);ctx.clip();
      ctx.translate(pX,pWl);ctx.rotate(Math.sin(t*.0022)*.03+kac*.12);
      if(im)ctx.drawImage(im,-pW/2,-pH*.9,pW,pH);
      else{ctx.fillStyle='#2a1a12';ctx.fillRect(-pW*.4,-pH*.25,pW*.8,pH*.2);ctx.fillStyle='#1d1d1f';ctx.fillRect(-pW*.3,-pH*.8,pW*.6,pH*.45);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-pH*.6,pW*.08,0,7);ctx.fill();}
      ctx.restore();
    }
    // kendi gemimiz (güncel kademe): soldan süzülür, dalgada salınır
    const gi=shipBig(),gr=shipTier()?1.1:1,gh=SH*.48*gr,gw=gh*(gi?(gi.naturalWidth||331)/(gi.naturalHeight||400):331/400);
    const e=sav?1:1-Math.pow(1-Math.min(1,t/1400),3);
    const cx=-gw*.7+(W*.42+gw*.7)*e,wl=SH*.86,bobY=(RM?0:Math.sin(t*.004)*4),rot=RM?0:Math.sin(t*.003)*.045;
    // iz
    ctx.save();ctx.globalAlpha=.55*e;ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.lineCap='round';
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(cx-gw*(.45+i*.32),wl-2+i*5);ctx.lineTo(cx-gw*(.2+i*.3),wl-1+i*5);ctx.stroke();}
    ctx.restore();
    ctx.save();ctx.translate(cx,wl+bobY);ctx.rotate(rot);
    if(gi)ctx.drawImage(gi,-gw/2,-gh*.9,gw,gh);
    else{
      ctx.fillStyle='#c98a4b';ctx.beginPath();ctx.moveTo(-gw*.45,-gh*.25);ctx.lineTo(gw*.45,-gh*.25);ctx.lineTo(gw*.32,gh*.05);ctx.lineTo(-gw*.32,gh*.05);ctx.closePath();ctx.fill();
      ctx.fillStyle='#6b4a2a';ctx.fillRect(-gw*.03,-gh*.85,gw*.06,gh*.62);
      ctx.fillStyle='#f3ead2';ctx.beginPath();ctx.moveTo(gw*.02,-gh*.82);ctx.lineTo(gw*.36,-gh*.32);ctx.lineTo(gw*.02,-gh*.32);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(-gw*.04,-gh*.78);ctx.lineTo(-gw*.34,-gh*.32);ctx.lineTo(-gw*.04,-gh*.32);ctx.closePath();ctx.fill();
    }
    ctx.restore();
    // ön dalga: gövdenin altını örter
    ctx.fillStyle='rgba(66,160,214,.96)';ctx.beginPath();ctx.moveTo(0,SH);
    for(let x=0;x<=W+8;x+=8)ctx.lineTo(x,wl+6+Math.sin(x*.045+t*.005)*4+Math.sin(x*.11-t*.003)*2);
    ctx.lineTo(W,SH);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.beginPath();
    for(let x=0;x<=W+8;x+=8){const y=wl+6+Math.sin(x*.045+t*.005)*4+Math.sin(x*.11-t*.003)*2;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.stroke();
    // otomatik savunma: gemiden iki top atışı korsana
    if(sav)SAVUN.ATIS.forEach((ts,i)=>{
      const x0=cx+gw*.3,y0=wl+bobY-gh*.32,hx=W*.78-pW*(.12-.2*i),hy2=pWl-pH*(.35+.12*i),k=(t-ts)/SAVUN.UCUS;
      if(k>=0&&!ates['a'+i]){ates['a'+i]=1;SES.cal('top',{vol:.85,rate:i?.94:1});}
      if(k>=0&&k<1){
        const x=x0+(hx-x0)*k,y=y0+(hy2-y0)*k-SH*.22*4*k*(1-k),r=Math.max(3,6*(1-.5*k));
        const bi=SAVAS_IMG.get('gulle');
        if(bi)ctx.drawImage(bi,x-r,y-r,2*r,2*r);else{ctx.fillStyle='#1d2228';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
        if(k<.18){ctx.fillStyle=`rgba(255,220,140,${.8*(1-k/.18)})`;ctx.beginPath();ctx.arc(x0,y0,12,0,7);ctx.fill();}
      }else if(k>=1&&k<1.9){
        if(!ates['p'+i]){ates['p'+i]=1;SES.cal('patlama',{vol:.8});}
        const q=(k-1)/.9,s=SH*.22*(.4+.8*Math.min(1,q*2.2)),im=SAVAS_IMG.get('patlama');
        ctx.save();ctx.globalAlpha=q<.45?1:Math.max(0,1-(q-.45)/.55);
        if(im)ctx.drawImage(im,hx-s/2,hy2-s/2,s,s);
        else{const rg=ctx.createRadialGradient(hx,hy2,0,hx,hy2,s/2);rg.addColorStop(0,'#fff6c0');rg.addColorStop(.45,'#ffb03a');rg.addColorStop(1,'rgba(230,80,20,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(hx,hy2,s/2,0,7);ctx.fill();}
        ctx.restore();
      }
    });
    // sahnenin altı denize karışır
    g=ctx.createLinearGradient(0,SH-70,0,SH);g.addColorStop(0,'rgba(15,76,92,0)');g.addColorStop(1,'#0f4c5c');ctx.fillStyle=g;ctx.fillRect(0,SH-70,W,70);
    if(sav&&t>=SAVUN.KACIS){
      const q=Math.min(1,(t-SAVUN.KACIS)/220);
      ctx.save();ctx.translate(W/2,SH*.17);ctx.scale(.6+.4*q,.6+.4*q);ctx.globalAlpha=q;
      CILA.yazi(ctx,YAZI.puskurt,0,0,40,'#5fe08a',{cizgi:9,kenar:'rgba(6,40,20,.92)',sigdir:W-24});ctx.restore();
    }else if(pir&&!sav&&t>=850){
      cry();
      const q=Math.min(1,(t-850)/220),sc=.6+.4*q+(q>=1?Math.sin((t-1070)*.012)*.03:0);
      ctx.save();ctx.translate(W/2,SH*.17);ctx.scale(sc,sc);ctx.globalAlpha=q;
      CILA.yazi(ctx,YAZI.korsan,0,0,46,'#ff5a44',{cizgi:10,kenar:'rgba(40,8,4,.92)',sigdir:W-24});ctx.restore();
    }
  }
  return{start,stop,get on(){return on;},get savun(){return on&&sav;}};
})();

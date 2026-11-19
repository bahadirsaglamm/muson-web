// js/ekran-yukleme.js — Yükleme ekranı (blok oyunu arayüzü; rota koşulları: eski/kilitli sandık, porselen, acele, özel ve büyük sipariş; ilk yolculukta sürüklemeyi gösteren el) (SeferUI). Tanımlar: SeferUI (calcLayout dikey, calcYatay yatay web düzeni: tek parça sahne, ortada tahta; ölçüleri YK) · Kullanır: t, tx, pct, kosulAd, kosulTip, ozelHedefAd, SEFER, OYUN, CESIT, $, screen, S, GOODS, RM, hideModal, jingle, fmt, showModal, save, pctf, confirmBox, kaptanPic, IMG, pic, malPic, SES, vib, initAudio, EK_HAMLE, EK_HAMLE_ALTIN, ODEME_ACIK, magazaAc, balon, flyTo, DUZEN, duzenHesap, yatayAcik, safeTB, ahsapCerceve, CILA, go, sailOn, Rihtim
"use strict";
/* ================= yükleme ekranı (blok oyunu) ================= */
const SeferUI=(()=>{
  // ipucu yalnız kuralın ilk çıktığı yolculukta: kaptan konuşma balonuyla söyler (kısa)
  const TIPS={1:t('load.tip.1'),2:t('load.tip.2'),3:t('load.tip.3'),4:t('load.tip.4'),7:t('load.tip.7')};
  // kaptanın kısa tepkileri (aynı balon, 2 sn): load.say.<an>.<sıra>
  const liste=(p,n)=>Array.from({length:n},(_,i)=>t('load.say.'+p+'.'+i));
  const SOZ={saf:liste('saf',3),islak:liste('islak',1),az:liste('az',1),kombo:liste('kombo',2),
    kilit:liste('kilit',2),kirik:liste('kirik',2),ozel:liste('ozel',1),bos:liste('bos',3)};
  const sec=a=>a[(Math.random()*a.length)|0];
  const N=SEFER.N,WM=SEFER.WET_MAX;
  const cv=$('s-cv'),ctx=cv.getContext('2d');
  let game=null,levelN=1,stopIdx=0,replay=false,drag=null,busy=false,rescued=false,Lay={W:0,H:0,cs:30,gw:240,gx:0,gy:12,trayY:280,trayH:116,slotW:100,tcs:20,sahneH:340,dockH:340,trayX:12,trayW:351};
  let fx={pop:null,clear:null,floats:[],banners:[],parts:[],shine:null},animOn=false,flashG=null,tipAcik=false,azDendi=false;
  const SHINE=700;
  // kaptan: ipucu balonu (kalıcı metin) ve kısa tepkiler
  // koşulun açıklaması yalnız ilk çıktığı yolculukta (o yolculukta başka ipucu da varsa ikisi alt alta)
  function tipMetni(){
    const K=game&&game.P.kosul,kt=K&&SEFER.kosulIlk(K.id)===levelN?kosulTip(K):'';
    return [TIPS[levelN],kt].filter(Boolean).join('<br>');
  }
  const tipHtml=()=>tipAcik&&tipMetni()||'';
  function soyle(t){balon($('s-tip'),t,2000,tipHtml);}
  let tipTok=0;
  function tipGoster(){const el=$('s-tip');tipAcik=!!tipMetni();balon(el,tipHtml());tipTok=el._tok;}
  function tipKapat(ms){const my=tipTok;setTimeout(()=>{const el=$('s-tip');if(!tipAcik||my!==tipTok)return;tipAcik=false;if(el._tok===tipTok)balon(el,'');},ms||0);}
  $('s-capp').addEventListener('click',()=>{if(tipMetni()){tipGoster();tipKapat(5000);}else if(game&&game.P.kosul){balon($('s-tip'),kosulTarif(game.P.kosul),4000,tipHtml);}else soyle(sec(SOZ.bos));});

  // koşulun kısa tarifi (kaptana dokununca, ilk yolculuktan sonra)
  function kosulTarif(K){return kosulTip(K);}
  function animating(now){return elDonsun()||(fx.pop&&now-fx.pop.t0<170)||(fx.clear&&now-fx.clear.t0<260)||fx.floats.length||fx.banners.length||fx.parts.length||(fx.shine&&now-fx.shine.t0<SHINE);}
  function tick(){
    const now=performance.now();
    fx.floats=fx.floats.filter(f=>now-f.t0<f.dur);
    fx.banners=fx.banners.filter(b=>now-b.t0<b.dur);
    fx.parts=fx.parts.filter(q=>now-q.t0<q.dur);
    if(fx.shine&&now-fx.shine.t0>=SHINE)fx.shine=null;
    if(screen==='yukleme'&&game)draw();
    if(animating(now))requestAnimationFrame(tick);else animOn=false;
  }
  function kick(){if(!animOn){animOn=true;requestAnimationFrame(tick);}}

  function start(n,si){
    levelN=Math.max(1,n|0);stopIdx=si|0;replay=stopIdx<S.stop;
    const ef=OYUN.effects(S.port,S.ship);
    game=SEFER.newGame(levelN,(Math.random()*2147483647)|0,{extraMoves:ef.extraMoves,deneme:OYUN.denemeSay(S,stopIdx)});
    drag=null;busy=false;rescued=false;fx={pop:null,clear:null,floats:[],banners:[],parts:[],shine:null};flashG=null;azDendi=false;
    el=null;if(S.stop===0&&stopIdx===0&&!replay&&!elBitti)el={t0:performance.now()};
    Rihtim.reset(game.order.reduce((a,o)=>a+o.need,0));
    tipGoster();
    ui();
  }
  function show(){
    const cp=$('s-capp');if(!cp.innerHTML){cp.innerHTML=kaptanPic('kaptan_biz','🧔');cp.classList.toggle('noimg',IMG.failed('kaptan_biz'));}
    ui();layout();draw();Rihtim.show();if(el){el.t0=performance.now();kick();}
  }

  function doPlace(slot,gx,gy){
    if(busy||!game||game.over)return null;
    const pre=game.order.map(o=>o.got>=o.need),ozelOnce=!!(game.ozel&&game.ozel.ok);
    const ev=SEFER.placePiece(game,slot,gx,gy);
    if(!ev)return null;
    elKapat();
    const now=performance.now(),cs=Lay.cs;
    fx.pop={cells:ev.placed,t0:now};
    SES.cal('yerlestir');
    flashG=game.order.filter((o,i)=>!pre[i]&&o.got>=o.need).map(o=>o.g);
    let bi=0;
    if(ev.cleared.length){
      clearFx(ev,now);toShip(ev);
      fx.clear={cells:ev.cleared,t0:now};
      const xs=ev.cleared.map(c=>c.x),ys=ev.cleared.map(c=>c.y);
      const cx=Lay.gx+(Math.min(...xs)+Math.max(...xs)+1)/2*cs,cy=Lay.gy+(Math.min(...ys)+Math.max(...ys)+1)/2*cs;
      const parts=Object.keys(ev.cargoAdd).map(g=>{const a=ev.cargoAdd[g];return[g,a.n+a.q2+a.q3];}).filter(p=>p[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,2);
      parts.forEach((p,k)=>fx.floats.push({x:cx,y:cy+k*26-(parts.length-1)*13,text:t('load.fx.plus',{n:p[1],good:GOODS[p[0]].s}),color:'#ffd54a',t0:now,dur:950}));
      // "×n" yalnız birden çoksa
      const kat=(k,n)=>t(k)+(n>1?' ×'+n:'');
      if(ev.fullPure)banner(kat('load.fx.fullPure',ev.fullPure),'#7ee07e',bi++);
      const saf=ev.pureLines-ev.fullPure;
      if(saf)banner(kat('load.fx.pure',saf),'#ffd54a',bi++);
      if(ev.combo>1)banner(t('ui.fx.combo',{x:ev.combo}),'#ffffff',bi++);
      if(ev.wetN)banner(t('load.fx.wet'),'#9fd0ff',bi++);
      if(ev.kilitN)banner(kat('load.fx.lock',ev.kilitN),'#ffcf8a',bi++);
      if(ev.kirikN)banner(kat('load.fx.broken',ev.kirikN),'#ff9e8a',bi++);
      if(ev.kilitN){SES.cal('patlama',{vol:.55,rate:1.15});vib([8,20,8]);}
      if(ev.kirikN)SES.cal('hata',{vol:.5});
      SES.cal('sira',{rate:1+.06*Math.min(3,ev.combo-1),sabit:ev.combo>1});
      if(ev.pureLines)SES.cal('safsira',{vol:ev.fullPure?1:.85,rate:ev.fullPure?1.12:1});
      if(ev.wetN)SES.cal('su',{vol:.4});
      vib(ev.combo>1?[10,40,10]:12);
      if(ev.kirikN)soyle(sec(SOZ.kirik));else if(ev.kilitN)soyle(sec(SOZ.kilit));else if(ev.wetN)soyle(sec(SOZ.islak));else if(ev.pureLines)soyle(sec(SOZ.saf));else if(ev.combo>1)soyle(sec(SOZ.kombo));
    }else vib(6);
    if(game.ozel&&game.ozel.ok&&!ozelOnce&&game.ozel.tur!=='hamle'){banner(t('load.fx.special')+' ✓','#7ee07e',bi++);SES.cal('safsira',{vol:.7,rate:1.2});soyle(sec(SOZ.ozel));}
    if(!azDendi&&!ev.over&&game.movesLeft>0&&game.movesLeft<=3){azDendi=true;soyle(sec(SOZ.az));}
    if(game.moves===1)tipKapat(4000);
    ui();kick();
    const g=game;
    if(ev.over==='lose'&&!g.kayipSayildi){g.kayipSayildi=1;OYUN.denemeKayip(S,stopIdx);save();} // kurtarmadan sonraki ikinci kayıp sayılmaz
    if(ev.over==='win'){busy=true;setTimeout(()=>{if(g===game)win();},650);}
    else if(ev.over==='lose'){busy=true;setTimeout(()=>{if(g===game)lose();},500);}
    return ev;
  }
  function banner(text,color,slot){fx.banners.push({text,color,slot,t0:performance.now(),dur:1150});}
  // sıra teslimi: hücrelerden renkli parçacıklar, mal ikonları Ambar sayacına uçar, saf sırada altın parıltı
  function clearFx(ev,now){
    const cs=Lay.cs;
    if(ev.pureLines)fx.shine={lines:ev.lines.filter(L=>L.pure),t0:now};
    if(RM)return;
    const per=ev.cleared.length>24?1:2;
    for(const c of ev.cleared.slice(0,40)){
      const x=Lay.gx+c.x*cs+cs/2,y=Lay.gy+c.y*cs+cs/2,col=c.wet?'#9fd0ff':c.kirik?'#f4f7fb':c.eski||!c.good?'#8a6a44':GOODS[c.good].c;
      for(let k=0;k<per;k++){const a=Math.random()*Math.PI*2,v=60+Math.random()*110;
        fx.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,col,r:2.2+Math.random()*2.6,t0:now,dur:520+Math.random()*260});}
    }
  }
  // teslim edilen mallar tahtadan rıhtımdaki gemiye kavisle uçar ve güverteye düşer (en çok 6 ikon)
  function toShip(ev){
    const dry=ev.cleared.filter(c=>!c.wet&&!c.kirik&&c.good);
    if(ev.pureLines)Rihtim.shine();
    if(!dry.length)return;
    const cs=Lay.cs,n=Math.min(6,dry.length),step=dry.length/n,pick=[],delay=[],land=[];
    for(let k=0;k<n;k++){pick.push(dry[Math.floor(k*step)]);delay.push(120+k*55);land.push(RM?0:120+k*55+640);}
    const pts=Rihtim.receive(pick.map(c=>c.good),land,SEFER.cargoCount(game.cargo));
    if(RM)return;
    const r=cv.getBoundingClientRect?cv.getBoundingClientRect():{left:0,top:0},hold=$('s-hold');
    pick.forEach((c,k)=>flyTo(c.good==='porselen'?'porselen':'mal_'+c.good,GOODS[c.good].e,r.left+Lay.gx+c.x*cs+cs/2,r.top+Lay.gy+c.y*cs+cs/2,$('s-scene'),
      {to:pts[k],delay:delay[k],dur:640,s0:cs/28,s1:.55,arc:(k%2?18:-18),lift:30,
       onHit:k===n-1?()=>{hold.classList.remove('bump');void hold.offsetWidth;hold.classList.add('bump');}:null}));
  }

  function ui(){
    if(!game)return;
    const t=OYUN.tripInfo(stopIdx);
    $('s-title').textContent=tx('ui.voyage',{n:levelN})+(replay?' · '+tx('ui.replay'):'');
    $('s-hold').textContent=tx('load.hold',{n:SEFER.cargoCount(game.cargo)});
    const hot=GOODS[t.pricey];
    const K=game.P.kosul,oz=game.ozel,ozD=oz?(oz.ok&&(oz.tur!=='hamle'||oz.bitti)?'ok':oz.tur==='hamle'&&game.movesLeft<oz.hedef?'bad':''):'';
    const ozI=oz?(oz.tur==='cift'?(oz.ok?'✓':''):oz.tur==='saf'?Math.min(oz.ilerleme,oz.hedef)+'/'+oz.hedef:(ozD==='ok'?'✓':'')):'';
    const rk=`${t.from} → ${t.to}|${t.pricey}|${t.pirate?1:0}|${K?K.id:''}|${ozD}|${ozI}`;
    if($('s-route')._k!==rk){$('s-route')._k=rk;
      let kp='';
      if(K){
        const ad=kosulAd(K.id);
        kp=`<span class="dk-pill kosul k-${K.id}" title="${ad}">${CESIT.ikonHtml(K)}<span class="tx">${ad}</span>${K.id==='acele'||K.id==='buyuk'||K.id==='eski'?` <small>${pct(K.prim*100)}</small>`:''}</span>`;
        if(oz)kp+=`<span class="dk-pill ozel ${ozD}" title="${tx('load.special.title',{p:Math.round(K.prim*100)})}">⭐ <span class="tx">${ozelHedefAd(K.ozel)}</span>${ozI?' <b>'+ozI+'</b>':''}</span>`;
      }
      $('s-route').innerHTML=`<span class="dk-pill"><span class="tx">${t.from} → ${t.to}</span></span><span class="dk-pill hot" title="${tx('load.pricey',{good:hot.n})}">${IMG.failed('mal_'+t.pricey)?hot.e:pic('mal_'+t.pricey,hot.e)} ×${pctf(1.5)}</span>${t.pirate?`<span class="dk-pill pir" title="${tx('load.pirate')}">⚔</span>`:''}${kp}`;}
    const fl=flashG||[],named=game.order.length<4;flashG=null;
    $('s-order').innerHTML=game.order.map(o=>`<span class="chip ${o.got>=o.need?'ok':''}${fl.includes(o.g)?' flash':''}" title="${GOODS[o.g].n}">${CESIT.malFailed(o.g)?`<i style="background:${GOODS[o.g].c}"></i>`:CESIT.malHtml(o.g)}${named?GOODS[o.g].n+' ':''}${o.got}/${o.need}</span>`).join('');
    const ml=game.movesLeft;
    $('s-moves').textContent=ml;$('s-mv').classList.toggle('low',ml<=3&&ml>0&&!game.over);
    $('s-mv').classList.toggle('acele',!!(K&&K.id==='acele'));
    const st=[`<span class="chip plain ${game.pure>=game.P.ustaT?'ok':''}" title="${tx('load.pure.title')}">${tx('load.pure',{a:game.pure,b:game.P.ustaT})}</span>`];
    if(game.P.wet)st.push(`<span class="chip plain ${game.wet>WM?'bad':''}" title="${tx('load.wet.title')}">💦 ${game.wet}/${WM}</span>`);
    if(K&&K.id==='porselen')st.push(`<span class="chip plain ${game.kirik?'bad':''}" title="${tx('load.broken.title')}">💔 ${game.kirik}</span>`);
    $('s-status').innerHTML=st.join('');
  }
  // kurtarma: "Rüzgâr döndü" -> +5 hamle, "Ambar tıkandı" -> en dolu iki sıra boşalır. Deneme başına bir kez (altın ya da jeton).
  function rescue(kind){
    if(!game||game.over!=='lose'||rescued)return false;
    const r=kind==='hamle'?SEFER.addMoves(game,EK_HAMLE):SEFER.freeSpace(game);
    if(!r)return false;
    rescued=true;busy=false;hideModal();
    const now=performance.now();
    if(r.cleared.length){clearFx({cleared:r.cleared,pureLines:0,lines:[]},now);fx.clear={cells:r.cleared,t0:now};banner(t('load.fx.space'),'#9fd0ff',0);
      if(r.cleared.some(c=>c.kilit))SES.cal('patlama',{vol:.5,rate:1.15});}
    if(kind==='hamle')banner(t('load.fx.moves',{n:EK_HAMLE}),'#ffd54a',r.cleared.length?1:0);
    SES.cal('yelken',{sabit:true});vib([12,30,12]);
    ui();draw();kick();
    return true;
  }
  // kayıp penceresi: "+5 hamle" (hamle bitti) ya da "ambarda yer aç" (ambar doldu); altınla ya da jetonla, deneme başına bir kez.
  // Altın yetmezse: ödeme açıksa "Altın al" mağazayı açar (kapanınca bu pencereye dönülür), kapalıysa düğme pasif "altın yetmez".
  // sessiz: mağazadan dönüşte ezgi yeniden çalmaz
  function lose(sessiz){
    if(!sessiz)jingle(false);
    const byMoves=game.loseReason==='moves',kind=byMoves?'hamle':'yer',lbl=byMoves?t('load.lose.moves',{n:EK_HAMLE}):t('load.lose.space');
    let opts='';
    if(!rescued){
      const gOk=S.gold>=EK_HAMLE_ALTIN;
      opts=gOk||!ODEME_ACIK?`<button class="gold" data-act="altin" data-sessiz ${gOk?'':'disabled'}>${t('ui.gold',{n:EK_HAMLE_ALTIN})}<small>${gOk?lbl:lbl+' · '+t('ui.notEnough')}</small></button>`
        :`<button class="gold" data-act="altinal" data-sessiz>${t('shop.buyGold')}<small>${t('ui.forGold',{x:lbl,gold:EK_HAMLE_ALTIN})}</small></button>`;
      if(S.jeton>0)opts+=`<button class="jet" data-act="jeton" data-sessiz>${t('ui.useToken',{n:S.jeton})}<small>${lbl}</small></button>`;
      opts=`<div class="opts">${opts}</div>`;
    }
    const g=game;
    showModal(`<h2 class="t-daginik">${byMoves?t('load.lose.windTitle'):t('load.lose.fullTitle')}</h2><p>${byMoves?t('load.lose.windText'):t('load.lose.fullText')} ${t('load.lose.loaded',{list:game.order.map(o=>GOODS[o.g].n+' '+o.got+'/'+o.need).join(', ')})}</p>
      ${opts}<div class="row"><button data-act="map">${t('ui.toMap')}</button><button class="primary" data-act="retry">${t('ui.retry')}</button></div>`,
      {map:()=>go('map'),retry:()=>{hideModal();start(levelN,stopIdx);show();},
       altin:()=>{if(g!==game||rescued||S.gold<EK_HAMLE_ALTIN)return false;S.gold-=EK_HAMLE_ALTIN;save();SES.cal('altin');return rescue(kind);},
       altinal:()=>{if(!ODEME_ACIK||g!==game||rescued)return false;magazaAc(()=>{if(g!==game||!go('yukleme'))return go('map');if(game.over==='lose'&&!rescued)lose(true);});return true;},
       jeton:()=>{if(g!==game||rescued||!(S.jeton>0))return false;S.jeton--;save();return rescue(kind);}});
  }
  function win(){
    Rihtim.sail();soyle(tx('load.say.sail'));
    const r=SEFER.grade(game),names={usta:tx('load.stow.usta'),duzgun:tx('load.stow.duzgun'),daginik:tx('load.stow.daginik')};
    const t=OYUN.tripInfo(stopIdx);
    const ks=SEFER.kosulSonuc(game),K=game.P.kosul;
    OYUN.startTrip(S,stopIdx,{cargo:game.cargo,tier:r.tier,early:game.early,kosul:ks});save();
    const li=Object.keys(game.cargo).map(g=>{const c=game.cargo[g],q=c.q2+c.q3;
      return `<li><span>${CESIT.malHtml(g)}${GOODS[g].n}${g===t.pricey?' <small>(×'+pctf(1.5)+')</small>':''}${g==='porselen'?' <small>(×2)</small>':''}</span><b>${c.n+q}${q?' · '+tx('load.win.q',{n:q}):''}${c.wet?' · '+tx(g==='porselen'?'load.win.broken':'load.win.wet',{n:c.wet}):''}</b></li>`;});
    li.push(`<li><span>${tx('load.win.early',{n:game.movesLeft})}</span><b>${pct(game.early)}</b></li>`);
    if(K&&K.id==='ozel')li.push(`<li class="${ks.ok?'k-ok':'k-yok'}"><span>⭐ ${tx('load.win.special',{x:ozelHedefAd(K.ozel)})}</span><b>${ks.ok?'✓ '+pct(ks.prim*100):tx('load.win.missed')}</b></li>`);
    else if(ks&&ks.prim)li.push(`<li class="k-ok"><span>${K.e} ${tx('load.win.bonus',{name:kosulAd(K.id)})}</span><b>${pct(ks.prim*100)}</b></li>`);
    li.push(`<li><span>${tx('load.win.gradeLine',{x:names[r.tier]})}</span><b>× ${pctf(r.mult)}</b></li>`);
    jingle(true);
    showModal(`<h2 class="t-${r.tier}">${tx('load.win.title',{x:names[r.tier]})}</h2>
      <ul>${li.join('')}</ul>
      <p>${tx('load.win.text',{city:t.to})}</p>
      <div class="row"><button class="primary" data-act="sail">⛵ ${tx('load.win.sail')}</button></div>`,{sail:sailOn});
  }

  /* ---------- çizim ---------- */
  // Yerleşim ortak hesapla (duzenHesap): sahne · çipler · çerçeveli tahta · parça tepsisi. Tuval tahta ve tepsiyi taşır.
  // W, H: ekran; safeT, safeB: güvenli alan. Dönen: sahne ve tuval içi ölçüler.
  const TEPSI_YAZI=11,TEPSI_PAY=3,TEPSI_UST=26; // tepsi: "Sıradaki yük" yazısının payı, iç boşluk, en büyük önizleme hücresi
  const TEPSI_ADI=t('load.tray');
  function calcLayout(W,H,safeT,safeB){
    const D=DUZEN.yukleme,d=duzenHesap('yukleme',W,H,safeT,safeB),cs=d.hucre,gw=d.gw;
    const gy=D.CERCEVE,trayY=gy+gw+D.CERCEVE+D.TEPSI_ARA,trayH=d.tepsi,CH=trayY+trayH;
    const trayX=D.KENAR,trayW=W-2*D.KENAR,slotW=trayW/3;
    // tcs: üç yuvaya ve tepsi yüksekliğine sığan önizleme hücresi (w×h parça için)
    const tcsFor=(w,h)=>Math.max(8,Math.min(TEPSI_UST,Math.floor((slotW-2*TEPSI_PAY)/w),Math.floor((trayH-TEPSI_YAZI-TEPSI_PAY)/h)));
    return Object.assign(d,{H:CH,cs,gw,gx:d.gx,gy,trayY,trayH,trayX,trayW,slotW,tcs:tcsFor(3,3),tcs4:tcsFor(4,4),tcs5:tcsFor(5,5),tcsFor,dockH:d.sahneH,total:d.toplam,ekranH:H});
  }
  // yatay düzen (web, geniş ekran): tek parça sahne. Rıhtım görseli bütün ekranın zeminidir (js/ekran-rihtim.js);
  // telefondaki gibi alt alta: üstte sahne (gemi), tahtanın hemen üstünde sipariş çipleri, ortada büyük 8×8 tahta, altında küçük parça tepsisi.
  // BOY: tahta kenarı (ekran yüksekliği oranı) · CIP: çip satırı · ARA: tahta ile tepsi arası · TEPSI: tepsi yüksekliği (oran, en az TEPSI_MIN px)
  // ALT: ekranın altındaki boşluk · SAG: tahta ortadan bu kadar sağa (genişlik oranı) · PAY: tuvalin tahta çerçevesi dışındaki yan payı
  //   (parçacıklar ve sürüklenen parça kırpılmasın) · PAY_UST: tuvalin tahtanın üstündeki payı (teslim yazıları çiplerin üstüne taşabilsin) · KENAR: ekran kenarından en az boşluk · CIP_FAZLA: çip satırı tahtadan bu kadar geniş olabilir
  const YK={BOY:.578,CIP:30,ARA:6,TEPSI:.1,TEPSI_MIN:50,ALT:4,SAG:.03,PAY:44,PAY_UST:48,KENAR:12,CIP_FAZLA:160,UST:24};
  // Dönen ölçüler tuvale göredir (gx, gy, tray*); cipX/cipY/cipW, tuvalX/tuvalY ekrana göre (px). su: geminin su çizgisi (çiplerin hemen üstü).
  function calcYatay(W,H){
    const D=DUZEN.yukleme,C=D.CERCEVE;
    const tepsi=Math.max(YK.TEPSI_MIN,Math.round(H*YK.TEPSI));
    const cs=Math.max(26,Math.min(Math.floor(H*YK.BOY/N),Math.floor((W-2*YK.KENAR-2*C)/N))),gw=cs*N,cer=gw+2*C;
    const toplam=YK.CIP+cer+YK.ARA+tepsi+YK.ALT,cipY=Math.max(0,H-toplam),tuvalY=cipY+YK.CIP-YK.PAY_UST;
    // tahtanın ekrandaki sol kenarı (çerçeve dahil): ortada, hafif sağda; ekrandan taşmaz
    const sol=Math.max(YK.KENAR,Math.min(W-YK.KENAR-cer,Math.round((W-cer)/2+W*YK.SAG)));
    const tuvalX=Math.max(0,sol-YK.PAY),TW=Math.min(W,sol+cer+YK.PAY)-tuvalX;
    const gx=sol-tuvalX+C,gy=C+YK.PAY_UST,trayY=gy+gw+C+YK.ARA,trayH=tepsi,CH=trayY+trayH;
    const trayX=gx-C,trayW=cer,slotW=trayW/3;
    const cipW=Math.min(W-2*YK.KENAR,cer+YK.CIP_FAZLA),cipX=Math.max(YK.KENAR,Math.min(W-YK.KENAR-cipW,Math.round(sol+cer/2-cipW/2)));
    // tepsi alçak: yazı yok; önizleme hücresi yuvanın genişliğine ve tepsinin yüksekliğine sığar
    const tcsFor=(w,h)=>Math.max(8,Math.min(YK.UST,Math.floor((slotW-2*TEPSI_PAY)/w),Math.floor((trayH-2*TEPSI_PAY)/h)));
    return{W:TW,H:CH,ekranW:W,ekranH:H,hucre:cs,cs,gw,gx,gy,trayY,trayH,trayX,trayW,slotW,tcs:tcsFor(3,3),tcs4:tcsFor(4,4),tcs5:tcsFor(5,5),tcsFor,
      tepsi,tepsiYazi:0,dockH:H,sahneH:H,total:toplam,toplam,cipX,cipY,cipW,tuvalX,tuvalY,su:cipY-2,tepsiUst:YK.UST,yatay:true};
  }
  function layout(){
    const scr=$('scr-sefer'),dpr=window.devicePixelRatio||1;
    let L,W;
    if(yatayAcik){
      L=calcYatay(window.innerWidth||1280,window.innerHeight||720);W=L.W;
      const px=(k,v)=>scr.style.setProperty(k,Math.round(v)+'px');
      px('--cipX',L.cipX);px('--cipY',L.cipY);px('--cipW',L.cipW);px('--cipH',YK.CIP);px('--tuvalX',L.tuvalX);px('--tuvalY',L.tuvalY);px('--tuvalW',L.W);
      // kaptanın balonu tahtanın soluna sığar (tahtayı örtmez)
      px('--balEn',Math.max(140,L.tuvalX+L.gx-DUZEN.yukleme.CERCEVE-34));
      $('s-dock').style.height='';
    }else{
      const[t,b]=safeTB();W=Math.min(440,scr.clientWidth||cv.clientWidth||window.innerWidth||375);
      L=calcLayout(W,window.innerHeight||812,t,b);
      $('s-dock').style.height=L.sahneH+'px';
    }
    Lay=Object.assign({},L,{W});
    cv.style.height=L.H+'px';cv.width=Math.round(W*dpr);cv.height=Math.round(L.H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    Rihtim.size(yatayAcik?L.su:null);
  }
  const key=(x,y)=>x+','+y;
  function rr(x,y,w,h,r){CILA.rr(ctx,x,y,w,h,r);}
  // mal ikonu taşın üst yüzüne (görsel yoksa emoji)
  function ikon(good,cx,cy,yuz){
    const im=CESIT.mal(good);
    if(im){const is=yuz*.86;ctx.drawImage(im,cx-is/2,cy-is/2,is,is);}
    else{ctx.font=`${Math.round(yuz*.56)}px ${CILA.YAZI}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';ctx.fillText(GOODS[good].e,cx,cy+yuz*.04);}
  }
  // parça: aynı parçanın taşları koyu bir köprüyle birbirine bağlanır, parçanın dış sınırı koyu çizgiyle çevrilir (CILA.hucre taşları)
  const PAY=.05;
  function drawPiece(cells,ox,oy,s,good,o={}){
    const g=GOODS[good],set=new Set(cells.map(c=>key(c[0],c[1]))),p=s*PAY;
    ctx.save();ctx.globalAlpha*=o.alpha==null?1:o.alpha;
    ctx.fillStyle=CILA.ton(g.c,-.5);
    for(const[x,y]of cells){const X=ox+x*s,Y=oy+y*s;
      rr(X+p,Y+p,s-2*p,s-2*p,s*.2);ctx.fill();
      if(set.has(key(x+1,y)))ctx.fillRect(X+s*.5,Y+s*.2,s,s*.6);
      if(set.has(key(x,y+1)))ctx.fillRect(X+s*.2,Y+s*.5,s*.6,s);
    }
    const yz=[];
    for(const[x,y]of cells)yz.push(CILA.hucre(ctx,ox+x*s,oy+y*s,s,g.c,{pay:PAY}));
    ctx.strokeStyle=o.stroke||'rgba(28,14,2,.8)';ctx.lineWidth=Math.max(1.5,s*.06);ctx.lineCap='round';
    ctx.beginPath();
    for(const[x,y]of cells){const X=ox+x*s,Y=oy+y*s,a=p*.5,b=s-p*.5;
      if(!set.has(key(x,y-1))){ctx.moveTo(X+a,Y+a);ctx.lineTo(X+b,Y+a);}
      if(!set.has(key(x,y+1))){ctx.moveTo(X+a,Y+b);ctx.lineTo(X+b,Y+b);}
      if(!set.has(key(x-1,y))){ctx.moveTo(X+a,Y+a);ctx.lineTo(X+a,Y+b);}
      if(!set.has(key(x+1,y))){ctx.moveTo(X+b,Y+a);ctx.lineTo(X+b,Y+b);}
    }
    ctx.stroke();
    for(const h of yz)ikon(good,h.cx,h.cy,h.yuz);
    ctx.restore();
  }
  /* ---------- ilk yolculukta sürükleme eli ----------
     Yalnız oyuncunun ilk yolculuğunda (S.stop 0) ve o yüklemede henüz parça yerleştirilmemişken: kodla çizilen bir el, tepsideki bir parçanın
     üstünden tahtada o parçanın sığdığı yere sürükleme hareketini tekrar tekrar gösterir; parçanın soluk hayaleti elle birlikte gider.
     Oyuncu sürüklemeye başlayınca ya da bir parça yerleşince kaybolur ve bu oturumda (elBitti) geri gelmez. Hareket azaltma (RM) açıksa el
     tepsideki parçanın üstünde durur, hedefe kesik çizgili bir ok uzanır. Tuvalde çizilir: girdiyi engellemez.
     EL: DONGU bir tekrarın süresi (ms), BOY elin boyu (tahta hücresinin katı; en az BOY_MIN px), EGIM elin yatıklığı (radyan).
     Tepsinin altında el sığacak yer yoksa (yatay düzende tepsi ekranın dibinde) el ters döner: yukarıdan aşağıyı gösterir. */
  const EL={DONGU:2400,BOY:1.7,BOY_MIN:56,EGIM:-.32};
  let el=null,elBitti=false;
  function elKapat(){if(el){el=null;elBitti=true;}}
  const elDonsun=()=>!!el&&!RM&&screen==='yukleme'&&!drag;
  // gösterilecek hamle: ilk sığan tepsi parçası ve tahtanın ortasına en yakın sığdığı yer (tahta ölçüsünde gx, gy)
  function elHamle(){
    let en=null;
    game.tray.forEach((t,s)=>{if(!t||en&&en.s!==s)return;const[w,h]=dims(t.cells);
      for(let y=0;y+h<=N;y++)for(let x=0;x+w<=N;x++)if(SEFER.canPlace(game.board,t.cells,x,y)){
        const d=Math.hypot(x+w/2-N/2,y+h/2-N/2);if(!en||d<en.d)en={s,t,w,h,x,y,d};}});
    return en;
  }
  const yumusak=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  function drawEl(now){
    const m=elHamle();if(!m)return;
    const{cs,gx,gy,trayY,trayH,slotW}=Lay,trayX=Lay.trayX||0,tcs=trayCell();
    const yazi=Lay.tepsiYazi==null?TEPSI_YAZI:Lay.tepsiYazi,top=trayY+(yazi||TEPSI_PAY),ih=trayH-(yazi||TEPSI_PAY)-TEPSI_PAY;
    const ax=trayX+m.s*slotW+slotW/2,ay=top+ih/2,bx=gx+(m.x+m.w/2)*cs,by=gy+(m.y+m.h/2)*cs;
    const boy=Math.max(EL.BOY_MIN,cs*EL.BOY),ters=ay+boy*.95>Lay.H;
    if(RM){
      // sabit: tepsiden hedefe kesik çizgili ok, hedefte soluk hayalet, el parçanın üstünde
      drawPiece(m.t.cells,bx-m.w*cs/2,by-m.h*cs/2,cs,m.t.good,{alpha:.4,stroke:'#fff'});
      elOk(ax,ay-ih*.2,bx,by+m.h*cs/2+6);elCiz(ax,ay,boy,1,1,0,ters);return;
    }
    // evreler (bir tekrarın oranı): görünür, parçaya basar, hedefe taşır, bırakır, solar
    const k=((now-el.t0)%EL.DONGU)/EL.DONGU;
    let p=0,bas=0,a=1;
    if(k<.12){a=k/.12;}
    else if(k<.22){bas=(k-.12)/.1;}
    else if(k<.68){bas=1;p=yumusak((k-.22)/.46);}
    else if(k<.8){p=1;bas=1-(k-.68)/.12;}
    else{p=1;a=1-(k-.8)/.2;}
    const x=ax+(bx-ax)*p,y=ay+(by-ay)*p;
    if(k>=.22){
      const s=tcs+(cs-tcs)*p;
      drawPiece(m.t.cells,x-m.w*s/2,y-m.h*s/2,s,m.t.good,{alpha:.5*a,stroke:'#fff'});
    }
    elCiz(x,y,boy,a,1-.1*bas,bas,ters);
  }
  // el ve ok ortak çizimdir (js/yerlesim.js CILA.el, CILA.elOk; korsan savaşının ilk hamle eli de kullanır)
  const elCiz=(x,y,boy,a,k,bas,ters)=>CILA.el(ctx,x,y,boy,a,k,bas,ters,EL.EGIM);
  const elOk=(x1,y1,x2,y2)=>CILA.elOk(ctx,x1,y1,x2,y2);
  // eski sandık: koyu ahşap taş, üstünde sandık görseli (yoksa kodla çizilen tahtalar)
  const ESKI_RENK='#7a6248';
  function drawEski(X,Y,s,alpha){
    ctx.save();ctx.globalAlpha*=alpha==null?1:alpha;
    const h=CILA.hucre(ctx,X,Y,s,ESKI_RENK,{pay:PAY}),im=CESIT.get('eski_sandik'),f=h.yuz*.86;
    if(im)ctx.drawImage(im,h.cx-f/2,h.cy-f/2,f,f);
    else{
      const x0=h.cx-f/2,y0=h.cy-f/2;
      ctx.strokeStyle='rgba(40,26,12,.7)';ctx.lineWidth=Math.max(1.2,s*.045);ctx.beginPath();
      ctx.moveTo(x0+f*.08,y0+f*.36);ctx.lineTo(x0+f*.92,y0+f*.36);ctx.moveTo(x0+f*.08,y0+f*.66);ctx.lineTo(x0+f*.92,y0+f*.66);
      ctx.moveTo(x0+f*.2,y0+f*.16);ctx.lineTo(x0+f*.8,y0+f*.86);ctx.stroke();
    }
    ctx.restore();
  }
  // kilitli sandık: içindeki mal soluk taşta, üstünde zincir ve asma kilit (görsel ya da kodla)
  function drawKilit(X,Y,s,good,alpha){
    ctx.save();ctx.globalAlpha*=alpha==null?1:alpha;
    const h=CILA.hucre(ctx,X,Y,s,good?GOODS[good].c:ESKI_RENK,{pay:PAY});
    if(good){ctx.save();ctx.globalAlpha*=.55;ikon(good,h.cx,h.cy,h.yuz);ctx.restore();}
    ctx.fillStyle='rgba(20,24,32,.28)';rr(X+s*PAY,Y+s*PAY,s*(1-2*PAY),s*(1-2*PAY),s*.2);ctx.fill();
    const im=CESIT.get('kilit');
    if(im)ctx.drawImage(im,X,Y,s,s);
    else{
      ctx.strokeStyle='#c9ced6';ctx.lineWidth=Math.max(2,s*.09);ctx.setLineDash([s*.12,s*.07]);ctx.beginPath();
      ctx.moveTo(X+s*.1,Y+s*.1);ctx.lineTo(X+s*.9,Y+s*.9);ctx.moveTo(X+s*.9,Y+s*.1);ctx.lineTo(X+s*.1,Y+s*.9);ctx.stroke();ctx.setLineDash([]);
      const w=s*.36,hh=s*.28,lx=X+s/2-w/2,ly=Y+s*.52;
      ctx.strokeStyle='#4a4f58';ctx.lineWidth=Math.max(2,s*.07);ctx.beginPath();ctx.arc(X+s/2,ly,w*.32,Math.PI,0);ctx.stroke();
      ctx.fillStyle='#d9a63a';rr(lx,ly,w,hh,3);ctx.fill();ctx.strokeStyle='#5b370c';ctx.lineWidth=1.2;rr(lx,ly,w,hh,3);ctx.stroke();
      ctx.fillStyle='#3a2300';ctx.fillRect(X+s/2-1,ly+hh*.3,2,hh*.4);
    }
    ctx.restore();
  }
  function drawEngeller(gx,gy,cs){
    for(let i=0;i<N*N;i++){const v=game.board[i];if(v!=='#e'&&v!=='#k')continue;
      const X=gx+(i%N)*cs,Y=gy+((i/N)|0)*cs;
      if(v==='#e')drawEski(X,Y,cs);else drawKilit(X,Y,cs,game.lock[i]);}
  }
  function dims(cells){return[Math.max(...cells.map(c=>c[0]))+1,Math.max(...cells.map(c=>c[1]))+1]}
  // ambar: ortak ahşap çerçeve ve oyuk yuvalar (CILA.cerceve; boyut başına bir kez çizilir)
  function drawDeck(){
    const{gw,gx,gy}=Lay;
    CILA.cerceve(ctx,gx,gy,gw,gw,DUZEN.yukleme.CERCEVE,{izgara:N});
  }
  function dragPos(){
    const t=game.tray[drag.slot],[w,h]=dims(t.cells),s=Lay.cs;
    const lift=drag.type==='mouse'?0:s*1.4;
    const ox=drag.x-w*s/2,oy=drag.y-lift-h*s/2;
    return{ox,oy,gx:Math.round((ox-Lay.gx)/s),gy:Math.round((oy-Lay.gy)/s),t};
  }
  // tepsi önizleme hücresi: üç parçanın hepsine sığan en büyük boy (hepsi aynı ölçekte)
  function trayCell(){
    let c=Lay.tepsiUst||TEPSI_UST;
    for(const t of game.tray)if(t){const[w,h]=dims(t.cells);c=Math.min(c,Lay.tcsFor?Lay.tcsFor(w,h):Lay.tcs);}
    return c;
  }
  function draw(){
    if(!game)return;
    const{W,H,cs,gw,gx,gy,trayY,trayH,slotW}=Lay,now=performance.now();
    ctx.clearRect(0,0,W,H);
    drawDeck();
    const groups={};
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const g=game.board[y*N+x];if(g&&g[0]!=='#')(groups[g]=groups[g]||[]).push([x,y]);}
    drawEngeller(gx,gy,cs);
    const popSet=fx.pop&&now-fx.pop.t0<170?new Set(fx.pop.cells.map(c=>key(c[0],c[1]))):null;
    for(const g in groups){
      for(const c of groups[g]){
        if(popSet&&popSet.has(key(c[0],c[1]))){
          const t=(now-fx.pop.t0)/170,k=1+.14*(1-t)*(1-t),cx=gx+c[0]*cs+cs/2,cy=gy+c[1]*cs+cs/2;
          ctx.save();ctx.translate(cx,cy);ctx.scale(k,k);ctx.translate(-cx,-cy);drawPiece([c],gx+c[0]*cs,gy+c[1]*cs,cs,g);ctx.restore();
        }
      }
      const rest=popSet?groups[g].filter(c=>!popSet.has(key(c[0],c[1]))):groups[g];
      if(rest.length)drawPiece(rest,gx,gy,cs,g);
    }
    if(drag&&drag.moved){
      const{gx:cx,gy:cy,t}=dragPos();
      if(SEFER.canPlace(game.board,t.cells,cx,cy)){
        const ev=SEFER.evaluate(game,t.cells,cx,cy,t.good);
        ev.lines.forEach(L=>{
          ctx.fillStyle=L.pure==='tam'?'rgba(120,230,120,.45)':L.pure==='saf'?'rgba(255,190,40,.5)':'rgba(255,236,150,.38)';
          L.kind==='row'?ctx.fillRect(gx,gy+L.i*cs,gw,cs):ctx.fillRect(gx+L.i*cs,gy,cs,gw);
          if(L.pure){ctx.save();ctx.strokeStyle=L.pure==='tam'?'#5fd35f':'#ffb300';ctx.lineWidth=3;
            L.kind==='row'?ctx.strokeRect(gx+1.5,gy+L.i*cs+1.5,gw-3,cs-3):ctx.strokeRect(gx+L.i*cs+1.5,gy+1.5,cs-3,gw-3);ctx.restore();}
        });
        drawPiece(t.cells,gx+cx*cs,gy+cy*cs,cs,t.good,{alpha:.45,stroke:'#fff'});
      }
    }
    if(fx.shine){
      const t=(now-fx.shine.t0)/SHINE;
      for(const L of fx.shine.lines){
        const row=L.kind==='row',x0=row?gx:gx+L.i*cs,y0=row?gy+L.i*cs:gy,w=row?gw:cs,h=row?cs:gw,len=gw+2*cs,p=-cs+len*t;
        ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,h);ctx.clip();
        ctx.fillStyle=`rgba(255,213,74,${.32*(1-t)})`;ctx.fillRect(x0,y0,w,h);
        const g=row?ctx.createLinearGradient(x0+p-cs,0,x0+p+cs,0):ctx.createLinearGradient(0,y0+p-cs,0,y0+p+cs);
        g.addColorStop(0,'rgba(255,240,170,0)');g.addColorStop(.5,`rgba(255,246,200,${.85*(1-t*.5)})`);g.addColorStop(1,'rgba(255,240,170,0)');
        ctx.fillStyle=g;ctx.fillRect(x0,y0,w,h);ctx.restore();
      }
    }
    for(const q of fx.parts){
      const k=(now-q.t0)/q.dur,tt=(now-q.t0)/1000;
      ctx.globalAlpha=Math.max(0,1-k);ctx.fillStyle=q.col;
      ctx.fillRect(q.x+q.vx*tt-q.r,q.y+q.vy*tt+260*tt*tt-q.r,2*q.r,2*q.r);
    }
    ctx.globalAlpha=1;
    if(fx.clear){
      const t=(now-fx.clear.t0)/260;
      if(t<1){
        for(const c of fx.clear.cells){
          const k=1-t*.85,cx=gx+c.x*cs+cs/2,cy=gy+c.y*cs+cs/2;
          ctx.save();ctx.translate(cx,cy);ctx.scale(k,k);ctx.translate(-cx,-cy);
          if(c.eski)drawEski(gx+c.x*cs,gy+c.y*cs,cs);
          else if(c.kilit)drawKilit(gx+c.x*cs,gy+c.y*cs,cs,c.good);
          else if(c.good)drawPiece([[c.x,c.y]],gx,gy,cs,c.good);
          ctx.fillStyle=c.wet?`rgba(60,140,230,${.7*(1-t)})`:c.kirik?`rgba(255,120,100,${.7*(1-t)})`:`rgba(255,255,240,${.75*(1-t)})`;
          ctx.fillRect(gx+c.x*cs,gy+c.y*cs,cs,cs);
          ctx.restore();
        }
      }else fx.clear=null;
    }
    for(const f of fx.floats){
      const t=(now-f.t0)/f.dur;
      ctx.save();ctx.globalAlpha=Math.max(0,1-t*t);
      CILA.yazi(ctx,f.text,f.x,f.y-46*t,22,f.color,{agirlik:900,cizgi:5,kenar:'rgba(30,16,0,.85)',sigdir:W-16});ctx.restore();
    }
    for(const b of fx.banners){
      const t=(now-b.t0)/b.dur,sc=t<.15?.6+.4*(t/.15):1;
      const y=gy+gw*.32+b.slot*34;
      ctx.save();ctx.globalAlpha=t>.7?Math.max(0,1-(t-.7)/.3):1;
      ctx.translate(gx+gw/2,y);ctx.scale(sc,sc);
      CILA.yazi(ctx,b.text,0,0,22,b.color,{cizgi:7,kenar:'rgba(10,26,34,.9)',sigdir:gw-8});ctx.restore();
    }
    // parça tepsisi: yarı saydam koyu zemin, "Sıradaki yük"; önizleme hücresi o anki üç parçaya sığan en büyük boy
    const{trayX,trayW}=Lay;
    ctx.fillStyle='rgba(6,26,34,.55)';rr(trayX,trayY,trayW,trayH,14);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.14)';ctx.lineWidth=1;rr(trayX+.5,trayY+.5,trayW-1,trayH-1,14);ctx.stroke();
    const yazi=Lay.tepsiYazi==null?TEPSI_YAZI:Lay.tepsiYazi;
    if(yazi){ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='800 10.5px '+CILA.YAZI;ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(TEPSI_ADI,trayX+10,trayY+TEPSI_YAZI/2+2,trayW-20);}
    const tcs=trayCell(),top=trayY+(yazi||TEPSI_PAY),ih=trayH-(yazi||TEPSI_PAY)-TEPSI_PAY;
    game.tray.forEach((t,s)=>{
      if(!t||(drag&&drag.moved&&drag.slot===s))return;
      const[w,h]=dims(t.cells),fits=SEFER.fitsAnywhere(game.board,t.cells);
      drawPiece(t.cells,trayX+s*slotW+(slotW-w*tcs)/2,top+(ih-h*tcs)/2,tcs,t.good,{alpha:fits?1:.35});
    });
    if(drag&&drag.moved){
      const{ox,oy,t}=dragPos();
      drawPiece(t.cells,ox,oy,cs,t.good,{alpha:.92});
    }
    if(el&&!drag)drawEl(now);
  }

  /* ---------- girdi ---------- */
  function pt(e){const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
  cv.addEventListener('pointerdown',e=>{
    initAudio();
    if(busy||!game)return;const[x,y]=pt(e);
    if(y<Lay.trayY-8)return;
    const s=Math.min(2,Math.max(0,Math.floor((x-(Lay.trayX||0))/Lay.slotW)));
    if(!game.tray[s])return;
    drag={slot:s,sx:x,sy:y,x,y,moved:false,type:e.pointerType};
    try{cv.setPointerCapture(e.pointerId);}catch(_){}
    e.preventDefault();
  });
  cv.addEventListener('pointermove',e=>{
    if(!drag)return;const[x,y]=pt(e);drag.x=x;drag.y=y;
    if(!drag.moved&&Math.hypot(x-drag.sx,y-drag.sy)>6){drag.moved=true;elKapat();}
    if(drag.moved&&!animOn)draw();
  });
  function endDrag(){
    if(!drag)return;const d=drag;
    if(!d.moved){drag=null;draw();return;}
    const{gx,gy}=dragPos();drag=null;
    if(!doPlace(d.slot,gx,gy)){
      // tahtanın üstüne bırakılıp sığmadıysa uyarı sesi
      if(d.y<Lay.trayY-8&&gx>-3&&gy>-3&&gx<N+1&&gy<N+1){SES.cal('hata');vib(25);}
      draw();
    }
  }
  cv.addEventListener('pointerup',endDrag);
  cv.addEventListener('pointercancel',()=>{drag=null;draw();});
  $('s-reset').onclick=()=>{if(!busy&&game){start(levelN,stopIdx);show();}};
  $('s-map').onclick=()=>{
    if(busy)return;
    if(!game||game.moves===0){go('map');return;}
    confirmBox(t('load.leave.title'),t('load.leave.text'),t('ui.toMap'),()=>go('map'));
  };
  window.addEventListener('resize',()=>{if(screen==='yukleme'&&game){layout();draw();}});

  return{start,show,doPlace,rescue,calcLayout,hasGame:()=>!!game,redraw:()=>{if(game&&Lay.H)draw();},
    canPlace:(cells,gx,gy)=>!!game&&SEFER.canPlace(game.board,cells,gx,gy),
    get layout(){const L=Object.assign({},Lay);delete L.tcsFor;if(game&&Lay.tcsFor)L.tepsiHucre=trayCell();return L;},
    get _game(){return game;}, // yalnız test: oyun nesnesine doğrudan erişim
    get state(){if(!game)return null;return{levelN,stopIdx,replay,busy,rescued,el:!!el,board:game.board.slice(),tray:game.tray.map(t=>t&&{good:t.good,cells:t.cells.map(c=>c.slice())}),
      order:game.order.map(o=>({...o})),cargo:JSON.parse(JSON.stringify(game.cargo)),hold:SEFER.cargoCount(game.cargo),pure:game.pure,fullPure:game.fullPure,
      movesLeft:game.movesLeft,extraMoves:game.extraMoves,early:game.early,loseReason:game.loseReason,wet:game.wet,moves:game.moves,over:game.over,
      kosul:game.P.kosul?game.P.kosul.id:null,deneme:game.deneme,kirik:game.kirik,kilitKirik:game.kilitKirik,lock:Object.assign({},game.lock),ozel:game.ozel?Object.assign({},game.ozel):null}}};
})();

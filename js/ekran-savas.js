// js/ekran-savas.js — Korsan savaşı ekranı: savaş görselleri (SAVAS_IMG) ve arayüz (SavasUI; ilk korsan savaşında ilk hamleyi gösteren el). Tanımlar: SAVAS_IMG, SavasUI (calcLayout dikey, calcYatay yatay web düzeni: tek parça sahne, ortada tahta, üstünde küpeşte; ölçüleri YS) · Kullanır: t, tx, pctf, SAVAS, OYUN, $, S, screen, fmt, save, jingle, showModal, hideModal, confirmBox, kaptanPic, IMG, SES, vib, initAudio, ODEME_ACIK, kurtarBedeli, magazaAc, balon, DUZEN, duzenHesap, yatayAcik, zeminBoya, safeTB, ahsapCerceve, CILA, go, SatisUI
"use strict";
/* ================= korsan savaşı ekranı ================= */
/* savaş görselleri: oyun açılışında önceden yüklenir; yüklenemeyen görselin yerine kodla çizilir */
const SAVAS_IMG=(()=>{
  const FILES={arkaplan:'arkaplan.jpg',korsan:'korsan.png',korsan_b:'korsan_b.png',guverte:'guverte.png',patlama:'patlama.png',
    gulle:'gulle.png',tahta:'tahta.png',altin:'altin.png',barut:'barut.png',yelken:'yelken.png',zincir:'zincir.png',bomba:'bomba.png'};
  const img={},ok={};
  for(const k in FILES){
    try{
      if(typeof Image==='undefined')break;
      const im=new Image();
      im.onload=()=>{ok[k]=true;};
      im.onerror=()=>{ok[k]=false;};
      im.src='assets/savas/'+FILES[k];img[k]=im;
    }catch(_){ok[k]=false;}
  }
  const cnt=v=>Object.keys(FILES).filter(k=>ok[k]===v).length;
  return{get:k=>ok[k]?img[k]:null,get ready(){return Object.keys(FILES).every(k=>ok[k]);},
    get durum(){return{toplam:typeof Image==='undefined'?0:Object.keys(FILES).length,yuklenen:cnt(true),hatali:cnt(false)};}};
})();

const SavasUI=(()=>{
  // taşlar (sırayla SAVAS.KEYS: gülle, tahta, altın, barut, yelken): renk ve yedek emoji
  const STONES=[
    {c:'#4b5563',e:''},
    {c:'#a8652c',e:'🪵'},
    {c:'#f0b722',e:'🪙'},
    {c:'#d8352a',e:'🧨'},
    {c:'#2f86de',e:'⛵'}
  ];
  // ilk iki savaşta kaptanımız kısa ipucu verir
  const TIPS={1:t('battle.tip.1'),2:t('battle.tip.2')};
  // korsan kaptanlarının adları (uydurma; pirate.name.0-11) ve kısa sözleri (pirate.say.<an>.<sıra>)
  const liste=(p,n)=>Array.from({length:n},(_,i)=>t(p+'.'+i));
  const KORSAN_AD=liste('pirate.name',12);
  const KORSAN_SOZ={bas:liste('pirate.say.bas',4),ates:liste('pirate.say.ates',4),vurul:liste('pirate.say.vurul',3)};
  const korsanAdi=k=>{const n=KORSAN_AD.length,i=(k-1)%n,tur=Math.floor((k-1)/n);return KORSAN_AD[i]+(tur?' '+['','II','III','IV','V'][Math.min(4,tur)]:'');};
  const sec=a=>a[(Math.random()*a.length)|0];
  // Sahnedeki görsel konumları adlandırılmış oranlardır; tarayıcıda bakıp buradan düzeltilir.
  // ZEMIN_*: savas_dikey.jpg'ye oranla; KORSAN_* (konum ve boy): sahne boyuna/genişliğine; KORSAN_SU/TOPLAR/ISABET/DUMAN: korsan_b.png'ye oranla.
  const SAHNE={
    ZEMIN_UFUK:0.415,     // savas_dikey.jpg'de ufuk çizgisi (görsel boyu oranı)
    ZEMIN_UFUK_GENIS:0.439, // yatay düzende aynı görselin ufku (büyütülünce farkı görünür; ölçülen değer)
    ZEMIN_BOY:[900,1613], // görsel yüklenmeden önceki hesap için boyutu
    ZEMIN_RENK:'#0d232e', // görselin alt rengi: görsel bitince ekranın gerisi bununla dolar
    UFUK_Y:0.44,          // ufkun sahnedeki yeri (sahne boyunun oranı)
    KORSAN_X:0.55,        // korsan gemisinin ortası (sahne genişliği oranı)
    KORSAN_BOY:0.60,      // korsan gemisinin boyu (sahne boyunun oranı)
    KORSAN_SU_Y:0.70,     // korsanın su çizgisinin sahnedeki yeri (sahne boyunun oranı)
    KORSAN_SU:0.90,       // korsan_b.png'de su çizgisi (görsel boyunun oranı; altı suya gömülür)
    KORSAN_UST:0.08,      // korsan_b.png'de görünen en üst nokta (bayrak ucu; üstü saydam)
    SALDIRI_Y:0.46,       // "Saldırıya n hamle" rozetinin üst kenarı (sahne boyu oranı; sağ sütunun altına itilir)
    SAG_SUTUN:140,        // sağ üst sütunun (düğmeler, hamle, ganimet) boyu (px, güvenli alan hariç)
    KORSAN_TOPLAR:[[0.66,0.88],[0.75,0.86],[0.84,0.84]],                       // korsan.png'de namlu ağızları (x,y oranı)
    KORSAN_ISABET:[[0.45,0.74],[0.60,0.64],[0.36,0.56],[0.70,0.74],[0.52,0.46]], // güllelerin vurduğu noktalar (korsan.png oranı)
    KORSAN_DUMAN:[[0.58,0.62],[0.30,0.72]],                                   // hasar dumanının çıktığı noktalar (korsan.png oranı)
    GUVERTE_GORUNEN:0.86, // guverte.png'nin sahnede görünen üst kısmı (oran; altı kesilir)
    GUVERTE_TOP_X:[0.285,0.745], // guverte.png'de topların yatay yeri (genişlik oranı)
    GUVERTE_NAMLU_Y:0.12, // guverte.png'de namlu ucunun dikey yeri (boy oranı)
    GUVERTE_TOP_GEN:0.20, // geri tepmede kayan top kesitinin genişliği (genişlik oranı)
    GUVERTE_TOP_BOY:0.68, // geri tepmede kayan top kesitinin boyu (boy oranı)
    BARUT_X:0.24,KACIS_X:0.80, // tahtanın altındaki barut ve kaçınma göstergelerinin yatay yeri (kıvılcım hedefi)
    // yatay düzen (web) için guverte.png'de korkuluk ölçüleri (boy ve genişlik oranı)
    GUVERTE_KORKULUK:0.36, // korkuluğun üst kenarı
    GUVERTE_TABAN:0.742,   // korkuluk tabanının alt kenarı (altı yalnız halat)
    // yanlara döşenen düz korkuluk parçaları (genişlik oranı; her biri bir babalı): görselin iki ucundaki düz korkuluktan alınır, çünkü ortadaki
    // bölüm daha aydınlık (ışık ortadan geliyor) ve uçlarla yan yana ek yeri gösteriyor. Parçalar bir düz bir aynalı döşenir: her ek yerinde iki yan aynı sütundur
    GUVERTE_DOSEME_SOL:[0.002,0.084],GUVERTE_DOSEME_SAG:[0.9264,0.9973],
    GUVERTE_SOLMA:0.012    // görselin kesik kenarları döşemenin üstünde bu genişlikte solar (ek yeri görünmesin)
  };
  // yatay düzen (yalnız html.yatay) ölçüleri; konumlar calcYatay'da hesaplanır.
  // BOY: tahta kenarı (ekran yüksekliği oranı) · ALT: göstergelerin altındaki boşluk · KUPESTE: küpeşte görselinin genişliği (tahta genişliğinin katı; toplar tahtanın üst köşelerinde)
  // BINDIR: korkuluk tabanı tahta çerçevesinin üstüne bu kadar biner (px) · UFUK: ufkun yeri (ekran yüksekliği oranı) · GEMI_BOY: korsan gemisinin boyu (ekran yüksekliği oranı)
  // GEMI_SU: korsanın su çizgisi ufuk ile korkuluk arasında bu oranda (1'e yakın: gemi bize yakın, korkuluğun hemen arkasında) · GEMI_UST: bayrak ucu ile ekranın üstü arası en az boşluk (px)
  // GOST_EN: göstergeler en az bu genişlikte (tahtadan dar değil) · KENAR: ekran kenarından en az boşluk
  // KAP_ARA: kaptanımız ile tahta çerçevesi arası · KAP_HB: kaptanın can çubuğu genişliği (en çok/en az) · SALDIRI_ARA: saldırı kutusu ile korsan gemisi arası · BANNER_Y: duyuruların yeri (ekran yüksekliği oranı)
  const YS={BOY:.49,ALT:8,KUPESTE:1.9,BINDIR:6,UFUK:.215,GEMI_BOY:.325,GEMI_SU:.86,GEMI_UST:8,GOST_EN:390,KENAR:12,KAP_ARA:10,KAP_HB:[80,150],SALDIRI_ARA:24,BANNER_Y:.2};
  const N=SAVAS.N,KEYS=SAVAS.KEYS;
  const cv=$('b-cv'),ctx=cv.getContext('2d'),bgc=$('b-bg');
  let game=null,levelN=1,stopIdx=2,replay=false,sel=null,drag=null;
  let Lay={W:375,H:740,SH:374,cs:47,gw:329,gx:23,gy:389,total:0,ekranH:812,safeT:0};
  let disp=null,anim=null,fx={floats:[],banners:[]},rafOn=false;
  // sahne durumu
  let sfx=[],amb=[],ending=null,sinkT0=0,darkT0=0,vigT0=-1e9,shipHitT=-1e9,deckHitT=-1e9,knockT=-1e9,recoilT=[-1e9,-1e9],turn=0;
  let pendE=0,pendH=0,pendLoot=0,shotBudget=5,lastShot=null,lean=0,smokeT=[0,0],cdSoz=-1;
  let tintC=null,zmap={s:.42,ox:0,oy:0,iw:900,ih:1613},tipAcik=false,tipTok=0;

  function syncDisp(){disp={pirateHp:game.pirateHp,hull:game.hull,broad:game.broad,evade:game.evade,loot:game.loot,movesLeft:game.movesLeft,cd:game.cd};}
  function resetScene(){sfx=[];amb=[];ending=null;sinkT0=0;darkT0=0;vigT0=shipHitT=deckHitT=knockT=-1e9;recoilT=[-1e9,-1e9];
    pendE=pendH=pendLoot=0;shotBudget=5;lastShot=null;lean=0;smokeT=[0,0];cdSoz=-1;}
  function start(k,si){
    levelN=Math.max(1,k|0);stopIdx=si|0;replay=!!(S.trip&&S.trip.replay);
    const ef=OYUN.effects(S.port,S.ship);
    game=SAVAS.newGame(levelN,(Math.random()*2147483647)|0,{hullBonus:ef.hullBonus,fireBonus:ef.fireBonus,dmgPct:ef.dmgPct});
    sel=null;drag=null;anim=null;fx={floats:[],banners:[]};hudK='';
    resetScene();syncDisp();
    $('b-en').classList.remove('out');balon($('b-say'),'');
    tipAcik=!!TIPS[levelN];
    el=null;if(levelN===1&&!replay&&!elBitti)el={t0:performance.now(),m:null};
    ui();
  }
  // kaptanlar: portreler, korsanın sözü, bizim kaptanın ipucu balonu
  function portreler(){
    const e=$('b-enp'),m=$('b-mep');
    if(!e.innerHTML){e.innerHTML=kaptanPic('kaptan_korsan','🏴‍☠️');e.classList.toggle('noimg',IMG.failed('kaptan_korsan'));}
    if(!m.innerHTML){m.innerHTML=kaptanPic('kaptan_biz','🧔');m.classList.toggle('noimg',IMG.failed('kaptan_biz'));}
  }
  function korsanDer(t,ms){balon($('b-say'),t,ms||1800);}
  function tipGoster(){const el=$('b-tip');balon(el,tipAcik&&TIPS[levelN]||'');tipTok=el._tok;}
  function tipKapat(ms){const my=tipTok;setTimeout(()=>{const el=$('b-tip');if(!tipAcik||my!==tipTok)return;tipAcik=false;if(el._tok===tipTok)balon(el,'');},ms||0);}
  function vurdu(id){const el=$(id);if(!el)return;el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');}
  function show(){
    portreler();ui();layout();if(el)el.t0=performance.now();draw();kick();tipGoster();
    if(!game.over&&game.moves===0)setTimeout(()=>{if(screen==='savas'&&game&&game.moves===0)korsanDer(sec(KORSAN_SOZ.bas),2200);},350);
  }
  const shownE=()=>Math.min(game.pirateMax,disp.pirateHp+pendE);
  const shownH=()=>Math.min(game.hullMax,disp.hull+pendH);
  const shownLoot=()=>Math.max(0,disp.loot-pendLoot);

  function ui(){
    if(!game)return;
    const d=disp;
    $('b-title').textContent=t('battle.title',{n:levelN})+(replay?' · '+t('ui.replay'):'');
    $('b-enn').textContent=korsanAdi(levelN);
    hud();
    $('b-blbl').textContent=t('battle.broadside',{n:game.fireDmg});
    $('b-bval').textContent=d.broad+'/'+SAVAS.BROAD_MAX;$('b-bbar').style.width=(100*d.broad/SAVAS.BROAD_MAX)+'%';
    $('b-vval').textContent=d.evade+'/'+SAVAS.EVADE_MAX;$('b-vbar').style.width=(100*d.evade/SAVAS.EVADE_MAX)+'%';
    $('b-gb').classList.toggle('full',d.broad>=SAVAS.BROAD_MAX);$('b-gv').classList.toggle('full',d.evade>=SAVAS.EVADE_MAX);
    const ready=game.broad>=SAVAS.BROAD_MAX&&!game.over&&!anim;
    $('b-fire').disabled=!ready;$('b-fire').classList.toggle('ready',ready);
  }
  // sahnenin üstündeki bilgi (DOM): korsan canı, gövde, ganimet, hamle, saldırı sayacı; yalnız değişince yazılır
  let hudK='';
  function hud(){
    if(!game||!disp)return;
    const d=disp,e=shownE(),h=shownH(),l=shownLoot(),cd=game.over?-1:d.cd;
    const k=[e,h,l,d.movesLeft,cd,game.pirateMax,game.hullMax].join('|');if(k===hudK)return;hudK=k;
    $('b-enhp').textContent=e+'/'+game.pirateMax;$('b-enbar').style.width=(100*e/game.pirateMax)+'%';
    $('b-hp').textContent=h+'/'+game.hullMax;$('b-hbar').style.width=(100*h/game.hullMax)+'%';
    $('b-lootv').textContent=fmt(l);
    $('b-moves').textContent=d.movesLeft;$('b-mv').classList.toggle('low',d.movesLeft<=3&&!game.over);
    const a=$('b-atk');a.classList.toggle('off',cd<0);a.classList.toggle('warn',cd>=0&&cd<=1);$('b-cd').textContent=Math.max(0,cd);$('b-atkp').textContent=t('battle.atkMoves',{n:Math.max(0,cd),p:game.P.atk});
  }
  function bump(id,cls){const el=$(id);el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
  // sessiz: mağazadan dönüşte ezgi yeniden çalmaz
  function showEnd(sessiz){
    if(screen!=='savas'||!S.trip)return;
    const t=OYUN.tripInfo(stopIdx);
    if(game.over==='win'){
      OYUN.battleWon(S,game.reward);save();ui();
      jingle(true);
      showModal(`<h2 class="t-win">${tx('battle.win.title')}</h2>
        <ul><li><span>${tx('battle.win.loot')}</span><b>${fmt(game.loot)}</b></li>
        <li><span>${tx('battle.win.movesLeft',{n:game.movesLeft,b:SAVAS.MOVE_BONUS})}</span><b>+${fmt(game.bonus)}</b></li>
        <li><span>${tx('battle.win.hull')}</span><b>${game.hull}/${game.hullMax}</b></li></ul>
        <div class="total">${tx('ui.goldPlus',{n:game.reward})}</div>
        <p>${replay?tx('battle.win.replay'):tx('battle.win.added')} ${tx('battle.win.safe',{city:t.to})}</p>
        <div class="row"><button class="primary" data-act="go">${tx('battle.toPort')}</button></div>`,{go:()=>{SatisUI.reset();go('satis');}});
    }else{
      if(!sessiz)jingle(false);
      const why=game.loseReason==='hull'?tx('battle.lose.hull'):tx('battle.lose.moves');
      const retry=()=>{hideModal();start(levelN,stopIdx);show();};
      // yükü kurtar: altınla (yağmalanacak yükün satış değerinin yarısı, en az 300) ya da 1 jetonla; yolculuk başına bir kez
      const g=game,canSave=!S.trip.kurtar,bedel=kurtarBedeli(S.trip),gOk=S.gold>=bedel;
      let opts='';
      if(canSave){
        const lbl=tx('battle.lose.save');
        opts=gOk||!ODEME_ACIK?`<button class="gold" data-act="kurtar" data-sessiz ${gOk?'':'disabled'}>${tx('ui.gold',{n:bedel})}<small>${gOk?lbl:lbl+' · '+tx('ui.notEnough')}</small></button>`
          :`<button class="gold" data-act="altinal" data-sessiz>${tx('shop.buyGold')}<small>${tx('ui.forGold',{x:lbl,gold:bedel})}</small></button>`;
        if(S.jeton>0)opts+=`<button class="jet" data-act="jeton" data-sessiz>${tx('ui.useToken',{n:S.jeton})}<small>${lbl}</small></button>`;
        opts=`<div class="opts">${opts}</div>`;
      }
      // ödeme (altın ya da jeton) yalnız kurtarma gerçekleşirse düşülür; ikisi aynı kayıtta
      const kurtar=ode=>{if(g!==game||!canSave||!OYUN.battleRescue(S))return false;ode();save();SatisUI.reset();go('satis');return true;};
      showModal(`<h2 class="t-lose">${tx('battle.lose.title')}</h2>
        <p>${why} ${tx('battle.lose.text')}</p>
        ${opts}
        <div class="row"><button data-act="give">${tx('battle.lose.give')}</button><button class="primary" data-act="retry">${tx('ui.retry')}</button></div>`,
        {give:()=>{OYUN.battleLost(S);save();SatisUI.reset();go('satis');},retry,
         kurtar:()=>S.gold>=bedel&&kurtar(()=>{S.gold-=bedel;SES.cal('altin');}),
         jeton:()=>S.jeton>0&&kurtar(()=>{S.jeton--;}),
         altinal:()=>{if(!ODEME_ACIK||g!==game)return false;magazaAc(()=>{if(g!==game||!S.trip||S.trip.phase!=='savas'||!go('savas'))return go('map');showEnd(true);});return true;}});
    }
  }

  /* ---------- tahta animasyonu (girdi kilidi bununla) ---------- */
  const DUR={swap:150,back:150,pop:190,fall:180};
  function play(phases,onEnd){
    anim={phases,i:0,t0:performance.now(),onEnd};
    if(phases[0]&&phases[0].enter)phases[0].enter();
    kick();
  }
  function finishAnim(){
    if(!anim)return;const a=anim;
    for(let k=a.i+1;k<a.phases.length;k++)if(a.phases[k].enter)a.phases[k].enter();
    anim=null;if(a.onEnd)a.onEnd();
  }
  // döngü yalnız savaş ekranı açıkken döner (salınım + efektler); ekrandan çıkınca durur
  function kick(){if(!rafOn&&screen==='savas'&&game){rafOn=true;requestAnimationFrame(tick);}}
  function tick(){
    const now=performance.now();
    if(anim){
      let ph=anim.phases[anim.i];
      while(ph&&now-anim.t0>=DUR[ph.type]){
        anim.t0+=DUR[ph.type];anim.i++;ph=anim.phases[anim.i];
        if(ph&&ph.enter)ph.enter();
      }
      if(!ph){const a=anim;anim=null;if(a.onEnd)a.onEnd();}
    }
    const cur=sfx;sfx=[];
    for(const it of cur){
      if(!it.st&&now>=it.t0){it.st=1;if(it.start)it.start(now);}
      if(it.st&&now>=it.t0+it.dur){if(it.end)it.end(now);}else sfx.push(it);
    }
    fx.floats=fx.floats.filter(f=>now-f.t0<f.dur);
    fx.banners=fx.banners.filter(b=>now-b.t0<b.dur);
    if(game)ambient(now);
    if(ending&&game){
      if(!ending.go){
        if(!sfx.some(s=>s.block)||now-ending.t>3000){
          ending.go=now;
          if(ending.kind==='win'){sinkT0=now;SES.cal('batis',{sabit:true});$('b-en').classList.add('out');balon($('b-say'),'');}
          else{darkT0=now;SES.cal('patlama',{vol:.7,rate:.7});vib([40,40,60]);}
        }
      }else if(now-ending.go>=(ending.kind==='win'?1050:620)){ending=null;showEnd();}
    }
    if(screen==='savas'&&game){hud();draw();requestAnimationFrame(tick);}else rafOn=false;
  }
  function beginEnd(kind){ending={kind,t:performance.now(),go:0};kick();}
  function banner(text,color){const slot=fx.banners.filter(b=>performance.now()-b.t0<b.dur*.6).length;fx.banners.push({text,color,slot:slot%3,t0:performance.now(),dur:1100});kick();}
  function floatAt(x,y,text,color,big){fx.floats.push({x,y,text,color,big:!!big,t0:performance.now(),dur:big?1100:950});kick();}
  const cellC=(x,y)=>[Lay.gx+x*Lay.cs+Lay.cs/2,Lay.gy+y*Lay.cs+Lay.cs/2];

  /* ---------- sahne geometrisi ---------- */
  const korsanImg=()=>SAVAS_IMG.get('korsan_b')||SAVAS_IMG.get('korsan');
  // sahnenin genişliği: ekran (yatay düzende de tuval bütün ekrandır)
  const sw=()=>Lay.SW||Lay.W;
  // efekt ölçeği: dikeyde sahne boyu; yatayda gemi boyuna göre aynı oranın karşılığı (gülle, patlama, yay)
  const U=()=>Lay.U||Lay.SH;
  function shipBase(){
    const im=korsanImg(),ar=im?(im.naturalWidth||611)/(im.naturalHeight||820):611/820;
    if(Lay.yatay)return{cx:Lay.W/2,wl:Lay.wl,h:Lay.gemiH,w:Lay.gemiH*ar};
    const h=Lay.SH*SAHNE.KORSAN_BOY;
    return{cx:sw()*SAHNE.KORSAN_X,wl:Lay.SH*SAHNE.KORSAN_SU_Y,h,w:h*ar};
  }
  function shipPose(now){
    const b=shipBase(),sk=sinkT0?Math.min(1,Math.max(0,(now-sinkT0)/900)):0,e=sk*sk;
    let dx=Math.sin(now*.00085)*4,dy=Math.sin(now*.0017)*3,rot=Math.sin(now*.0011)*.022+lean;
    const hk=(now-shipHitT)/260;if(hk>=0&&hk<1)dx+=Math.sin(hk*Math.PI*6)*b.h*.02*(1-hk);
    // borda ateşinde geri savrulma: hızlı itilir, yavaşça döner
    const kk=(now-knockT)/900;if(kk>=0&&kk<1){const q=kk<.12?kk/.12:Math.pow(1-(kk-.12)/.88,2);dx+=b.w*.16*q;rot+=.11*q;dy-=b.h*.02*q;}
    dy+=e*b.h*.95;rot+=e*.38;
    return{cx:b.cx,wl:b.wl,h:b.h,w:b.w,x:b.cx+dx,y:b.wl+dy,rot};
  }
  function shipPt(fx_,fy,now){
    const p=shipPose(now),lx=(fx_-.5)*p.w,ly=(fy-SAHNE.KORSAN_SU)*p.h,c=Math.cos(p.rot),s=Math.sin(p.rot);
    return[p.x+lx*c-ly*s,p.y+lx*s+ly*c];
  }
  // küpeşte (guverte.png) geometrisi: x0, W görselin sol kenarı ve genişliği, top, dh üstü ve boyu; suY: kaçınılan güllenin suya düştüğü yükseklik
  function deckGeo(){
    if(Lay.yatay)return{x0:Lay.kx,top:Lay.kTop,dh:Lay.kh,W:Lay.kw,suY:Lay.korkY-6};
    const im=SAVAS_IMG.get('guverte'),ar=im?(im.naturalHeight||324)/(im.naturalWidth||1100):324/1100,dh=sw()*ar,top=Lay.SH-dh*SAHNE.GUVERTE_GORUNEN;
    return{x0:0,top,dh,W:sw(),suY:top-4};
  }
  function muzzle(c){const d=deckGeo();return[d.x0+d.W*SAHNE.GUVERTE_TOP_X[c],d.top+d.dh*SAHNE.GUVERTE_NAMLU_Y];}
  // bir DOM öğesinin tuvaldeki orta noktası (yoksa yedek nokta)
  function elPos(id,fb){
    try{const e=$(id).getBoundingClientRect(),c=cv.getBoundingClientRect();
      if(e&&e.width)return[e.left-c.left+e.width/2,e.top-c.top+e.height/2];}catch(_){}
    return fb;
  }
  const lootPos=()=>elPos('b-loot',[sw()-46,(Lay.safeT||0)+128]);
  const hullPos=()=>elPos('b-hp',[90,Lay.SH-20]);

  /* ---------- sahne efektleri ---------- */
  function addFx(it){if(it.t0==null)it.t0=performance.now();sfx.push(it);kick();return it;}
  function ball(x,y,r){
    const im=SAVAS_IMG.get('gulle');
    if(im)ctx.drawImage(im,x-r,y-r,2*r,2*r);
    else{const g=ctx.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);g.addColorStop(0,'#8a919b');g.addColorStop(1,'#111417');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
  }
  function boom(x,y,size,layer,delay){
    addFx({t0:performance.now()+(delay||0),dur:420,layer,draw:k=>{
      const im=SAVAS_IMG.get('patlama'),s=size*(.35+.85*Math.min(1,k*2.2));
      ctx.globalAlpha=k<.45?1:Math.max(0,1-(k-.45)/.55);
      if(im)ctx.drawImage(im,x-s/2,y-s/2,s,s);
      else{const g=ctx.createRadialGradient(x,y,0,x,y,s/2);g.addColorStop(0,'#fff6c0');g.addColorStop(.45,'#ffb03a');g.addColorStop(1,'rgba(230,80,20,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,s/2,0,7);ctx.fill();}
    }});
  }
  function flash(x,y,r,layer){
    addFx({dur:130,layer,draw:k=>{
      const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,250,210,${1-k})`);g.addColorStop(.5,`rgba(255,190,70,${.8*(1-k)})`);g.addColorStop(1,'rgba(255,120,30,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}});
  }
  // o: {layer, cols, spd, up, g, r, dur, ang, spread, grow, plus}
  function parts(x,y,n,o){
    for(let i=0;i<n;i++){
      const a=o.ang!=null?o.ang+(Math.random()-.5)*(o.spread||Math.PI):Math.random()*Math.PI*2,v=o.spd*(.5+Math.random()*.7);
      const vx=Math.cos(a)*v,vy=Math.sin(a)*v-(o.up||0),r=o.r*(.6+Math.random()*.6),col=o.cols[i%o.cols.length],dur=o.dur*(.75+Math.random()*.4);
      addFx({dur,layer:o.layer,draw:k=>{
        const t=k*dur/1000,px=x+vx*t,py=y+vy*t+.5*(o.g||0)*t*t;
        ctx.globalAlpha=Math.max(0,1-k);ctx.fillStyle=col;
        if(o.plus){ctx.fillRect(px-r,py-r*.3,2*r,r*.6);ctx.fillRect(px-r*.3,py-r,r*.6,2*r);}
        else{ctx.beginPath();ctx.arc(px,py,r*(1+k*(o.grow||0)),0,7);ctx.fill();}
      }});
    }
  }
  function splash(x,y){
    parts(x,y,16,{layer:'deck',cols:['#ffffff','#d6f1ff','#9fd6f5'],spd:80,up:120,g:420,r:3.2,dur:650,ang:-Math.PI/2,spread:2.4});
    addFx({dur:500,layer:'deck',draw:k=>{ctx.globalAlpha=1-k;ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+2,6+22*k,2+6*k,0,0,7);ctx.stroke();}});
  }
  function launchShot(dmg,delay,big,shake){
    const c=turn++%2,[x0,y0]=muzzle(c),hp=SAHNE.KORSAN_ISABET[(Math.random()*SAHNE.KORSAN_ISABET.length)|0];
    const t0=performance.now()+delay,dur=big?380:420,R=(big?12:10)*Math.max(.8,U()/330);
    const pos=k=>{const[x1,y1]=shipPt(hp[0],hp[1],t0+dur);return[x0+(x1-x0)*k,y0+(y1-y0)*k-U()*.3*4*k*(1-k)];};
    const sh={t0,dur,layer:'deck',block:true,dmg,done:false,
      start:now=>{recoilT[c]=now;flash(x0,y0-4,big?40:28,'deck');
        parts(x0,y0-6,7,{layer:'deck',cols:['rgba(235,235,235,.8)'],spd:20,up:26,r:6,grow:1.8,dur:560});
        SES.cal('top',{vol:big?1:.8,rate:big?.88:1});},
      draw:k=>{
        // iz: arkada sönen duman ve kıvılcım
        for(let i=4;i>=1;i--){const kk=k-i*.045;if(kk<=0)continue;const[tx,ty]=pos(kk);
          ctx.globalAlpha=.32*(1-i/5);ctx.fillStyle=i<2?'#ffcf7a':'#e8e8e8';ctx.beginPath();ctx.arc(tx,ty,R*(1-.5*kk)*(1-i*.12),0,7);ctx.fill();}
        ctx.globalAlpha=1;const[x,y]=pos(k);ball(x,y,R*(1-.45*k));},
      end:now=>{
        sh.done=true;pendE=Math.max(0,pendE-sh.dmg);
        const[x1,y1]=shipPt(hp[0],hp[1],now),bh=shipBase().h;
        boom(x1,y1,bh*(big?.7:.5),'deck');shipHitT=now;
        parts(x1,y1,big?12:7,{layer:'deck',cols:['#ffb03a','#ffd27a','#6b4a2a'],spd:big?150:110,up:60,g:380,r:big?3.4:2.8,dur:620});
        if(sh.dmg){floatAt(x1+(Math.random()-.5)*20,y1-16,'−'+sh.dmg,'#ff8a7a',true);vurdu('b-enp');}
        SES.cal('patlama',{vol:big?1:.75});
        if(shake){bump('scr-savas','shake');knockT=now;if(!game.over)korsanDer(sec(KORSAN_SOZ.vurul),1500);}
      }};
    lastShot=sh;addFx(sh);
  }
  // tahtada patlayan gülle taşlarından güvertedeki toplara kısa ışık izi
  function trail(st){
    const src=st.cleared.filter(c=>c.t===0);if(!src.length)return;
    const mx=src.reduce((a,c)=>a+c.x,0)/src.length,my=src.reduce((a,c)=>a+c.y,0)/src.length,[x0,y0]=cellC(mx,my);
    [0,1].forEach(c=>{const[x1,y1]=muzzle(c);
      addFx({dur:240,layer:'top',draw:k=>{
        const h=Math.min(1,k*1.35),t=Math.max(0,k*1.35-.45),hx=x0+(x1-x0)*h,hy=y0+(y1-y0)*h,tx=x0+(x1-x0)*t,ty=y0+(y1-y0)*t;
        const g=ctx.createLinearGradient(tx,ty,hx,hy);g.addColorStop(0,'rgba(255,214,120,0)');g.addColorStop(1,'rgba(255,240,190,.95)');
        ctx.strokeStyle=g;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(hx,hy);ctx.stroke();
        const rg=ctx.createRadialGradient(hx,hy,0,hx,hy,10);rg.addColorStop(0,'#ffffff');rg.addColorStop(.4,'#ffcf6a');rg.addColorStop(1,'rgba(255,160,40,0)');
        ctx.fillStyle=rg;ctx.beginPath();ctx.arc(hx,hy,10,0,7);ctx.fill();}});
    });
  }
  // hasarı en çok n atışa böler; atış hakkı bittiyse son uçan gülleye ekler (toplam hasar aynı)
  function volley(dmg,n,gap,big){
    if(dmg<=0&&!big)return;
    pendE+=dmg;
    if(n<=0){if(lastShot&&!lastShot.done){lastShot.dmg+=dmg;return;}n=1;}
    const base=Math.floor(dmg/n);let rem=dmg-base*n;
    for(let i=0;i<n;i++){const part=base+(rem>0?1:0);if(rem>0)rem--;if(part>0||big)launchShot(part,i*gap,big,big&&i===0);}
  }
  function enemyAttack(att){
    const cp=SAHNE.KORSAN_TOPLAR[(Math.random()*SAHNE.KORSAN_TOPLAR.length)|0],t0=performance.now(),dur=460,d=deckGeo();
    const dodge=att.dodged,tx=dodge?(Lay.yatay?Lay.W*(Math.random()<.5?.3:.7):sw()*(Math.random()<.5?.15:.85)):d.x0+d.W*(.4+Math.random()*.2),ty=dodge?d.suY:d.top+d.dh*.36;
    if(!dodge)pendH+=att.dmg;
    addFx({t0,dur,layer:'deck',block:true,
      start:now=>{const[x,y]=shipPt(cp[0],cp[1],now);flash(x,y,16,'deck');
        parts(x,y,4,{layer:'deck',cols:['rgba(230,230,230,.7)'],spd:12,up:14,r:4,grow:1.4,dur:500});SES.cal('korsan',{vol:.35,len:.9});SES.cal('top',{vol:.6,rate:.82});},
      draw:k=>{const[x0,y0]=shipPt(cp[0],cp[1],t0),x=x0+(tx-x0)*k,y=y0+(ty-y0)*k-U()*.12*4*k*(1-k);ball(x,y,(4+20*k*k)*(Lay.yatay?U()/374:1));},
      end:now=>{
        if(dodge){splash(tx,ty);banner(t('battle.fx.dodge'),'#9fd0ff');SES.cal('su');return;}
        pendH=Math.max(0,pendH-att.dmg);
        boom(tx,ty,U()*.5,'deck');deckHitT=now;vigT0=now;bump('scr-savas','shake');vurdu('b-mep');
        floatAt(tx,ty-16,t('battle.fx.hullDmg',{n:att.dmg}),'#ff8a7a',true);banner(t('battle.fx.attack',{n:att.dmg}),'#ff8a7a');
        SES.cal('patlama',{rate:.9});vib([30,40,30]);
      }});
  }
  function coins(st){
    const g=st.fx.gold;if(!g)return;
    pendLoot+=g;
    let src=st.cleared.filter(c=>c.t===2).slice(0,4);if(!src.length)src=[{x:3,y:3}];
    const[lx,ly]=lootPos();let left=g;
    src.forEach((c,i)=>{
      const share=i===src.length-1?left:Math.floor(g/src.length);left-=share;
      const[x0,y0]=cellC(c.x,c.y);
      addFx({t0:performance.now()+i*70,dur:560,layer:'top',
        draw:k=>{const e=k*k*(3-2*k),x=x0+(lx-x0)*e,y=y0+(ly-y0)*e-40*Math.sin(Math.PI*k),r=Lay.cs*(.32-.18*k),im=SAVAS_IMG.get('altin');
          if(im)ctx.drawImage(im,x-r,y-r,2*r,2*r);else{ctx.fillStyle='#f3c623';ctx.beginPath();ctx.arc(x,y,r*.8,0,7);ctx.fill();}},
        end:()=>{pendLoot=Math.max(0,pendLoot-share);if(i===src.length-1){floatAt(lx-6,ly+20,'+'+g,'#ffd54a');SES.cal('altin');}}});
    });
  }
  function spark(st,t,col,fxX){
    const src=st.cleared.filter(c=>c.t===t);if(!src.length)return;
    const mx=src.reduce((a,c)=>a+c.x,0)/src.length,my=src.reduce((a,c)=>a+c.y,0)/src.length,[x0,y0]=cellC(mx,my),x1=Lay.kivY!=null?Lay.kivX+Lay.kivW*fxX:Lay.W*fxX,y1=Lay.kivY!=null?Lay.kivY:Lay.H-2;
    addFx({dur:380,layer:'top',draw:k=>{const e=k*k,x=x0+(x1-x0)*e,y=y0+(y1-y0)*e;
      const g=ctx.createRadialGradient(x,y,0,x,y,7);g.addColorStop(0,'#ffffff');g.addColorStop(.4,col);g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();}});
  }
  // korsan hasarlıysa duman ve yana yatma; batarken kabarcık
  function ambient(now){
    const ratio=shownE()/game.pirateMax,want=sinkT0?0:ratio<.3?2:ratio<.6?1:0;
    lean+=((sinkT0?lean:ratio<.3?.075:ratio<.6?.035:0)-lean)*.05;
    for(let i=0;i<want;i++)if(now-smokeT[i]>160){
      smokeT[i]=now;const[x,y]=shipPt(SAHNE.KORSAN_DUMAN[i][0],SAHNE.KORSAN_DUMAN[i][1],now);
      amb.push({x,y,t0:now,dur:1500,vx:5+Math.random()*9,r:3+Math.random()*2,c:i?'60,60,64':'90,90,96'});
    }
    amb=amb.filter(p=>now-p.t0<p.dur);
    if(sinkT0&&now-sinkT0<1050&&Math.random()<.45){
      const p=shipPose(now),x=p.cx+(Math.random()-.5)*p.w*.8,y=p.wl+2+Math.random()*4,r0=1.5+Math.random()*2.5;
      addFx({dur:700,layer:'sea',draw:k=>{ctx.globalAlpha=1-k;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x,y-k*12,r0+k*2,0,7);ctx.stroke();}});
    }
  }

  function stepEnter(st){
    return()=>{
      const d=disp,wasFull=d.broad>=SAVAS.BROAD_MAX;
      d.pirateHp=Math.max(0,d.pirateHp-st.fx.dmg);d.hull=Math.min(game.hullMax,d.hull+st.fx.heal);d.loot+=st.fx.gold;
      d.broad=Math.min(SAVAS.BROAD_MAX,d.broad+st.fx.barut);d.evade=Math.min(SAVAS.EVADE_MAX,d.evade+st.fx.yelken);
      if(st.fx.dmg){trail(st);const n=Math.min(shotBudget,Math.max(1,Math.ceil(st.fx.dmg/3)));shotBudget-=n;volley(st.fx.dmg,n,110,false);}
      if(st.fx.heal){const[hx,hy]=hullPos();floatAt(hx,hy-20,t('battle.fx.heal',{n:st.fx.heal}),'#8ff0a8');
        parts(hx,hy-4,7,{layer:'deck',cols:['#7ef09a','#c9ffd6'],spd:38,up:42,r:4,plus:true,dur:700});}
      coins(st);
      if(st.fx.barut)spark(st,3,'#ff9a3c',SAHNE.BARUT_X);
      if(st.fx.yelken)spark(st,4,'#9fd0ff',SAHNE.KACIS_X);
      if(st.k>=1)banner(t('ui.fx.combo',{x:pctf(st.mult)}),'#ffffff');
      if(st.triggered.some(q=>q.s==='bomb'))banner(t('battle.fx.bomb'),'#ffb36b');
      if(st.triggered.some(q=>q.s==='row'||q.s==='col'))banner(t('battle.fx.chain'),'#cfe3ff');
      if(st.created.length&&st.k===0)banner(st.created.some(c=>c.s==='bomb')?t('battle.fx.bombReady'):t('battle.fx.chainReady'),'#ffd54a');
      SES.cal('eslesme',{rate:Math.min(1.7,1+.12*st.k),sabit:true});
      if(st.triggered.length)SES.cal('patlama',{vol:.8,rate:.85});
      if(st.fx.heal)SES.cal('onarim');
      if(!wasFull&&d.broad>=SAVAS.BROAD_MAX)SES.cal('kivilcim');
      vib(st.k?[10,30,10]:12);
      ui();
    };
  }
  function moveAnim(pre,x1,y1,x2,y2,res){
    const ph=[{type:'swap',pre,a:[x1,y1],b:[x2,y2]}];
    if(!res.ok){ph.push({type:'back',pre,a:[x1,y1],b:[x2,y2],enter:()=>{SES.cal('hata');vib(30);}});play(ph,()=>{ui();draw();});return;}
    SES.cal('dugme',{vol:.45,rate:.8});
    res.steps.forEach(st=>{ph.push({type:'pop',st,enter:stepEnter(st)});ph.push({type:'fall',st});});
    const g=game;
    play(ph,()=>{
      if(g!==game)return;
      syncDisp();
      if(res.attack)enemyAttack(res.attack);
      if(res.shuffled)banner(t('battle.fx.shuffled'),'#ffffff');
      // saldırıdan bir hamle önce korsan kaptanı seslenir
      if(!res.over&&!game.over&&game.cd===1&&cdSoz!==game.moves){cdSoz=game.moves;korsanDer(sec(KORSAN_SOZ.ates),1700);}
      if(game.moves===1)tipKapat(3500);
      ui();kick();
      if(res.over)beginEnd(res.over);
    });
  }

  function doSwap(x1,y1,x2,y2,fromHook){
    if(!game||game.over)return{ok:false,reason:'over'};
    if(anim){if(fromHook)finishAnim();else return{ok:false,reason:'busy'};}
    initAudio();
    const pre=SAVAS.snap(game.board);
    const res=SAVAS.swap(game,x1,y1,x2,y2);
    if(res.reason==='bad')return res;
    if(res.ok){shotBudget=5;lastShot=null;elKapat();}
    sel=null;moveAnim(pre,x1,y1,x2,y2,res);ui();
    return res;
  }
  function doFire(){
    if(!game)return null;
    if(anim)finishAnim();
    const r=SAVAS.fire(game);if(!r)return null;
    syncDisp();ui();
    banner(t('battle.fx.broadside',{n:r.dmg}),'#ffb36b');
    lastShot=null;volley(r.dmg,5,85,true);
    vib([20,30,40]);kick();
    if(r.over)beginEnd('win');
    return r;
  }

  /* ---------- yerleşim ---------- */
  // Yerleşim ortak hesapla (duzenHesap). Tuval sahneyi ve tahtayı birlikte taşır (efektler ikisi arasında uçar).
  // W, H: ekran; safeT, safeB: güvenli alan
  function calcLayout(W,H,safeT,safeB){
    const D=DUZEN.savas,d=duzenHesap('savas',W,H,safeT,safeB),SH=d.sahneH,cs=d.hucre,gw=d.gw;
    return Object.assign(d,{H:SH+D.ARA+2*D.CERCEVE+gw,SH,cs,gw,gx:d.gx,gy:d.tahtaY,total:d.toplam,ekranH:H});
  }
  // zemin: ufuk sahnede UFUK_Y'ye (yatayda Lay.ufuk'a) gelir; görsel genişliği kaplar, alt kısmı alt renge karışır
  const ufukY=()=>Lay.yatay?Lay.ufuk:Lay.SH*SAHNE.UFUK_Y;
  function zeminMap(){
    const im=SAVAS_IMG_Z(),iw=(im&&im.naturalWidth)||SAHNE.ZEMIN_BOY[0],ih=(im&&im.naturalHeight)||SAHNE.ZEMIN_BOY[1],T=ufukY();
    const zu=Lay.yatay?SAHNE.ZEMIN_UFUK_GENIS:SAHNE.ZEMIN_UFUK,s=Math.max(sw()/iw,T/(ih*zu));
    return{s,ox:(sw()-iw*s)/2,oy:T-ih*zu*s,iw,ih};
  }
  const SAVAS_IMG_Z=()=>IMG.get('savas_dikey');
  function paintBg(){
    zmap=zeminMap();
    const scr=$('scr-savas'),EH=Math.max(Lay.H,(scr&&scr.clientHeight)||Lay.ekranH||800),W=sw(),T=ufukY();
    zeminBoya(bgc,SAVAS_IMG_Z(),zmap,W,EH,SAHNE.ZEMIN_RENK,c=>{
      let g=c.createLinearGradient(0,0,0,T);g.addColorStop(0,'#3fa9ec');g.addColorStop(1,'#cdeefb');c.fillStyle=g;c.fillRect(0,0,W,T);
      g=c.createLinearGradient(0,T,0,EH);g.addColorStop(0,'#5cb7e2');g.addColorStop(.35,'#2f7fb0');g.addColorStop(1,SAHNE.ZEMIN_RENK);c.fillStyle=g;c.fillRect(0,T,W,EH-T);
    });
    if(Lay.yatay)guverteBoya(W,EH);
  }
  // yatayda küpeştenin altı kendi gemimizin güvertesi (guverte_genis.jpg; yalnız web'de yüklenir): korkuluk tabanının arkasından ekranın altına kadar, "cover"
  // görseli Görseller/uretim-betikleri/guverte_temizle.py üretir: eski güverte, korkuluğun altında kesik görünen üst kenar eşyaları silinmiş
  function guverteBoya(W,EH){
    try{
      const c=bgc.getContext('2d'),im=IMG.get('guverte_genis'),y0=Lay.guverteY,h=EH-y0;
      if(im){const iw=im.naturalWidth||1920,ih=im.naturalHeight||548,s=Math.max(W/iw,h/ih);c.drawImage(im,(W-iw*s)/2,y0,iw*s,ih*s);}
      else{const g=c.createLinearGradient(0,y0,0,EH);g.addColorStop(0,'#b5703a');g.addColorStop(1,'#7a4420');c.fillStyle=g;c.fillRect(0,y0,W,h);}
      // küpeştenin güverteye düşen gölgesi
      const ty=Lay.tabanY,g=c.createLinearGradient(0,ty-4,0,ty+26);g.addColorStop(0,'rgba(40,18,4,.55)');g.addColorStop(1,'rgba(40,18,4,0)');
      c.fillStyle=g;c.fillRect(0,ty-4,W,30);
    }catch(_){}
  }
  // yatay düzen (web, geniş ekran; yalnız html.yatay): tek parça sahne, tuval bütün ekranı kaplar (ölçüler YS). Yukarıdan aşağı: gökyüzü ve deniz
  // (savas_dikey.jpg), ortada korsan gemisi, tahtanın hemen üstünde küpeştemiz ve iki topu (guverte.png ortada; düz korkuluk yanlara döşenir),
  // küpeştenin altı güverte (guverte_genis.jpg), güvertenin ortasında tahta, altında göstergeler.
  // Dönen (ekrana göre px): gx, gy tahta · gostX/gostY/gostW göstergeler · kivX, kivW, kivY kıvılcımın hedef şeridi · ufuk · wl, gemiH korsanın su çizgisi
  //   ve boyu · kx, kTop, kw, kh küpeşte görseli · korkY korkuluğun üstü · tabanY korkuluk tabanının altı · guverteY güverte görselinin üstü · U efekt ölçeği
  //   kapSag, kapAlt, kapHB kaptanımızın sağ ve alt kenarı, can çubuğu genişliği · atkX, atkY saldırı kutusu
  function calcYatay(W,H){
    const D=DUZEN.savas,C=D.CERCEVE,im=SAVAS_IMG.get('guverte'),ar=im?(im.naturalHeight||299)/(im.naturalWidth||1100):299/1100;
    const cs=Math.max(26,Math.min(Math.floor(H*YS.BOY/N),Math.floor((W-2*YS.KENAR-2*C)/N))),gw=cs*N,gx=Math.round((W-gw)/2);
    const gostY=H-YS.ALT-D.GOSTERGE,gy=gostY-D.ARA-C-gw;
    const gostW=Math.min(W-2*YS.KENAR,Math.max(gw+2*C,YS.GOST_EN)),gostX=Math.round((W-gostW)/2);
    const kw=Math.round(gw*YS.KUPESTE),kh=kw*ar,kx=Math.round((W-kw)/2),kTop=Math.round(gy-C+YS.BINDIR-kh*SAHNE.GUVERTE_TABAN);
    const korkY=kTop+kh*SAHNE.GUVERTE_KORKULUK,tabanY=kTop+kh*SAHNE.GUVERTE_TABAN;
    const ufuk=Math.round(Math.min(H*YS.UFUK,korkY-24)),wl=Math.round(ufuk+(korkY-ufuk)*YS.GEMI_SU);
    const gemiH=Math.min(H*YS.GEMI_BOY,(wl-YS.GEMI_UST)/(SAHNE.KORSAN_SU-SAHNE.KORSAN_UST));
    const kapHB=Math.round(Math.max(YS.KAP_HB[0],Math.min(YS.KAP_HB[1],gx-C-YS.KAP_ARA-YS.KENAR-58)));
    const kapSag=Math.round(W-Math.max(YS.KENAR+58+kapHB,gx-C-YS.KAP_ARA));
    const kapAlt=Math.round(H-(gy-C+4));
    const kAr=(()=>{const k=korsanImg();return k?(k.naturalWidth||611)/(k.naturalHeight||820):611/820;})();
    return{W,H,SW:W,SH:H,yatay:true,hucre:cs,cs,gw,gx,gy,total:H,toplam:H,ekranH:H,gostX,gostY,gostW,kivX:gostX,kivW:gostW,kivY:gostY+D.GOSTERGE/2,
      ufuk,wl,gemiH,U:gemiH/SAHNE.KORSAN_BOY,kx,kTop,kw,kh,korkY,tabanY,guverteY:Math.round(kTop+kh*.68),kapSag,kapAlt,kapHB,
      atkX:Math.round(W/2+gemiH*kAr/2+YS.SALDIRI_ARA),atkY:Math.round(Math.max(14,wl-gemiH*SAHNE.KORSAN_SU+gemiH*.12))};
  }
  function layout(){
    const scr=$('scr-savas'),[t,b]=safeTB(),dpr=window.devicePixelRatio||1,atk=$('b-atk');
    let W;
    if(yatayAcik){Lay=calcYatay(window.innerWidth||1280,window.innerHeight||720);W=Lay.W;
      $('b-gauges').style.cssText=`left:${Lay.gostX}px;top:${Lay.gostY}px;width:${Lay.gostW}px`;
      const px=(k,v)=>scr.style.setProperty(k,Math.round(v)+'px');
      px('--kapSag',Lay.kapSag);px('--kapAlt',Lay.kapAlt);px('--kapHB',Lay.kapHB);
      atk.style.left=Lay.atkX+'px';atk.style.top=Lay.atkY+'px';}
    else{W=Math.min(440,scr.clientWidth||cv.clientWidth||window.innerWidth||375);Lay=calcLayout(W,window.innerHeight||812,t,b);$('b-gauges').style.cssText='';
      atk.style.left='';atk.style.top=Math.round(Math.max(t+SAHNE.SAG_SUTUN,Lay.SH*SAHNE.SALDIRI_Y))+'px';}
    cv.style.height=Lay.H+'px';cv.width=Math.round(W*dpr);cv.height=Math.round(Lay.H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    $('b-hud').style.height=Lay.SH+'px';
    paintBg();hudK='';hud();
  }

  /* ---------- çizim ---------- */
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function arrowLine(x1,y1,x2,y2,h){
    const a=Math.atan2(y2-y1,x2-x1);
    ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
    for(const[px,py,aa]of[[x2,y2,a],[x1,y1,a+Math.PI]]){
      ctx.moveTo(px-h*Math.cos(aa-.6),py-h*Math.sin(aa-.6));ctx.lineTo(px,py);ctx.lineTo(px-h*Math.cos(aa+.6),py-h*Math.sin(aa+.6));
    }
  }
  function drawTile(c,px,py,s,k,alpha){
    if(!c)return;
    const St=STONES[c.t],pad=s*.06,w=s-2*pad;
    const icon=c.s==='bomb'?SAVAS_IMG.get('bomba'):(c.s==='row'||c.s==='col')?SAVAS_IMG.get('zincir'):SAVAS_IMG.get(KEYS[c.t]);
    ctx.save();ctx.globalAlpha=alpha==null?1:alpha;
    if(k!==1){const mx=px+s/2,my=py+s/2;ctx.translate(mx,my);ctx.scale(k,k);ctx.translate(-mx,-my);}
    // parlak, pahlı taş zemini (ortak CILA.hucre); ikon taşın üst yüzüne ortalanır
    const yz=CILA.hucre(ctx,px,py,s,St.c,{pay:.06}),cx=yz.cx,cy=yz.cy;
    if(icon){
      const is=s*(c.s?.68:.75);
      // zincir taşında ikon, yön okuna yer açmak için hafifçe kayar
      const ox=c.s==='col'?-s*.06:0,oy=c.s==='row'?-s*.06:s*.01;
      ctx.drawImage(icon,cx-is/2+ox,cy-is/2+oy,is,is);
      if(c.s==='row'||c.s==='col'){
        // zincir taşının yönü: satırsa yatay, sütunsa dikey çift ok
        ctx.lineCap='round';ctx.lineJoin='round';
        for(const[col,lw]of[['rgba(0,0,0,.6)',Math.max(4,s*.11)],['#ffffff',Math.max(2,s*.055)]]){
          ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();
          if(c.s==='row')arrowLine(cx-s*.3,py+s-pad-s*.11,cx+s*.3,py+s-pad-s*.11,s*.1);
          else arrowLine(px+s-pad-s*.11,cy-s*.3,px+s-pad-s*.11,cy+s*.3,s*.1);
          ctx.stroke();
        }
      }else if(c.s==='bomb'){
        ctx.strokeStyle='#ffd54a';ctx.lineWidth=Math.max(3,s*.09);rr(px+pad+1,py+pad+1,w-2,w-2,s*.22);ctx.stroke();
      }
    }else{
      if(c.t===0){
        const gr=ctx.createRadialGradient(cx-s*.08,cy-s*.08,s*.02,cx,cy,s*.26);
        gr.addColorStop(0,'#9aa1ab');gr.addColorStop(.45,'#4c525c');gr.addColorStop(1,'#15181c');
        ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,cy,s*.25,0,7);ctx.fill();
      }else{
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.round(s*.5)}px serif`;ctx.fillStyle='#000';ctx.fillText(St.e,cx,cy+s*.04);
      }
      if(c.s==='row'||c.s==='col'){
        ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=Math.max(2,s*.06);ctx.lineCap='round';ctx.beginPath();
        const a=s*.36,o=s*.33;
        if(c.s==='row'){for(const dy of[-o,o]){ctx.moveTo(cx-a,cy+dy);ctx.lineTo(cx+a,cy+dy);}
          ctx.moveTo(cx-a+s*.08,cy-o-s*.06);ctx.lineTo(cx-a,cy-o);ctx.lineTo(cx-a+s*.08,cy-o+s*.06);
          ctx.moveTo(cx+a-s*.08,cy+o-s*.06);ctx.lineTo(cx+a,cy+o);ctx.lineTo(cx+a-s*.08,cy+o+s*.06);}
        else{for(const dx of[-o,o]){ctx.moveTo(cx+dx,cy-a);ctx.lineTo(cx+dx,cy+a);}
          ctx.moveTo(cx-o-s*.06,cy-a+s*.08);ctx.lineTo(cx-o,cy-a);ctx.lineTo(cx-o+s*.06,cy-a+s*.08);
          ctx.moveTo(cx+o-s*.06,cy+a-s*.08);ctx.lineTo(cx+o,cy+a);ctx.lineTo(cx+o+s*.06,cy+a-s*.08);}
        ctx.stroke();
      }else if(c.s==='bomb'){
        ctx.strokeStyle='#ffd54a';ctx.lineWidth=Math.max(3,s*.09);rr(px+pad+1,py+pad+1,w-2,w-2,s*.22);ctx.stroke();
        ctx.fillStyle='#2a1a0a';ctx.beginPath();ctx.arc(px+s-pad-s*.13,py+pad+s*.13,s*.12,0,7);ctx.fill();
        ctx.fillStyle='#ff9a3c';ctx.beginPath();ctx.arc(px+s-pad-s*.13,py+pad+s*.13,s*.055,0,7);ctx.fill();
      }
    }
    ctx.restore();
  }
  function tintedShip(im){
    if(tintC&&tintC.im===im)return tintC.c;
    let c=null;
    try{c=document.createElement('canvas');c.width=im.naturalWidth||477;c.height=im.naturalHeight||640;
      const x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);x.globalCompositeOperation='source-atop';x.fillStyle='rgb(255,55,40)';x.fillRect(0,0,c.width,c.height);}catch(_){c=null;}
    tintC={im,c};return c;
  }
  function drawShip(now){
    const p=shipPose(now),im=korsanImg(),hk=(now-shipHitT)/240;
    ctx.save();ctx.beginPath();ctx.rect(0,0,sw(),p.wl+3);ctx.clip();
    ctx.translate(p.x,p.y);ctx.rotate(p.rot);
    // saldırıya bir hamle kala gemi nabız atar
    if(!game.over&&disp&&disp.cd<=1&&!sinkT0){const q=1+.035*(.5+.5*Math.sin(now*.012));ctx.scale(q,q);}
    const x0=-p.w/2,y0=-p.h*SAHNE.KORSAN_SU;
    if(im){
      ctx.drawImage(im,x0,y0,p.w,p.h);
      if(hk>=0&&hk<1){const tc=tintedShip(im);if(tc){ctx.globalAlpha=.55*(1-hk);ctx.drawImage(tc,x0,y0,p.w,p.h);ctx.globalAlpha=1;}}
    }else{
      const w=p.w,h=p.h,red=hk>=0&&hk<1;
      ctx.fillStyle='#4a3020';ctx.fillRect(-w*.03,-h*.9,w*.06,h*.66);
      ctx.fillStyle='#1d1d1f';ctx.fillRect(-w*.32,-h*.82,w*.64,h*.4);
      ctx.fillStyle='#f2efe6';ctx.beginPath();ctx.arc(0,-h*.62,w*.09,0,7);ctx.fill();
      ctx.fillStyle=red?'#b8402f':'#5a3a22';ctx.beginPath();ctx.moveTo(-w*.46,-h*.3);ctx.lineTo(w*.46,-h*.34);ctx.lineTo(w*.36,h*.1);ctx.lineTo(-w*.36,h*.1);ctx.closePath();ctx.fill();
      ctx.fillStyle='#c8372d';ctx.fillRect(-w*.45,-h*.33,w*.9,h*.05);
    }
    ctx.restore();
    const sk=sinkT0?Math.min(1,(now-sinkT0)/900):0;
    ctx.fillStyle=`rgba(255,255,255,${.55*(1-sk*.6)})`;ctx.beginPath();ctx.ellipse(p.x,p.wl+1,p.w*.42*(1-sk*.3),3.2,0,0,7);ctx.fill();
  }
  function drawAmb(now){
    for(const s of amb){const k=(now-s.t0)/s.dur;
      ctx.fillStyle=`rgba(${s.c},${.5*(1-k)})`;ctx.beginPath();ctx.arc(s.x+s.vx*k*1.5,s.y-k*28,s.r*(1+k*2.2),0,7);ctx.fill();}
  }
  // yatayda küpeşte şeridi (bütün ekran genişliği): guverte.png ortada, düz korkuluk parçaları (GUVERTE_DOSEME_SOL/SAG) iki yana ekran kenarına kadar
  // bir aynalı bir düz döşenir; görselin kesik kenarları döşemenin üstünde solar. Boyut başına bir kez kapalı kanvasa çizilir.
  let serit=null;
  function kupesteSerit(im){
    const d=deckGeo(),W=Lay.W,dpr=window.devicePixelRatio||1,k=[W,d.x0,d.W,Math.round(d.dh),dpr].join('|');
    if(serit&&serit.k===k)return serit.c;
    let c=null;
    try{
      c=document.createElement('canvas');c.width=Math.ceil(W*dpr);c.height=Math.ceil(d.dh*dpr);
      const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);
      const iw=im.naturalWidth||1100,ih=im.naturalHeight||299,F=SAHNE.GUVERTE_SOLMA*d.W;
      // döşeme: ana görselin kenarından (solan kısmın altından da) dışarıya doğru; görsele değen ilk parça aynalıdır (ucu görselin kenar sütunu)
      const doseme=(X,[a,b],ayna)=>{const tw=(b-a)*d.W;x.save();if(ayna){x.translate(X+tw,0);x.scale(-1,1);}else x.translate(X,0);
        x.drawImage(im,a*iw,0,(b-a)*iw,ih,ayna?-.25:0,0,tw+.5,d.dh);x.restore();return tw;};
      const SOL=SAHNE.GUVERTE_DOSEME_SOL,SAG=SAHNE.GUVERTE_DOSEME_SAG,twL=(SOL[1]-SOL[0])*d.W,twR=(SAG[1]-SAG[0])*d.W;
      for(let X=d.x0+F-twL,i=0;X>-twL;X-=twL,i++)doseme(X,SOL,i%2===0);
      for(let X=d.x0+d.W-F,i=0;X<W;X+=twR,i++)doseme(X,SAG,i%2===0);
      // ana görsel, kenarları solarak
      const o=document.createElement('canvas');o.width=Math.ceil(d.W*dpr);o.height=Math.ceil(d.dh*dpr);
      const y=o.getContext('2d');y.setTransform(dpr,0,0,dpr,0,0);y.drawImage(im,0,0,d.W,d.dh);
      if(d.x0>0||d.x0+d.W<W){const g=y.createLinearGradient(0,0,d.W,0),f=F/d.W;
        g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(f,'#000');g.addColorStop(1-f,'#000');g.addColorStop(1,'rgba(0,0,0,0)');
        y.globalCompositeOperation='destination-in';y.fillStyle=g;y.fillRect(0,0,d.W,d.dh);}
      x.drawImage(o,d.x0,0,d.W,d.dh);
    }catch(_){c=null;}
    serit={k,c};return c;
  }
  function drawDeck(now){
    const d=deckGeo(),im=SAVAS_IMG.get('guverte');
    let sx=0;const hk=(now-deckHitT)/320;if(hk>=0&&hk<1)sx=Math.sin(hk*Math.PI*7)*5*(1-hk);
    const dk=darkT0?(now-darkT0)/500:-1;if(dk>=0&&dk<1)sx+=Math.sin(dk*Math.PI*9)*6*(1-dk);
    const rec=[0,1].map(c=>{const a=now-recoilT[c];return a>=0&&a<200?(a<50?a/50:1-(a-50)/150)*Math.max(3,d.dh*.04):0;});
    ctx.save();ctx.translate(sx,0);
    if(im){
      const iw=im.naturalWidth||1100,ih=im.naturalHeight||324,cw=d.W*SAHNE.GUVERTE_TOP_GEN,ch=d.dh*SAHNE.GUVERTE_TOP_BOY;
      const sr=Lay.yatay?kupesteSerit(im):null;
      // zemin: dikeyde görsel, yatayda bütün şerit
      const zemin=()=>{if(sr)ctx.drawImage(sr,0,d.top,Lay.W,d.dh);else ctx.drawImage(im,d.x0,d.top,d.W,d.dh);};
      if(rec[0]||rec[1]){
        ctx.save();ctx.beginPath();ctx.rect(-10,d.top-10,(sr?Lay.W:d.W)+20,d.dh+20);
        for(const c of[0,1])if(rec[c])ctx.rect(d.x0+d.W*SAHNE.GUVERTE_TOP_X[c]-cw/2,d.top,cw,ch);
        ctx.clip('evenodd');zemin();ctx.restore();
        for(const c of[0,1])if(rec[c]){const X=SAHNE.GUVERTE_TOP_X[c];
          ctx.drawImage(im,(X-SAHNE.GUVERTE_TOP_GEN/2)*iw,0,SAHNE.GUVERTE_TOP_GEN*iw,SAHNE.GUVERTE_TOP_BOY*ih,d.x0+d.W*X-cw/2,d.top+rec[c],cw,ch);}
      }else zemin();
    }else{
      ctx.fillStyle='#b77b4b';ctx.fillRect(0,d.top+d.dh*.3,sw(),d.dh*(Lay.yatay?.44:1));
      ctx.fillStyle='#8a5a33';ctx.fillRect(0,d.top+d.dh*.2,sw(),d.dh*.13);
      for(const c of[0,1]){const x=d.x0+d.W*SAHNE.GUVERTE_TOP_X[c],y=d.top+rec[c];
        ctx.fillStyle='#c9a13b';rr(x-d.dh*.07,y+d.dh*.03,d.dh*.14,d.dh*.4,d.dh*.05);ctx.fill();
        ctx.fillStyle='#6b4a2a';ctx.fillRect(x-d.dh*.13,y+d.dh*.36,d.dh*.26,d.dh*.14);}
    }
    ctx.restore();
  }
  function drawLayer(L,now){
    for(const it of sfx){
      if(it.layer!==L||now<it.t0||!it.draw)continue;
      ctx.save();it.draw(Math.min(1,(now-it.t0)/it.dur),now);ctx.restore();
    }
  }
  function txt(t,x,y,size,col,align,weight){
    ctx.font=`${weight||800} ${size}px ${CILA.YAZI}`;ctx.textAlign=align||'center';ctx.textBaseline='middle';
    ctx.lineWidth=3;ctx.strokeStyle='rgba(8,24,30,.7)';ctx.strokeText(t,x,y);ctx.fillStyle=col;ctx.fillText(t,x,y);
  }
  // kısa duyurular (KOMBO, BORDA...): sahnenin ortasında, geminin önünde
  function drawBanners(now){
    const maxW=sw()-24;
    for(const b of fx.banners){
      const k=(now-b.t0)/b.dur,sc=k<.15?.6+.5*(k/.15):k<.25?1.1-.1*((k-.15)/.1):1,y=(Lay.yatay?Lay.H*YS.BANNER_Y:Lay.SH*.4)+b.slot*30;
      ctx.save();ctx.globalAlpha=k>.7?Math.max(0,1-(k-.7)/.3):1;
      ctx.font='900 23px '+CILA.YAZI;
      const m=ctx.measureText(b.text),w=(m&&m.width)||0,fit=w>maxW?Math.max(.6,maxW/w):1;
      ctx.translate(sw()/2,y);ctx.scale(sc*fit,sc*fit);
      // kalın koyu çizgi + üstten açılan renk geçişi
      CILA.yazi(ctx,b.text,0,0,23,b.color,{cizgi:7,kenar:'rgba(14,22,30,.92)'});ctx.restore();
    }
  }
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  function drawBoard(now){
    const{cs,gw,gx,gy}=Lay;
    // çerçeve ve oyuk yuvalar bir kez çizilip kopyalanır (CILA.cerceve)
    CILA.cerceve(ctx,gx,gy,gw,gw,DUZEN.savas.CERCEVE,{izgara:N});
    ctx.save();ctx.beginPath();ctx.rect(gx-2,gy-2,gw+4,gw+4);ctx.clip();
    const ph=anim&&anim.phases[anim.i];
    const t=ph?Math.min(1,(now-anim.t0)/DUR[ph.type]):0;
    if(ph&&(ph.type==='swap'||ph.type==='back')){
      const e=ease(t),[ax,ay]=ph.a,[bx,by]=ph.b,ia=ay*N+ax,ib=by*N+bx;
      const p=ph.type==='swap'?e:1-e;
      for(let i=0;i<N*N;i++)if(i!==ia&&i!==ib)drawTile(ph.pre[i],gx+(i%N)*cs,gy+((i/N)|0)*cs,cs,1);
      drawTile(ph.pre[ib],gx+(bx+(ax-bx)*p)*cs,gy+(by+(ay-by)*p)*cs,cs,1);
      drawTile(ph.pre[ia],gx+(ax+(bx-ax)*p)*cs,gy+(ay+(by-ay)*p)*cs,cs,1.08);
    }else if(ph&&ph.type==='pop'){
      const st=ph.st,gone=new Set(st.cleared.concat(st.created).map(c=>c.y*N+c.x));
      const pre=st.pre;
      for(let i=0;i<N*N;i++){
        const x=i%N,y=(i/N)|0;
        if(gone.has(i)){drawTile(pre[i],gx+x*cs,gy+y*cs,cs,1-.75*t,1-t*.6);
          ctx.fillStyle=`rgba(255,250,225,${.7*(1-t)})`;rr(gx+x*cs+3,gy+y*cs+3,cs-6,cs-6,8);ctx.fill();}
        else drawTile(pre[i],gx+x*cs,gy+y*cs,cs,1);
      }
      for(const tr of st.triggered){
        ctx.fillStyle=tr.s==='bomb'?`rgba(255,160,60,${.55*(1-t)})`:`rgba(220,235,255,${.6*(1-t)})`;
        if(tr.s==='row')ctx.fillRect(gx,gy+tr.y*cs+cs*.2,gw,cs*.6);
        else if(tr.s==='col')ctx.fillRect(gx+tr.x*cs+cs*.2,gy,cs*.6,gw);
        else{ctx.beginPath();ctx.arc(gx+tr.x*cs+cs/2,gy+tr.y*cs+cs/2,cs*(.5+1.2*t),0,7);ctx.fill();}
      }
    }else if(ph&&ph.type==='fall'){
      const st=ph.st,e=t*t;
      for(let i=0;i<N*N;i++){const x=i%N,y=(i/N)|0,fy=st.fall[i];
        const yy=fy+(y-fy)*e;drawTile(st.board[i],gx+x*cs,gy+yy*cs,cs,1);}
    }else{
      for(let i=0;i<N*N;i++)drawTile(game.board[i],gx+(i%N)*cs,gy+((i/N)|0)*cs,cs,1);
      if(sel){const b=game.board[sel[1]*N+sel[0]];if(b){const sx=gx+sel[0]*cs,sy=gy+sel[1]*cs;
        // seçili taş: hafifçe büyür, altın halka parlar
        ctx.save();ctx.translate(sx+cs/2,sy+cs/2);ctx.scale(1.06,1.06);ctx.translate(-sx-cs/2,-sy-cs/2);drawTile(b,sx,sy,cs,1);ctx.restore();
        CILA.hucre(ctx,sx,sy,cs,STONES[b.t].c,{pay:.06,secili:true,yalnizHalka:true});}}
    }
    ctx.restore();
  }
  function draw(){
    if(!game)return;
    const{W,H,SH}=Lay,now=performance.now();
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.beginPath();ctx.rect(0,0,sw(),SH);ctx.clip();
    drawShip(now);drawAmb(now);drawLayer('sea',now);drawDeck(now);drawLayer('deck',now);
    ctx.restore();
    drawBoard(now);
    drawLayer('top',now);
    if(el&&!anim&&!game.over)drawEl(now);
    ctx.textAlign='center';ctx.textBaseline='middle';
    // hasar ve onarım sayıları: iri, zıplayarak çıkar
    for(const f of fx.floats){
      const k=(now-f.t0)/f.dur,fs=f.big?27:18,sc=k<.18?.4+.8*(k/.18):k<.3?1.2-.2*((k-.18)/.12):1,yy=f.y-(f.big?40:30)*Math.sin(Math.min(1,k*1.4)*Math.PI/2);
      ctx.save();ctx.globalAlpha=Math.max(0,1-Math.pow(Math.max(0,k-.35)/.65,2));ctx.translate(f.x,yy);ctx.scale(sc,sc);
      CILA.yazi(ctx,f.text,0,0,fs,f.color,{cizgi:f.big?6:4,kenar:'rgba(30,10,0,.85)'});ctx.restore();
    }
    drawBanners(now);
    const vk=(now-vigT0)/450;
    if(vk>=0&&vk<1){const g=ctx.createRadialGradient(W/2,H*.4,Math.min(W,H)*.3,W/2,H*.4,Math.max(W,H)*.75);
      g.addColorStop(0,'rgba(200,20,10,0)');g.addColorStop(1,`rgba(200,20,10,${.55*(1-vk)})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
    if(darkT0){ctx.fillStyle=`rgba(0,0,0,${.55*Math.min(1,(now-darkT0)/450)})`;ctx.fillRect(0,0,W,H);}
  }

  /* ---------- ilk korsan savaşında ilk hamle eli ----------
     Yalnız oyuncunun ilk korsan savaşında (levelN 1, tekrar değil) ve henüz takas yapılmamışken: yükleme ekranındaki el (CILA.el) gerçekten
     eşleşme yapan bir hamleyi gösterir: bir taşın üstüne basar, komşu taşa kaydırır; taşın soluk hayaleti elle birlikte gider. Hamle
     SAVAS.validMoves'tan seçilir; önce top güllesi eşleşmesi, sonra tahtanın ortasına en yakın olan. Oyuncu sürüklemeye başlayınca ya da ilk takas
     olunca kaybolur ve bu oturumda (elBitti) geri gelmez; sonraki savaşlarda hiç çıkmaz. Hareket azaltma (RM) açıksa el taşın üstünde durur,
     komşu taşa kesik çizgili ok uzanır. Tuvalde çizilir: girdiyi engellemez. ELS: DONGU bir tekrarın süresi (ms), BOY elin boyu (hücrenin katı;
     en az BOY_MIN px), EGIM elin yatıklığı (radyan) */
  const ELS={DONGU:2200,BOY:1.6,BOY_MIN:52,EGIM:-.32};
  let el=null,elBitti=false;
  function elKapat(){if(el){el=null;elBitti=true;}}
  function elHamle(){
    const v=SAVAS.validMoves(game),b=game.board;let en=null;
    for(const[x1,y1,x2,y2]of v){
      const A=b[y1*N+x1],B=b[y2*N+x2];if(!A||!B||A.s||B.s)continue;
      // takastan sonra güllenin vardığı yerde eşleşme var mı
      const k=SAVAS.snap(b);k[y1*N+x1]=B;k[y2*N+x2]=A;
      const gulle=(A.t===0&&SAVAS.matchAt(k,x2,y2))||(B.t===0&&SAVAS.matchAt(k,x1,y1));
      // gülle taşınan taş olsun (el gülleyi sürükler)
      const[ax,ay,bx,by]=B.t===0&&gulle&&!(A.t===0)?[x2,y2,x1,y1]:[x1,y1,x2,y2];
      const d=Math.hypot((x1+x2)/2-(N-1)/2,(y1+y2)/2-(N-1)/2+.5),p=(gulle?0:100)+d;
      if(!en||p<en.p)en={ax,ay,bx,by,p};
    }
    return en;
  }
  const yumusak=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  function drawEl(now){
    if(!el.m)el.m=elHamle();
    const m=el.m;if(!m)return;
    const{cs,gx,gy}=Lay,ax=gx+(m.ax+.5)*cs,ay=gy+(m.ay+.5)*cs,bx=gx+(m.bx+.5)*cs,by=gy+(m.by+.5)*cs;
    const boy=Math.max(ELS.BOY_MIN,cs*ELS.BOY),tas=game.board[m.ay*N+m.ax];
    if(RM){CILA.elOk(ctx,ax,ay,bx,by);CILA.el(ctx,ax,ay,boy,1,1,0,false,ELS.EGIM);return;}
    // evreler (bir tekrarın oranı): görünür, taşa basar, komşuya kaydırır, bırakır, solar
    const k=((now-el.t0)%ELS.DONGU)/ELS.DONGU;
    let p=0,bas=0,a=1;
    if(k<.14){a=k/.14;}
    else if(k<.26){bas=(k-.14)/.12;}
    else if(k<.62){bas=1;p=yumusak((k-.26)/.36);}
    else if(k<.76){p=1;bas=1-(k-.62)/.14;}
    else{p=1;a=1-(k-.76)/.24;}
    const x=ax+(bx-ax)*p,y=ay+(by-ay)*p;
    if(k>=.26&&tas)drawTile(tas,x-cs/2,y-cs/2,cs,1.04,.55*a);
    CILA.el(ctx,x,y,boy,a,1-.1*bas,bas,false,ELS.EGIM);
  }

  /* ---------- girdi: kaydır ya da iki dokunuş ---------- */
  function pt(e){const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];}
  function cellAt(x,y){const cx=Math.floor((x-Lay.gx)/Lay.cs),cy=Math.floor((y-Lay.gy)/Lay.cs);return cx>=0&&cy>=0&&cx<N&&cy<N?[cx,cy]:null;}
  cv.addEventListener('pointerdown',e=>{
    initAudio();
    if(!game||anim||game.over)return;
    const[x,y]=pt(e),c=cellAt(x,y);if(!c)return;
    drag={c,sx:x,sy:y,done:false};
    try{cv.setPointerCapture(e.pointerId);}catch(_){}
    e.preventDefault();
  });
  cv.addEventListener('pointermove',e=>{
    if(!drag||drag.done)return;
    const[x,y]=pt(e),dx=x-drag.sx,dy=y-drag.sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))<Lay.cs*.35)return;
    drag.done=true;elKapat();
    const[cx,cy]=drag.c,[tx,ty]=Math.abs(dx)>Math.abs(dy)?[cx+Math.sign(dx),cy]:[cx,cy+Math.sign(dy)];
    if(tx>=0&&ty>=0&&tx<N&&ty<N){sel=null;doSwap(cx,cy,tx,ty);}
  });
  cv.addEventListener('pointerup',()=>{
    if(!drag)return;const d=drag;drag=null;if(d.done)return;
    const[cx,cy]=d.c;
    if(sel&&Math.abs(sel[0]-cx)+Math.abs(sel[1]-cy)===1){const s=sel;sel=null;doSwap(s[0],s[1],cx,cy);}
    else{sel=sel&&sel[0]===cx&&sel[1]===cy?null:[cx,cy];SES.cal('dugme',{vol:.5});draw();}
  });
  cv.addEventListener('pointercancel',()=>{drag=null;});
  $('b-fire').onclick=()=>{initAudio();doFire();};
  $('b-mep').addEventListener('click',()=>{if(TIPS[levelN]){tipAcik=true;tipGoster();tipKapat(5000);}});
  $('b-reset').onclick=()=>{if(game&&!game.over){start(levelN,stopIdx);show();}};
  $('b-map').onclick=()=>{
    if(!game||game.over)return;
    if(game.moves===0){go('map');return;}
    confirmBox(t('battle.leave.title'),t('battle.leave.text'),t('ui.toMap'),()=>{anim=null;go('map');});
  };
  window.addEventListener('resize',()=>{if(screen==='savas'&&game){layout();draw();}});

  return{start,show,doSwap,doFire,hasGame:()=>!!game,calcLayout,repaint:()=>{if(game&&Lay.H){paintBg();portreler();}},
    validMoves:()=>game?SAVAS.validMoves(game):[],
    get fxCount(){return sfx.length+fx.floats.length+fx.banners.length+(ending?1:0);},
    get layout(){return Object.assign({},Lay);},
    get state(){if(!game)return null;return{level:levelN,stopIdx,replay,animating:!!anim,el:!!el,board:game.board.map(c=>({t:SAVAS.KEYS[c.t],s:c.s||null})),
      pirateHp:game.pirateHp,pirateMax:game.pirateMax,hull:game.hull,hullMax:game.hullMax,fireDmg:game.fireDmg,dmgPct:game.dmgPct,movesLeft:game.movesLeft,moves:game.moves,
      attackIn:game.cd,attack:game.P.atk,broadside:game.broad,evade:game.evade,loot:game.loot,over:game.over,loseReason:game.loseReason,reward:game.reward};}};
})();

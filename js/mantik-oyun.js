// js/mantik-oyun.js — Oyun mantığı, DOM'suz: rota, kayıt, liman, gemi, yağma, satış hesabı (SEFER'i kullanır). Tanımlar: OYUN · Kullanır: SEFER, shipTier, buy
"use strict";
/*OYUN-LOGIC-START*/
// yolculuk (yükleme -> yol/korsan -> satış), şehirler, kayıt, liman, yağma ve satış hesabı (DOM'suz; SEFER'e dayanır)
const OYUN=(()=>{
  "use strict";
  const VERSION=3,PRICE=7,PRICEY=1.5,PLUNDER=0.3,MAXK=3;
  // liman binaları (sürüm 3): Depo günlük hediyeyi, Tersane gemi geliştirme fiyatını etkiler
  const HEDIYE=[200,400,700,1200];
  // görünen adlar ve etki metinleri arayüzde (dil sözlüğü: business.<id>.*, ship.part.<id>.*, ship.tier.<kimlik>)
  const PORT=[
    {id:'depo',e:'📦',prices:[3000,8000,18000]},
    {id:'pazar',e:'⚖️',prices:[3000,8000,18000]},
    {id:'tersane',e:'⚓',prices:[3000,8000,18000]},
    {id:'dokum',e:'🔥',prices:[3000,8000,18000]}
  ];
  // gemi parçaları: her biri 0-3 kademe; toplam kademe geminin görünüşünü belirler
  const SHIP=[
    {id:'govde',e:'🪵',prices:[2500,7000,16000]},
    {id:'toplar',e:'💣',prices:[2500,7000,16000]},
    {id:'ambar',e:'📦',prices:[2500,7000,16000]}
  ];
  const SHIP_TIERS=['tekne','kalyon','savasKalyonu','amiral']; // kademe kimlikleri: Tüccar Teknesi, Kalyon, Savaş Kalyonu, Amiral Gemisi
  const TIER_AT=[0,3,6,9]; // kademe eşikleri (toplam parça kademesi)
  // savunma ve korsan gücü: savunma >= korsan gücü ise korsan otomatik püskürtülebilir
  const SAVUNMA_TABAN=10,SAVUNMA_GOVDE=4,SAVUNMA_TOP=4,SAVUNMA_DOKUM=3; // kademesiz 10, tam (3/3/3) 43
  // korsan gücü = korsan canının yarısı + 4 (SAVAS.LEVELS canlarıyla: 18,22,28,48,...); 10'dan sonra her savaş +3.
  // Kolay korsanlar (1-3) birkaç geliştirmeyle, zorlar (4+) güçlü gemiyle püskürtülür; tam gemi 1-9'u karşılar.
  const KORSAN_GUC=[0,13,15,18,28,31,33,35,38,42,44];
  // şehir kimlikleri (sırayla: Karanfil Adası, Tuzburnu, İpek Koyu, Çay Yamacı, Fener Limanı, Mercan Kıyısı, Kehribar Körfezi, Sandal Burnu,
  // Lacivert Liman, Tarçın Adası, Rüzgârlı Kale, Sedef Koyu, Kumsaati Limanı, Yosun Adası, Bakır Burnu, Fırtına Koyu); görünen ad arayüzden (adlar.sehir)
  const CITIES=['karanfil','tuzburnu','ipek','cay','fener','mercan','kehribar','sandal','lacivert','tarcin','ruzgarli','sedef','kumsaati','yosun','bakir','firtina'];
  const ROMAN=['','','II','III','IV','V','VI','VII','VIII','IX','X'];
  // adlar: arayüz kimliği görünen ada çevirir (js/ortak.js dil sözlüğünü bağlar); Node'daki ölçümde kimliğin kendisi
  const adlar={sehir:id=>id};
  function cityName(c){
    c=Math.max(0,c|0);const k=Math.floor(c/CITIES.length)+1,base=adlar.sehir(CITIES[c%CITIES.length]);
    return k===1?base:base+' '+(ROMAN[k]||k);
  }
  const portDef=id=>PORT.find(p=>p.id===id);
  const shipDef=id=>SHIP.find(p=>p.id===id);
  // durak i (0'dan) = yolculuk i+1: şehir i -> şehir i+1. Her 3. yolculukta korsan.
  function tripInfo(i){
    i=Math.max(0,i|0);const n=i+1,goods=SEFER.levelParams(n).goods;
    const h=(Math.imul(n,2654435761)>>>0)%goods.length;
    const pricey=goods[h]==='porselen'?goods[(h+1)%goods.length]:goods[h]; // porselen zaten 2 kat; pahalı mal olmaz
    // kosul: rota koşulu (SEFER.kosulInfo; korsanlı ve ilk üç yolculukta null)
    return{i,n,from:cityName(i),to:cityName(i+1),pricey,pirate:n%3===0,battle:n%3===0?n/3:0,kosul:SEFER.kosulInfo(n)};
  }
  // jeton: "ek hamle" jetonu; denemeAltin: deneme mağazasından gelen altın (ekonomi ölçümünden ayrı tutulur)
  // deneme: aynı yolculuğun yüklemesinde üst üste kaç kez kaybedildi {i: durak, k: kayıp}; yükleme kazanılınca sıfırlanır (akıllı rıhtımın yardım düzeyi)
  function newSave(){return{v:VERSION,stop:0,gold:0,stops:[],port:{depo:0,pazar:0,tersane:0,dokum:0},ship:{govde:0,toplar:0,ambar:0},trip:null,jeton:0,denemeAltin:0,deneme:null};}
  const TIERS=['usta','duzgun','daginik'];
  function cleanCargo(c){
    const out={};if(!c||typeof c!=='object')return out;
    for(const g of(SEFER.CARGO_KEYS||SEFER.GOOD_KEYS))if(c[g]&&typeof c[g]==='object'){const x=c[g];out[g]={n:Math.max(0,x.n|0),q2:Math.max(0,x.q2|0),q3:Math.max(0,x.q3|0),wet:Math.max(0,x.wet|0)};}
    return out;
  }
  // rota koşulunun satış sonucu: {id, prim, ok, kirik}; eski kayıtta yoksa ya da bozuksa null (koşulsuz)
  function cleanKosul(k){
    if(!k||typeof k!=='object'||!SEFER.KOSUL||!SEFER.KOSUL[k.id])return null;
    return{id:k.id,prim:Math.max(0,Math.min(0.5,+k.prim||0)),ok:!!k.ok,kirik:Math.max(0,k.kirik|0)};
  }
  const lvl=v=>Math.min(MAXK,Math.max(0,v|0));
  // Sürüm 2 kaydı sessizce göç eder: eski Depo (+hamle) gemi Ambarı, eski Tersane (+gövde) gemi Gövdesi olur;
  // Pazar ve Dökümhane yerinde kalır, yeni Depo ve Tersane binaları 0'dan başlar. Altın ve ilerleme korunur.
  // Sürümsüz ya da bozuk kayıt sıfırlanır.
  function sanitize(s){
    const d=newSave();
    if(!s||typeof s!=='object'||(s.v!==VERSION&&s.v!==2))return d;
    const old=s.v===2;
    d.stop=Math.max(0,s.stop|0);d.gold=Math.max(0,Math.round(+s.gold||0));
    const st=Array.isArray(s.stops)?s.stops:[];
    for(let i=0;i<d.stop;i++){const r=st[i]&&typeof st[i]==='object'?st[i]:{};
      d.stops.push(Object.assign({r:TIERS.includes(r.r)?r.r:'duzgun',gold:Math.max(0,r.gold|0)},r.plundered?{plundered:1}:{}));}
    const p=s.port&&typeof s.port==='object'?s.port:{};
    if(old){
      d.ship.ambar=lvl(p.depo);d.ship.govde=lvl(p.tersane);
      d.port.pazar=lvl(p.pazar);d.port.dokum=lvl(p.dokum);
    }else{
      for(const q of PORT)d.port[q.id]=lvl(p[q.id]);
      const sh=s.ship&&typeof s.ship==='object'?s.ship:{};
      for(const q of SHIP)d.ship[q.id]=lvl(sh[q.id]);
      d.jeton=Math.max(0,s.jeton|0);d.denemeAltin=Math.max(0,Math.round(+s.denemeAltin||0));
      const dn=s.deneme;if(dn&&typeof dn==='object'&&(dn.i|0)>=0&&(dn.i|0)<=d.stop&&(dn.k|0)>0)d.deneme={i:dn.i|0,k:Math.min(DENEME_MAX,dn.k|0)};
    }
    const t=s.trip;
    if(t&&typeof t==='object'&&(t.i|0)>=0&&(t.i|0)<=d.stop&&(t.phase==='savas'||t.phase==='satis')){
      const i=t.i|0;
      d.trip={i,n:i+1,replay:i<d.stop,phase:t.phase,cargo:cleanCargo(t.cargo),tier:TIERS.includes(t.tier)?t.tier:'duzgun',
        early:Math.min(SEFER.EARLY_MAX,Math.max(0,t.early|0)),loot:Math.max(0,t.loot|0),lootPaid:Math.max(0,t.lootPaid|0),
        plundered:t.plundered?1:0,lost:t.lost&&typeof t.lost==='object'?t.lost:null,
        reklam:t.reklam?1:0,oto:t.oto?1:0,kurtar:t.kurtar?1:0,kosul:cleanKosul(t.kosul)};
    }
    return d;
  }
  // port: liman binaları, ship: gemi parçaları (ikisi de isteğe bağlı)
  function effects(port,ship){
    port=port||{};ship=ship||{};
    return{extraMoves:ship.ambar|0,saleBonus:0.1*(port.pazar|0),hullBonus:4*(ship.govde|0),fireBonus:2*(port.dokum|0),
      dmgPct:10*(ship.toplar|0),hediye:HEDIYE[lvl(port.depo)],indirim:0.05*(port.tersane|0)};
  }
  function nextPrice(s,id){const p=portDef(id),k=s.port[id]|0;return p&&k<MAXK?p.prices[k]:null;}
  function buy(s,id){
    const pr=nextPrice(s,id);
    if(pr==null||s.gold<pr)return false;
    s.gold-=pr;s.port[id]=(s.port[id]|0)+1;return true;
  }
  // gemi
  function shipLevels(ship){ship=ship||{};return(ship.govde|0)+(ship.toplar|0)+(ship.ambar|0);}
  function shipTier(ship){const t=shipLevels(ship);let k=0;for(let i=0;i<TIER_AT.length;i++)if(t>=TIER_AT[i])k=i;return k;}
  function tierName(k){return SHIP_TIERS[Math.max(0,Math.min(SHIP_TIERS.length-1,k|0))];} // kademe kimliği (görünen ad: gemiAdi)
  // bir sonraki görünüşe kaç geliştirme kaldı (son kademede 0)
  function toNextTier(ship){const k=shipTier(ship);return k>=TIER_AT.length-1?0:TIER_AT[k+1]-shipLevels(ship);}
  // Tersane binası indirimi; fiyat 10'a yuvarlanır
  function shipPrice(s,id){
    const p=shipDef(id),k=s.ship[id]|0;if(!p||k>=MAXK)return null;
    return Math.round(p.prices[k]*(1-0.05*(s.port.tersane|0))/10)*10;
  }
  function upgradeShip(s,id){
    const pr=shipPrice(s,id);
    if(pr==null||s.gold<pr)return null;
    const from=shipTier(s.ship);
    s.gold-=pr;s.ship[id]=(s.ship[id]|0)+1;
    const to=shipTier(s.ship);
    return{price:pr,from,to,tierUp:to>from};
  }
  function savunma(s){
    const sh=s.ship||{},p=s.port||{};
    return SAVUNMA_TABAN+SAVUNMA_GOVDE*(sh.govde|0)+SAVUNMA_TOP*(sh.toplar|0)+SAVUNMA_DOKUM*(p.dokum|0);
  }
  function korsanGucu(battle){const n=Math.max(1,battle|0),L=KORSAN_GUC.length-1;return n<=L?KORSAN_GUC[n]:KORSAN_GUC[L]+3*(n-L);}
  // otomatik savunma ganimeti: savaşın ortalama ganimetinin (sim: ~150 + 18 × seviye) yarısı, 5'e yuvarlanır
  function autoLoot(battle){return Math.round((150+18*Math.max(1,battle|0))/2/5)*5;}
  function canAutoDefend(s){
    const tr=s.trip;if(!tr||tr.phase!=='savas')return false;
    return savunma(s)>=korsanGucu(tripInfo(tr.i).battle);
  }
  // yükleme denemesi: durak i için önceki kayıp sayısı; kayıpta bir artar (en çok DENEME_MAX), başka durağa geçince o durağa döner
  const DENEME_MAX=9;
  function denemeSay(s,i){const d=s&&s.deneme;return d&&d.i===(i|0)?d.k|0:0;}
  function denemeKayip(s,i){const k=Math.min(DENEME_MAX,denemeSay(s,i)+1);s.deneme={i:i|0,k};return k;}
  // 1) yükleme kazanıldı: yük ambarda, yolculuk korsana ya da satışa geçer (deneme sayısı sıfırlanır)
  function startTrip(s,i,res){
    const t=tripInfo(i);s.deneme=null;
    s.trip={i,n:t.n,replay:i<s.stop,phase:t.pirate?'savas':'satis',cargo:cleanCargo(res.cargo),tier:res.tier,
      early:Math.min(SEFER.EARLY_MAX,Math.max(0,res.early|0)),loot:0,lootPaid:0,plundered:0,lost:null,reklam:0,oto:0,kurtar:0,kosul:cleanKosul(res.kosul)};
    return s.trip;
  }
  // 2a) korsan battı: ganimet kasaya (yeniden oynamada satışta farkla birlikte hesaplanır)
  function battleWon(s,reward){
    const tr=s.trip;if(!tr||tr.phase!=='savas')return 0;
    tr.loot=reward;if(!tr.replay){s.gold+=reward;tr.lootPaid=reward;}
    tr.phase='satis';return reward;
  }
  // 2b) korsan kazandı: her maldan %30 (yukarı yuvarlanır; önce normal, sonra birinci kalite). Islak mal alınmaz.
  function plunderCargo(cargo){
    const lost={};
    for(const g in cargo){
      const c=cargo[g],tot=c.n+c.q2+c.q3;let k=Math.ceil(tot*PLUNDER);const L={n:0,q2:0,q3:0};
      for(const q of['n','q2','q3']){const d=Math.min(k,c[q]);c[q]-=d;L[q]=d;k-=d;}
      lost[g]=L;
    }
    return lost;
  }
  function battleLost(s){
    const tr=s.trip;if(!tr||tr.phase!=='savas')return null;
    tr.lost=plunderCargo(tr.cargo);tr.plundered=1;tr.phase='satis';return tr.lost;
  }
  // 2c) otomatik savunma: savaş oynanmaz, yük korunur, ganimetin yarısı
  function autoDefend(s){
    if(!canAutoDefend(s))return null;
    const tr=s.trip,reward=autoLoot(tripInfo(tr.i).battle);
    tr.oto=1;battleWon(s,reward);return reward;
  }
  // 2d) savaş kaybı reklamla kurtarıldı: yağma yok, ganimet yok, varışa geçilir
  function battleRescue(s){
    const tr=s.trip;if(!tr||tr.phase!=='savas'||tr.kurtar)return false;
    tr.kurtar=1;tr.phase='satis';return true;
  }
  const REKLAM_SATIS=0.5; // satışta reklam ödülü
  const PORSELEN_KAT=2;   // porselen birim fiyatı bu kat (Kırılacak mal koşulu)
  // 3) satış hesabı: satır = birim fiyat × (normal + 2×birinci + 3×tam saf); sonra derece, erken varış, koşul primi, Pazar, reklam ödülü
  // porselende "wet" sayısı kırık porselendir (satılmaz)
  function saleQuote(trip,port){
    const t=tripInfo(trip.i),rows=[];let sub=0;
    for(const g of Object.keys(trip.cargo)){
      const c=trip.cargo[g],hot=g===t.pricey,unit=PRICE*(hot?PRICEY:1)*(g==='porselen'?PORSELEN_KAT:1),units=c.n+2*c.q2+3*c.q3,total=Math.round(unit*units);
      rows.push({g,n:c.n,q2:c.q2,q3:c.q3,wet:c.wet,unit,units,total,hot});sub+=total;
    }
    const gm=SEFER.TIER_MULT[trip.tier]||1,pz=0.1*((port&&port.pazar)|0),rk=trip.reklam?REKLAM_SATIS:0;
    const K=trip.kosul||null,kd=K&&SEFER.KOSUL?SEFER.KOSUL[K.id]:null,kp=K?K.prim:0;
    const kirik=trip.cargo.porselen?trip.cargo.porselen.wet|0:0;
    const kosul=kd?{id:K.id,e:kd.e,prim:kp,ok:K.ok,kirik}:null;
    const total=Math.round(sub*gm*(1+trip.early/100)*(1+kp)*(1+pz)*(1+rk));
    return{rows,sub,tier:trip.tier,gradeMult:gm,early:trip.early,kosul,kosulPrim:kp,pazar:pz,reklam:rk,total,pricey:t.pricey,city:t.to};
  }
  // satıştan önce, yolculuk başına bir kez
  function saleAdBonus(s){const tr=s.trip;if(!tr||tr.phase!=='satis'||tr.reklam)return false;tr.reklam=1;return true;}
  const RANK={daginik:0,duzgun:1,usta:2};
  // satış: kasaya eklenen altını döner. Yeniden oynamada yalnız öncekinden fazlası (satış + ganimet) eklenir.
  function sell(s){
    const tr=s.trip;if(!tr||tr.phase!=='satis')return null;
    const q=saleQuote(tr,s.port),tripTotal=q.total+tr.loot;let add;
    if(!tr.replay&&tr.i===s.stop){
      add=tripTotal-tr.lootPaid;
      s.stops[tr.i]=Object.assign({r:tr.tier,gold:tripTotal},tr.plundered?{plundered:1}:{});s.stop++;
    }else{
      const old=s.stops[tr.i]||{gold:0,r:'daginik'};
      add=Math.max(0,tripTotal-(old.gold|0))-tr.lootPaid;
      const r=RANK[tr.tier]>RANK[old.r]?tr.tier:old.r;
      s.stops[tr.i]=Object.assign({},old,{r,gold:Math.max(tripTotal,old.gold|0)});
    }
    add=Math.max(0,add);s.gold+=add;s.trip=null;
    return{quote:q,add,tripTotal,loot:tr.loot};
  }
  return{VERSION,PRICE,PRICEY,PORSELEN_KAT,cleanKosul,PLUNDER,PORT,SHIP,SHIP_TIERS,TIER_AT,HEDIYE,MAXK,CITIES,REKLAM_SATIS,adlar,cityName,portDef,shipDef,tripInfo,newSave,DENEME_MAX,denemeSay,denemeKayip,sanitize,effects,nextPrice,buy,
    shipLevels,shipTier,tierName,toNextTier,shipPrice,upgradeShip,savunma,korsanGucu,autoLoot,canAutoDefend,
    startTrip,battleWon,plunderCargo,battleLost,autoDefend,battleRescue,saleQuote,saleAdBonus,sell};
})();
/*OYUN-LOGIC-END*/

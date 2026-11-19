// js/mantik-sefer.js — Yükleme (blok oyunu) mantığı, DOM'suz. Tanımlar: SEFER · Kullanır: yok
"use strict";
/*SEFER-LOGIC-START*/
const SEFER=(()=>{
  "use strict";
  const N=8;
  const GOOD_KEYS=['baharat','su','tuz','ipek','kahve','barut','tavuk','cay'];
  const CARGO_KEYS=GOOD_KEYS.concat(['porselen']); // ambara girebilen bütün mallar (porselen yalnız "Kırılacak mal" yolculuğunda gelir)

  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function norm(cells){const mx=Math.min(...cells.map(c=>c[0])),my=Math.min(...cells.map(c=>c[1]));return cells.map(c=>[c[0]-mx,c[1]-my])}
  function rot(cells){const h=Math.max(...cells.map(c=>c[1]))+1;return norm(cells.map(([x,y])=>[h-1-y,x]))}
  const sig=c=>norm(c).map(p=>p[0]+','+p[1]).sort().join(';');

  // temel şekiller; her biri bütün yönleriyle (döndürme oyuncuda yok, parça rastgele yönde gelir)
  const BASE=[
    [[0,0]],
    [[0,0],[1,0]],
    [[0,0],[1,0],[2,0]],
    [[0,0],[1,0],[0,1]],
    [[0,0],[1,0],[2,0],[3,0]],
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[2,0],[1,1]],
    [[1,0],[2,0],[0,1],[1,1]],
    [[0,0],[1,0],[1,1],[2,1]],
    [[0,0],[0,1],[0,2],[1,2]],
    [[1,0],[1,1],[1,2],[0,2]],
    [[0,0],[1,0],[2,0],[3,0],[4,0]],
    [[0,0],[0,1],[0,2],[1,2],[2,2]]
  ];
  const SHAPES=[[],[],[],[],[],[]];
  for(const b of BASE){
    const vars=[],seen=new Set();let c=norm(b);
    for(let r=0;r<4;r++){const s=sig(c);if(!seen.has(s)){seen.add(s);vars.push(c);}c=rot(c);}
    SHAPES[b.length].push(vars);
  }

  // sefer parametreleri (v4ten; v9'da akıllı rıhtımla: sipariş 1-3 16/17/18, bütçe ve Usta yeniden; sim_oyun.js rihtim ile ölçüldü)
  const TOTALS=[0,16,17,18,30,33,36,38,42,46,46,50,54,56,60,64];
  // akıllı rıhtımla yeniden ayarlandı (v9, sim_oyun.js rihtim: sıradan oyuncu hedef bantları); 15'ten sonra bütçe BUDGET_ADIM, yük +2 artar
  const BUDGET=[0,30,36,39,23,24,27,30,31,35,35,35,37,40,40,40];
  const BUDGET_ADIM=1.9;
  const USTA=[0,3,4,4,5,5,5,6,6,6,6,6,6,6,7,7];
  const ustaEsik=n=>n<USTA.length?USTA[n]:USTA[USTA.length-1]+Math.floor((n-USTA.length+1)/6); // 15'ten sonra her 6 yolculukta +1
  const PURE_MIN=6;  // sıranın en az bu kadar hücresi aynı maldansa saf sıra
  const PURE_MIN2=7; // iki mallı yolculuklarda (1-3) saf sıra eşiği; iki malla 6/8 neredeyse kendiliğinden oluşuyordu (tune_saf.js ile ölçüldü)
  const WET_MAX=4;   // toplam ıslanan hücre bunu geçerse istif Dağınık olur
  /* ---------- rota koşulları (yolculuk çeşitliliği) ----------
     Yolculuk 1-3 ve korsanlı yolculuklar (3, 6, 9, ...) koşulsuz. 4-15 arası sabit tanıtım sırası (her koşul bir kez, 4 ve 7 boş:
     orada başka yeni kural tanıtılıyor); 16'dan sonra korsansız yolculukların üçte ikisi koşullu, koşul yolculuk numarasından
     tohumlu seçilir ve bir önceki koşullu yolculuğun koşulu tekrar gelmez. Prim satışta toplam çarpandır (1 + prim). */
  // adı ve kaptanın açıklaması arayüzde (dil sözlüğü: cond.<id>.name, cond.<id>.tip): eski yük, kilitli sandık, kırılacak mal (porselen),
  // acele teslimat, özel sipariş, büyük sipariş
  const KOSUL={
    eski:{id:'eski',e:'📦',prim:0.10},
    kilit:{id:'kilit',e:'🔒',prim:0},
    porselen:{id:'porselen',e:'🏺',prim:0},
    acele:{id:'acele',e:'⏱',prim:0.30},
    ozel:{id:'ozel',e:'⭐',prim:0.25},
    buyuk:{id:'buyuk',e:'⚓',prim:0.20}
  };
  const KOSUL_IDS=Object.keys(KOSUL);
  const KOSUL_SIRA={5:'eski',8:'ozel',10:'porselen',11:'kilit',13:'acele',14:'buyuk'};
  const KOSUL_ILK=16,KOSUL_PAY=2/3;
  const KOSUL_PARAM={
    eski:n=>Math.max(5,Math.min(10,5+Math.floor((n-5)/6))), // eski sandık sayısı (5-10)
    eskiHamle:k=>Math.max(0,k-5),                              // 5'ten fazla her eski sandık için +1 hamle
    kilit:n=>n>=13?5:n>=9?4:3,                                 // kilitli sandık sayısı
    acele:0.86,aceleYuk:0.84,                                   // acele: hamle ve yük çarpanı
    buyukYuk:1.2,buyukHamle:1.25                               // büyük sipariş: yük ve hamle çarpanı
  };
  // özel sipariş çeşidi ve hedefi (yolculuktan tohumlu)
  const OZEL_TUR=['cift','saf','hamle'];
  function ozelHedef(n,tur){
    if(tur==='cift')return 2;                      // tek hamlede en az 2 sıra
    if(tur==='saf')return ustaEsik(n)+1; // Usta eşiğinin bir fazlası saf sıra
    return Math.max(5,Math.round(temelHamle(n)*(n>15?0.27:0.2))); // bütçenin beşte biri (16+ yolculukta dörtte biri) kadar hamle artır
  }
  // hedefin adı arayüzde (cond.ozel.<tur>): cift "tek hamlede n sıra", saf "n saf sıra", hamle "n hamle artır"
  const kmemo={};let kUpto=KOSUL_ILK-1,kLast=null;
  function kosulId(n){
    n=n|0;if(n<4||n%3===0)return null;
    if(n<KOSUL_ILK)return KOSUL_SIRA[n]||null;
    if(kLast===null){for(let m=KOSUL_ILK-1;m>=4;m--)if(KOSUL_SIRA[m]){kLast=KOSUL_SIRA[m];break;}}
    while(kUpto<n){
      const m=++kUpto;if(m%3===0)continue;
      const R=rng(Math.imul(m,2654435761)^0x5bd1e995);let id=null;
      if(R()<KOSUL_PAY){const c=KOSUL_IDS.filter(x=>x!==kLast);id=c[Math.floor(R()*c.length)];kLast=id;}
      kmemo[m]=id;
    }
    return kmemo[n];
  }
  function ozelFor(n){const R=rng(n*131+7),tur=n===8?'hamle':OZEL_TUR[Math.floor(R()*3)];return{tur,hedef:ozelHedef(n,tur)};}
  // yolculuğun koşulu (tanım + ayrıntı); kid verilirse o koşul zorlanır (test), 'yok' koşulsuz
  function kosulInfo(n,kid){
    const id=kid===undefined?kosulId(n):(kid==='yok'?null:kid);
    if(!id||!KOSUL[id])return null;
    const d=Object.assign({},KOSUL[id]);
    if(id==='ozel')d.ozel=ozelFor(n);
    if(id==='eski')d.adet=KOSUL_PARAM.eski(n);
    if(id==='kilit')d.adet=KOSUL_PARAM.kilit(n);
    return d;
  }
  // koşulun ilk çıktığı yolculuk (kaptan o yolculukta açıklar)
  function kosulIlk(id){for(const n in KOSUL_SIRA)if(KOSUL_SIRA[n]===id)return +n;for(let n=KOSUL_ILK;n<KOSUL_ILK+400;n++)if(kosulId(n)===id)return n;return 0;}

  // dalga: hamle bütçesi dört yolculukluk döngüde hafifçe iner çıkar (yolculuk 4'ten başlar; 1-3 düz)
  const DALGA=[1.03,1.00,0.98,1.04];
  const dalga=n=>n<4?1:DALGA[(n-4)%4];
  function temelHamle(n){const last=TOTALS.length-1;return n<=last?BUDGET[n]:Math.round(BUDGET[last]+BUDGET_ADIM*(n-last));}
  function levelParams(n,kid){
    n=Math.max(1,n|0);
    const R=rng(n*9973+11),ri=k=>Math.floor(R()*k);
    const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
    const k=n<=3?2:n<=8?3:4;
    const kosul=kosulInfo(n,kid),kId=kosul?kosul.id:null;
    let goods;
    if(n<=3)goods=[['baharat','su'],['tuz','ipek'],['kahve','cay']][n-1];
    else if(n>=7)goods=['baharat','su',...shuffle(GOOD_KEYS.slice(2))].slice(0,k);
    else goods=shuffle(GOOD_KEYS.slice()).slice(0,k);
    if(kId==='porselen'){ // bir mal porselene döner; barut mutlaka bulunur (baharat ve dört mallı yolculukta su korunur)
      const keep=n>=7?(k>=4?['baharat','su']:['baharat']):[];
      const free=()=>goods.map((g,i)=>i).filter(i=>!keep.includes(goods[i])&&goods[i]!=='barut'&&goods[i]!=='porselen');
      if(!goods.includes('barut')){const f=free();goods[f[f.length-1]]='barut';}
      const f=free();goods[f[f.length-1]]='porselen';
    }
    const last=TOTALS.length-1;
    let total=n<=last?TOTALS[n]:TOTALS[last]+2*(n-last);
    if(kId==='buyuk')total=Math.round(total*KOSUL_PARAM.buyukYuk);
    if(kId==='acele')total=Math.round(total*KOSUL_PARAM.aceleYuk);
    const order={},base=Math.floor(total/k);let rem=total-base*k;
    goods.forEach(g=>{order[g]=base+(rem>0?1:0);rem--;});
    if(n>=4){const a=ri(k),b=(a+1+ri(k-1))%k;order[goods[a]]+=2;order[goods[b]]-=2;}
    const sizeW=n<=3?[3.5,4.5,4,1,0.25]:n<=6?[1.6,3,4,3.4,1]:n<=9?[1,2.5,4,4,1.6]:[0.8,2,3.5,4.5,2.2];
    let moves=temelHamle(n);
    moves=Math.round(moves*dalga(n));
    if(kId==='acele')moves=Math.round(moves*KOSUL_PARAM.acele);
    if(kId==='buyuk')moves=Math.round(moves*KOSUL_PARAM.buyukHamle);
    if(kId==='eski')moves+=KOSUL_PARAM.eskiHamle(kosul.adet);
    const ustaT=ustaEsik(n);
    return{n,goods,order,sizeW,wet:n>=7,moves,ustaT,pureMin:k<=2?PURE_MIN2:PURE_MIN,kosul};
  }

  const idx=(x,y)=>y*N+x;
  function canPlace(board,cells,gx,gy){
    for(const[x,y]of cells){const X=gx+x,Y=gy+y;
      if(X<0||Y<0||X>=N||Y>=N||board[idx(X,Y)]!==null)return false;}
    return true;
  }
  function fitsAnywhere(board,cells){
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(canPlace(board,cells,x,y))return true;
    return false;
  }
  // parçanın tahtada kaç yere sığdığı (en çok "tavan"a kadar sayar)
  function yerSay(board,cells,tavan){let k=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(canPlace(board,cells,x,y)&&++k>=tavan)return k;return k;}
  function anyTrayFits(game){return game.tray.some(t=>t&&fitsAnywhere(game.board,t.cells));}
  // '#' ile başlayan hücreler (eski sandık '#e', kilitli sandık '#k') hiçbir malın sayılmaz
  const ENGEL=v=>typeof v==='string'&&v[0]==='#';
  function lineMajor(gs){
    const c={};let best=null,bn=0;
    for(const g of gs){if(g===null||ENGEL(g))continue;c[g]=(c[g]||0)+1;if(c[g]>bn){bn=c[g];best=g;}}
    return{good:best,count:bn};
  }

  // Yerleşimin sonucu (tahtayı değiştirmeden; önizleme, otomatik oyuncu ve hamle aynı kodu kullanır).
  // Teslim edilen her hücre ambara yük olarak girer; kalitesi sıranın katıdır (1 normal, 2 saf, 3 tam saf). Islanan baharat yüke "ıslak" girer.
  function evaluate(game,cells,gx,gy,good){
    const b=game.board.slice();
    for(const[x,y]of cells)b[idx(gx+x,gy+y)]=good;
    const lines=[];
    for(let y=0;y<N;y++){const c=[];for(let x=0;x<N;x++)c.push(idx(x,y));if(c.every(i=>b[i]!==null))lines.push({kind:'row',i:y,cells:c});}
    for(let x=0;x<N;x++){const c=[];for(let y=0;y<N;y++)c.push(idx(x,y));if(c.every(i=>b[i]!==null))lines.push({kind:'col',i:x,cells:c});}
    const mult=new Map(),wetCells=new Set(),brokenCells=new Set();let pureLines=0,fullPure=0;
    for(const L of lines){
      const gs=L.cells.map(i=>b[i]),mj=lineMajor(gs);
      L.pure=mj.count>=N?'tam':mj.count>=(game.P.pureMin||PURE_MIN)?'saf':null;
      if(L.pure)pureLines++;
      if(L.pure==='tam')fullPure++;
      const m=L.pure==='tam'?3:L.pure==='saf'?2:1;
      L.cells.forEach(i=>{if(!(mult.get(i)>=m))mult.set(i,m);});
      if(game.P.wet&&gs.includes('su')&&gs.includes('baharat'))L.cells.forEach(i=>{if(b[i]==='baharat')wetCells.add(i);});
      if(gs.includes('porselen')&&gs.includes('barut'))L.cells.forEach(i=>{if(b[i]==='porselen')brokenCells.add(i);});
    }
    let wetN=0,value=0,kirikN=0,kilitN=0,eskiN=0;const delivered={},cleared=[],cargoAdd={};
    for(const[i,m]of mult){
      let g=b[i];
      if(g==='#e'){eskiN++;cleared.push({x:i%N,y:(i/N)|0,good:null,eski:true,wet:false,mult:m});continue;} // eski sandık: yük değil
      const kilit=g==='#k';
      if(kilit){kilitN++;g=(game.lock&&game.lock[i])||null;if(!g){cleared.push({x:i%N,y:(i/N)|0,good:null,kilit:true,wet:false,mult:m});continue;}}
      const wet=wetCells.has(i),kirik=brokenCells.has(i);
      cleared.push(Object.assign({x:i%N,y:(i/N)|0,good:g,wet,mult:m},kilit?{kilit:true}:{},kirik?{kirik:true}:{}));
      const c=cargoAdd[g]||(cargoAdd[g]={n:0,q2:0,q3:0,wet:0});
      if(wet){wetN++;c.wet++;continue;}
      if(kirik){kirikN++;c.wet++;delivered[g]=(delivered[g]||0)+1;continue;} // kırık porselen: siparişe sayılır ama değersizdir (yükte "kırık")
      delivered[g]=(delivered[g]||0)+1;
      if(m===3)c.q3++;else if(m===2)c.q2++;else c.n++;
      value+=m;
    }
    let useful=0;
    for(const o of game.order)if(delivered[o.g])useful+=Math.min(delivered[o.g],Math.max(0,o.need-o.got));
    return{lines,cleared,delivered,cargoAdd,value,combo:lines.length,pureLines,fullPure,wetN,kirikN,kilitN,eskiN,useful,board:b};
  }

  // bütün şekil yönleri düz liste (akıllı rıhtım taraması için); VID[size][aile][yön] -> düz sıra
  const VARS=[],VID=SHAPES.map(f=>f.map(v=>v.map(()=>-1)));
  SHAPES.forEach((fams,size)=>fams.forEach((fam,fi)=>fam.forEach((cells,vi)=>{
    VID[size][fi][vi]=VARS.length;
    const own=new Set(cells.map(c=>c[0]+','+c[1])),nb=[];
    for(const[x,y]of cells)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!own.has((x+dx)+','+(y+dy)))nb.push([x+dx,y+dy]);
    const w=Math.max(...cells.map(c=>c[0]))+1,h=Math.max(...cells.map(c=>c[1]))+1;
    VARS.push({cells,size,w,h,nb});
  })));
  function pickPiece(game){
    const R=game.R,P=game.P,ri=k=>Math.floor(R()*k);
    const missing=game.order.filter(o=>o.got<o.need).map(o=>o.g);
    const good=(missing.length&&R()<0.7)?missing[ri(missing.length)]:P.goods[ri(P.goods.length)];
    const w=P.sizeW,sum=w.reduce((a,b)=>a+b,0);let r=R()*sum,size=1;
    for(let i=0;i<w.length;i++){r-=w[i];if(r<0){size=i+1;break;}}
    const fi=ri(SHAPES[size].length),fam=SHAPES[size][fi],vi=ri(fam.length);
    const cells=fam[vi].map(c=>c.slice());
    return{good,cells,vid:VID[size][fi][vi]};
  }

  /* ---------- akıllı rıhtım: tahtaya bakan parça üretimi ----------
     Her üçlüde bir "yardımcı" parça tahtadaki bir boşluğa iyi oturur; diğer ikisi olağan dağılımdan gelir, yardım düzeyi h
     arttıkça "iki adaydan uyumlusu" kuralıyla hafifçe uyumlu adaylara kayar. h (0-1):
       h = YARDIM.taban (+ YARDIM.ilkYol, yolculuk 1-3) - YARDIM.yolEgim·(yolculuk-1)   (ilerledikçe taban hafifçe düşer)
         + YARDIM.dolu · max(0, doluluk - YARDIM.doluEsik)/(1 - YARDIM.doluEsik) (tahta doldukça kurtarıcı parça)
         + YARDIM.deneme · min(önceki kayıp, YARDIM.denemeMax)                  (aynı yolculukta yeniden deneme)
         - YARDIM.rahat · max(0, sipariş ilerlemesi - harcanan hamle payı - YARDIM.rahatPay)  (oyuncu rahatsa azalır)
     Yardımcı parça, puana göre sıralı adayların ilk K'sından rastgele seçilir: K = topkEn - (topkEn - topkAz)·h.
     Olağan parçalardan tahtada max(azYer, doluluk·azYerDolu)'dan az yere sığanı en çok azYerDene kez yeniden çekilir (sıkışarak kaybı azaltır).
     Tehlikede (doluluk ≥ tehlike) ikinci parça da yardımcıdır, üçüncüsü için eşik azYerTehlike ve deneme tehlikeDene olur;
     üçüncü parça hiçbir zaman zorla yardımcı olmaz. */
  const YARDIM={taban:0.40,ilkYol:0.3,yolEgim:0.006,yolEgimMax:19,dolu:0.55,doluEsik:0.35,deneme:0.30,denemeMax:2,rahat:1.6,rahatPay:0.04,
    topkEn:16,topkAz:2,kayma:0.6,tehlike:0.5,tehlikeDene:8,azYer:4,azYerDolu:14,azYerTehlike:8,azYerDene:8,
    // yerleşim puanı ağırlıkları
    pTam:4,pYakin7:1.4,pYakin6:0.5,pYaslan:1.2,pSaf:1.3,pEksik:0.8,pCatisma:4,pIslak:4,pHucre:0.08};
  // tahtanın sıra özetleri: her satır/sütun (0-7 satır, 8-15 sütun) doluluk ve mal sayıları
  function sirOzet(game){
    const b=game.board,fill=Array(2*N).fill(0),cnt=[];for(let i=0;i<2*N;i++)cnt.push({});
    let dolu=0;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const v=b[idx(x,y)];if(v===null)continue;dolu++;fill[y]++;fill[N+x]++;
      if(!ENGEL(v)){cnt[y][v]=(cnt[y][v]||0)+1;cnt[N+x][v]=(cnt[N+x][v]||0)+1;}
      else if(v==='#k'&&game.lock[idx(x,y)]){const g=game.lock[idx(x,y)];cnt[y][g]=(cnt[y][g]||0)+0.5;cnt[N+x][g]=(cnt[N+x][g]||0)+0.5;}}
    return{fill,cnt,dolu};
  }
  // aday puanları: her (şekil yönü, mal) için en iyi yerleşim {s, x, y}; tahta başına bir kez
  function adayTablo(game,oz){
    const b=game.board,P=game.P,W=YARDIM,goods=P.goods,G=goods.length,pm=P.pureMin||PURE_MIN;
    const eksik=goods.map(g=>game.order.some(o=>o.g===g&&o.got<o.need));
    const tab=new Array(VARS.length*G);
    const rk=new Array(N).fill(0),ck=new Array(N).fill(0);
    for(let v=0;v<VARS.length;v++){
      const V=VARS[v];const best=new Array(G).fill(null);
      for(let gy=0;gy+V.h<=N;gy++)for(let gx=0;gx+V.w<=N;gx++){
        let ok=true;for(const[x,y]of V.cells)if(b[idx(gx+x,gy+y)]!==null){ok=false;break;}
        if(!ok)continue;
        // şekil puanı (maldan bağımsız): tamamlanan ve yaklaşan sıralar, yaslanma
        for(const[x,y]of V.cells){rk[gy+y]++;ck[gx+x]++;}
        let sekil=0;const sir=[];
        for(let i=0;i<N;i++){
          if(rk[i]){const f=oz.fill[i]+rk[i];sekil+=f===N?W.pTam:f===N-1?W.pYakin7:f===N-2?W.pYakin6:0;if(f>=5)sir.push(i,rk[i],f);rk[i]=0;}
          if(ck[i]){const f=oz.fill[N+i]+ck[i];sekil+=f===N?W.pTam:f===N-1?W.pYakin7:f===N-2?W.pYakin6:0;if(f>=5)sir.push(N+i,ck[i],f);ck[i]=0;}
        }
        let yas=0;for(const[x,y]of V.nb){const X=gx+x,Y=gy+y;if(X<0||Y<0||X>=N||Y>=N||b[idx(X,Y)]!==null)yas++;}
        sekil+=W.pYaslan*yas/V.nb.length+W.pHucre*V.size;
        for(let gi=0;gi<G;gi++){
          const g=goods[gi];let s=sekil+(eksik[gi]?W.pEksik:0);
          for(let k=0;k<sir.length;k+=3){
            const L=sir[k],kk=sir[k+1],f=sir[k+2],c=oz.cnt[L],m=(c[g]||0)+kk;
            let ust=0;for(const h in c)if(h!==g&&c[h]>ust)ust=c[h];
            if(m>ust)s+=W.pSaf*(m/N)*(f/N)*(m>=pm?1.5:1);
            if((g==='porselen'&&c.barut)||(g==='barut'&&c.porselen))s-=W.pCatisma;
            if(P.wet&&((g==='su'&&c.baharat)||(g==='baharat'&&c.su)))s-=W.pIslak;
          }
          if(!best[gi]||s>best[gi].s)best[gi]={s,x:gx,y:gy};
        }
      }
      for(let gi=0;gi<G;gi++)tab[v*G+gi]=best[gi];
    }
    return tab;
  }
  function yardimDuzeyi(game,dolu){
    const W=YARDIM,n=game.n|0;
    let need=0,got=0;for(const o of game.order){need+=o.need;got+=Math.min(o.got,o.need);}
    const ilerleme=need?got/need:1,harcanan=game.moves/Math.max(1,game.moves+game.movesLeft);
    const h=W.taban+(n<=3?W.ilkYol:0)-W.yolEgim*Math.min(W.yolEgimMax,Math.max(0,n-1))
      +W.dolu*Math.max(0,(dolu-W.doluEsik)/(1-W.doluEsik))
      +W.deneme*Math.min(W.denemeMax,game.deneme|0)
      -W.rahat*Math.max(0,ilerleme-harcanan-W.rahatPay);
    return Math.max(0,Math.min(1,h));
  }
  function refillTray(game){
    if(game.tray.some(t=>t))return;
    const R=game.R,P=game.P,G=P.goods.length,oz=sirOzet(game),dolu=oz.dolu/(N*N);
    const h=yardimDuzeyi(game,dolu),tab=adayTablo(game,oz);
    const ad=[];for(let i=0;i<tab.length;i++)if(tab[i])ad.push({i,s:tab[i].s});
    if(!ad.length){ // hiçbir şey sığmıyor (tahta tamamen dolu): olağan üçlü
      game.tray=[pickPiece(game),pickPiece(game),pickPiece(game)];return;
    }
    ad.sort((a,b)=>b.s-a.s||a.i-b.i);
    const yuksek=ad[Math.max(0,Math.ceil(ad.length*0.1)-1)].s; // "yüksek puanlı": ilk %10
    const K=Math.max(1,Math.min(ad.length,Math.round(YARDIM.topkEn-(YARDIM.topkEn-YARDIM.topkAz)*h)));
    const yap=a=>{const v=Math.floor(a.i/G),gi=a.i%G,t=tab[a.i];return{good:P.goods[gi],cells:VARS[v].cells.map(c=>c.slice()),vid:v,yer:[t.x,t.y],y:1};};
    const puan=p=>{const t=tab[p.vid*G+P.goods.indexOf(p.good)];return t?t.s:-1e9;};
    const tehlike=dolu>=YARDIM.tehlike;
    const yard=yap(ad[Math.floor(R()*K)]);
    const evY=evaluate(game,yard.cells,yard.yer[0],yard.yer[1],yard.good),sonra=evY.board;
    for(const c of evY.cleared)sonra[idx(c.x,c.y)]=null;
    const digerleri=[];
    for(let k=0;k<2;k++){
      if(k===0&&tehlike){digerleri.push(yap(ad[Math.floor(R()*K)]));continue;}
      let p=pickPiece(game);
      if(R()<YARDIM.kayma*h){const q=pickPiece(game);if(puan(q)>puan(p))p=q;}
      // sıkışmaya karşı: tahtada az yeri olan parça (en çok azYerDene kez) yeniden çekilir; tehlikede sığmayan hiç kalmaz
      // yer, hem bugünkü tahtada hem yardımcı önerilen yerine konduktan sonraki tahtada sayılır (azı geçerli)
      const esik=tehlike?YARDIM.azYerTehlike:Math.max(YARDIM.azYer,Math.round(dolu*YARDIM.azYerDolu));
      // beşlik parçalar dağınık tahtada en zor yer bulanlardır: eşikleri iki kat (oran olarak karşılaştırılır)
      const es=c=>c.length>=5?2*esik:esik,ys=c=>Math.min(yerSay(game.board,c,es(c)),yerSay(sonra,c,es(c)))/es(c);
      for(let a=0,yer=ys(p.cells);a<(tehlike?YARDIM.tehlikeDene:YARDIM.azYerDene)&&yer<1;a++){
        const q=pickPiece(game),yq=ys(q.cells);if(yq>yer){p=q;yer=yq;}}
      digerleri.push(p);
    }
    // yardımcının tepsideki yeri rastgele
    const tray=digerleri.slice(),at=Math.floor(R()*3);tray.splice(at,0,yard);
    if(!tray.some(p=>fitsAnywhere(game.board,p.cells)))tray[at]={good:yard.good,cells:[[0,0]],y:1}; // olmaz; yedek
    game.tray=tray;
    // ölçü (yalnız test/ölçüm): üçlü sayısı, üçü de yüksek puanlı üçlüler
    const st=game.yardim;st.uclu++;st.hToplam+=h;
    if(tray.every(p=>puan(p)>=yuksek)){st.ucYuksek++;if(!tehlike)st.ucYuksekTehlikesiz++;}
    if(tehlike)st.tehlike++;
  }
  const EARLY_MAX=12; // kalan her hamle satışa +%1 erken varış primi, en çok %12 (v9: 15'ten; akıllı rıhtımla gelir arttı). Yeniden deneme payı prime sayılmaz
  // engelleri yerleştir: her satır ve sütunda en çok "max" engel; hiçbir sıra engelle dolmaz
  function placeObstacles(game,count,mark,max){
    const R=game.R,rowN=Array(N).fill(0),colN=Array(N).fill(0),out=[];
    for(let i=0;i<N*N;i++){const x=i%N,y=(i/N)|0;if(game.board[i]!==null){rowN[y]++;colN[x]++;}}
    for(let t=0;t<400&&out.length<count;t++){
      const x=Math.floor(R()*N),y=Math.floor(R()*N),i=idx(x,y);
      if(game.board[i]!==null||rowN[y]>=max||colN[x]>=max)continue;
      game.board[i]=mark;rowN[y]++;colN[x]++;out.push(i);
    }
    return out;
  }
  // yeniden deneme: aynı yolculukta önceki kayıp sayısına göre bütçeye pay (1. kayıptan sonra %8, 2.den sonra %24, sonra %32)
  const DENEME_HAMLE=[0,0.08,0.24,0.32];
  const denemeHamle=(moves,d)=>d>0?Math.max(1,Math.round(moves*DENEME_HAMLE[Math.min(d,DENEME_HAMLE.length-1)])):0;
  // opts: {extraMoves (gemi Ambarı), deneme (aynı yolculukta önceki kayıp sayısı), kosul (yalnız test: koşul kimliği ya da 'yok')}
  function newGame(n,seed,opts){
    const o=opts||{},P=levelParams(n,o.kosul),extra=Math.max(0,o.extraMoves|0),dn=Math.max(0,o.deneme|0),dEk=denemeHamle(P.moves,dn);
    const game={n:P.n,P,R:rng((seed==null?n*7919:seed)|0),board:Array(N*N).fill(null),tray:[null,null,null],
      order:P.goods.map(g=>({g,need:P.order[g],got:0})),cargo:{},pure:0,fullPure:0,wet:0,kirik:0,kilitKirik:0,
      moves:0,movesLeft:P.moves+extra+dEk,extraMoves:extra,denemeHamle:dEk,early:0,over:null,loseReason:null,lock:{},ozel:null,
      deneme:dn,yardim:{uclu:0,ucYuksek:0,ucYuksekTehlikesiz:0,tehlike:0,hToplam:0}};
    const K=P.kosul;
    if(K&&K.id==='eski')placeObstacles(game,K.adet,'#e',2);
    if(K&&K.id==='kilit'){
      const cs=placeObstacles(game,K.adet,'#k',1);
      cs.forEach((i,k)=>{game.lock[i]=P.goods[k%P.goods.length];}); // içindeki mal: siparişteki mallardan sırayla
    }
    if(K&&K.id==='ozel')game.ozel={tur:K.ozel.tur,hedef:K.ozel.hedef,ilerleme:0,ok:false,bitti:false};
    refillTray(game);
    return game;
  }
  // özel sipariş ilerlemesi (her hamleden sonra)
  function ozelGuncelle(game,ev){
    const o=game.ozel;if(!o||o.bitti)return;
    if(o.tur==='cift'){o.ilerleme=Math.max(o.ilerleme,ev.combo);if(ev.combo>=o.hedef)o.ok=true;}
    else if(o.tur==='saf'){o.ilerleme=game.pure;if(game.pure>=o.hedef)o.ok=true;}
    else{o.ilerleme=game.movesLeft;o.ok=game.movesLeft>=o.hedef;}
    if(game.over)o.bitti=true;
  }
  // satışa giden koşul sonucu: {id, prim, ok, kirik}; koşulsuz yolculukta null
  function kosulSonuc(game){
    const K=game&&game.P&&game.P.kosul;if(!K)return null;
    const ok=K.id==='ozel'?!!(game.ozel&&game.ozel.ok):true;
    return{id:K.id,prim:ok?K.prim:0,ok,kirik:game.kirik|0};
  }

  // bir hamle: yerleştir, dolan sıraları ambara yükle, asgari yük tamamsa kazan
  function placePiece(game,slot,gx,gy){
    const t=game.tray[slot];
    if(game.over||!t||!canPlace(game.board,t.cells,gx,gy))return null;
    const ev=evaluate(game,t.cells,gx,gy,t.good);
    const placed=t.cells.map(([x,y])=>[gx+x,gy+y]);
    for(const[x,y]of placed)game.board[idx(x,y)]=t.good;
    game.tray[slot]=null;game.moves++;game.movesLeft--;
    game.kirik+=ev.kirikN;game.kilitKirik+=ev.kilitN;
    for(const o of game.order)if(ev.delivered[o.g])o.got+=ev.delivered[o.g]; // hedefin üstü de yüke girer
    for(const g in ev.cargoAdd){
      const c=game.cargo[g]||(game.cargo[g]={n:0,q2:0,q3:0,wet:0}),a=ev.cargoAdd[g];
      c.n+=a.n;c.q2+=a.q2;c.q3+=a.q3;c.wet+=a.wet;
    }
    game.pure+=ev.pureLines;game.fullPure+=ev.fullPure;game.wet+=ev.wetN;
    for(const c of ev.cleared){const i=idx(c.x,c.y);game.board[i]=null;delete game.lock[i];}
    if(game.order.every(o=>o.got>=o.need)){game.over='win';game.early=Math.min(EARLY_MAX,Math.max(0,game.movesLeft-(game.denemeHamle|0)));}
    else if(game.movesLeft<=0){game.over='lose';game.loseReason='moves';}
    else{refillTray(game);if(!anyTrayFits(game)){game.over='lose';game.loseReason='full';}}
    ozelGuncelle(game,ev);
    delete ev.board;
    return Object.assign(ev,{good:t.good,placed,over:game.over,loseReason:game.loseReason});
  }
  function cargoCount(cargo){let k=0;for(const g in cargo){const c=cargo[g];k+=c.n+c.q2+c.q3+c.wet;}return k;}
  // kurtarmada boşalan hücre: mal, eski sandık ya da kilitli sandık (kilit kırılır; içindeki mal yüke sayılmaz)
  function bosalt(game,i){
    const v=game.board[i],o={x:i%N,y:(i/N)|0,good:v,wet:false,mult:1};
    if(v==='#e'){o.good=null;o.eski=true;}
    else if(v==='#k'){o.good=game.lock[i]||null;o.kilit=true;delete game.lock[i];game.kilitKirik++;}
    game.board[i]=null;return o;
  }

  // kurtarma (yükleme kaybından sonra; reklam, altın ya da jetonla). Sefer kaldığı yerden sürer.
  // en dolu iki sırayı (satır ya da sütun) boşaltır; boşaltılan hücreler yüke sayılmaz
  function clearTwoLines(game){
    const L=[];
    for(let i=0;i<N;i++){let r=0,c=0;for(let k=0;k<N;k++){if(game.board[idx(k,i)]!==null)r++;if(game.board[idx(i,k)]!==null)c++;}
      L.push({kind:'row',i,n:r});L.push({kind:'col',i,n:c});}
    L.sort((a,b)=>b.n-a.n||(a.kind===b.kind?a.i-b.i:a.kind==='row'?-1:1));
    const out=[],seen=new Set();
    for(const l of L.slice(0,2))for(let k=0;k<N;k++){
      const i=l.kind==='row'?idx(k,l.i):idx(l.i,k);
      if(seen.has(i))continue;seen.add(i);
      if(game.board[i]!==null)out.push(bosalt(game,i));
    }
    if(!anyTrayFits(game)){game.tray=[null,null,null];refillTray(game);}
    return out;
  }
  // "Rüzgâr döndü" sonrası: +k hamle
  function addMoves(game,k){
    if(game.over!=='lose'||game.loseReason!=='moves')return null;
    game.movesLeft+=Math.max(1,k|0);game.over=null;game.loseReason=null;
    refillTray(game);
    const cleared=anyTrayFits(game)?[]:clearTwoLines(game);
    return{cleared};
  }
  // "Ambar tıkandı" sonrası: yer aç
  function freeSpace(game){
    if(game.over!=='lose'||game.loseReason!=='full')return null;
    game.over=null;game.loseReason=null;
    return{cleared:clearTwoLines(game)};
  }

  // derece: 4'ten fazla ıslanan hücre Dağınık; değilse saf sıra eşiği Usta. Çarpan satışta uygulanır.
  const TIER_MULT={usta:1.3,duzgun:1.0,daginik:0.8};
  function grade(game){
    const tier=game.wet>WET_MAX?'daginik':game.pure>=game.P.ustaT?'usta':'duzgun';
    return{tier,mult:TIER_MULT[tier]};
  }

  return{N,YARDIM,VARS,yardimDuzeyi,DALGA,dalga,DENEME_HAMLE,denemeHamle,_refill:g=>{g.tray=[null,null,null];refillTray(g);},GOOD_KEYS,CARGO_KEYS,KOSUL,KOSUL_IDS,KOSUL_SIRA,KOSUL_PARAM,kosulId,kosulInfo,kosulIlk,kosulSonuc,SHAPES,PURE_MIN,PURE_MIN2,WET_MAX,EARLY_MAX,TIER_MULT,rng,norm,rot,levelParams,newGame,canPlace,fitsAnywhere,anyTrayFits,lineMajor,evaluate,placePiece,cargoCount,grade,addMoves,freeSpace};
})();
/*SEFER-LOGIC-END*/

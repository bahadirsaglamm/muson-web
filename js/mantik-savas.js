// js/mantik-savas.js — Korsan savaşı (üçlü eşleştirme) mantığı, DOM'suz. Tanımlar: SAVAS · Kullanır: yok
"use strict";
/*SAVAS-LOGIC-START*/
const SAVAS=(()=>{
  "use strict";
  const N=7;
  const KEYS=['gulle','tahta','altin','barut','yelken'];
  const GULLE=0,TAHTA=1,ALTIN=2,BARUT=3,YELKEN=4;
  const BROAD_MAX=10,BROAD_DMG=8,EVADE_MAX=6,GOLD_PER=5,MOVE_BONUS=10;

  // [korsan canı, saldırı gücü, kaç hamlede bir saldırı, hamle bütçesi, kendi gövden] (savas.html'den)
  const LEVELS=[null,
    [18,2,4,16,30],
    [22,2,4,16,30],
    [28,3,3,17,24],
    [48,5,2,17,20],
    [54,5,2,18,20],
    [58,6,2,19,22],
    [62,6,2,20,22],
    [68,7,2,21,24],
    [76,7,2,22,24],
    [80,8,2,23,26]
  ];
  function levelParams(n){
    n=Math.max(1,n|0);
    const last=LEVELS.length-1;
    let L=LEVELS[Math.min(n,last)].slice();
    if(n>last){const k=n-last;L=[L[0]+6*k,L[1]+Math.floor(k/2),L[2],L[3]+Math.floor(k/2),L[4]];}
    return{n,hp:L[0],atk:L[1],every:L[2],moves:L[3],hull:L[4]};
  }

  function step32(a){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return[a,((t^t>>>14)>>>0)/4294967296];}
  function rand(g){const r=step32(g.rs);g.rs=r[0];return r[1];}
  function makeRng(seed){let s=seed|0;return function(){const r=step32(s);s=r[0];return r[1];};}

  const idx=(x,y)=>y*N+x;
  const inB=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
  function tile(g,t,s){return{t,s:s||0,id:g.nextId++};}
  function snap(board){return board.map(c=>c&&{t:c.t,s:c.s,id:c.id});}

  function matchAt(board,x,y){
    const c=board[idx(x,y)];if(!c)return false;const t=c.t;
    let h=1;for(let i=x-1;i>=0&&board[idx(i,y)]&&board[idx(i,y)].t===t;i--)h++;for(let i=x+1;i<N&&board[idx(i,y)]&&board[idx(i,y)].t===t;i++)h++;
    if(h>=3)return true;
    let v=1;for(let j=y-1;j>=0&&board[idx(x,j)]&&board[idx(x,j)].t===t;j--)v++;for(let j=y+1;j<N&&board[idx(x,j)]&&board[idx(x,j)].t===t;j++)v++;
    return v>=3;
  }
  function findRuns(board){
    const runs=[];
    for(let y=0;y<N;y++){let x=0;while(x<N){const c=board[idx(x,y)];let e=x+1;
      if(c)while(e<N&&board[idx(e,y)]&&board[idx(e,y)].t===c.t)e++;
      if(c&&e-x>=3){const cells=[];for(let i=x;i<e;i++)cells.push(idx(i,y));runs.push({dir:'h',t:c.t,cells});}
      x=e;}}
    for(let x=0;x<N;x++){let y=0;while(y<N){const c=board[idx(x,y)];let e=y+1;
      if(c)while(e<N&&board[idx(x,e)]&&board[idx(x,e)].t===c.t)e++;
      if(c&&e-y>=3){const cells=[];for(let j=y;j<e;j++)cells.push(idx(x,j));runs.push({dir:'v',t:c.t,cells});}
      y=e;}}
    return runs;
  }
  function groupRuns(runs){
    const comps=[];
    for(const r of runs){
      const hit=comps.filter(c=>c.t===r.t&&r.cells.some(i=>c.cells.has(i)));
      let C;
      if(!hit.length){C={t:r.t,cells:new Set(),runs:[]};comps.push(C);}
      else{C=hit[0];for(const o of hit.slice(1)){o.cells.forEach(i=>C.cells.add(i));C.runs.push(...o.runs);comps.splice(comps.indexOf(o),1);}}
      r.cells.forEach(i=>C.cells.add(i));C.runs.push(r);
    }
    for(const C of comps){
      const hasH=C.runs.some(r=>r.dir==='h'),hasV=C.runs.some(r=>r.dir==='v');
      const longest=C.runs.reduce((a,r)=>r.cells.length>a.cells.length?r:a,C.runs[0]);
      C.kind=0;C.cross=null;
      if(longest.cells.length>=5||(hasH&&hasV)){C.kind='bomb';
        if(hasH&&hasV){const hs=new Set();C.runs.filter(r=>r.dir==='h').forEach(r=>r.cells.forEach(i=>hs.add(i)));
          C.cross=C.runs.filter(r=>r.dir==='v').flatMap(r=>r.cells).find(i=>hs.has(i));}}
      else if(longest.cells.length===4)C.kind=longest.dir==='h'?'row':'col';
      C.longest=longest;
    }
    return comps;
  }
  function area(i,s){
    const x=i%N,y=(i/N)|0,out=[];
    if(s==='row')for(let k=0;k<N;k++)out.push(idx(k,y));
    else if(s==='col')for(let k=0;k<N;k++)out.push(idx(x,k));
    else if(s==='bomb')for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inB(x+dx,y+dy))out.push(idx(x+dx,y+dy));
    return out;
  }
  function computeClear(board,prefer,forced){
    const comps=groupRuns(findRuns(board));
    if(!comps.length&&!forced.length)return null;
    const clear=new Set(),created=[];
    for(const C of comps){
      C.cells.forEach(i=>clear.add(i));
      if(C.kind){
        let pos=prefer.find(i=>C.cells.has(i));
        if(pos==null)pos=C.cross!=null?C.cross:C.longest.cells[Math.floor((C.longest.cells.length-1)/2)];
        created.push({i:pos,t:C.t,s:C.kind});
      }
    }
    const queue=forced.slice(),triggered=[],done=new Set();
    clear.forEach(i=>{if(board[i]&&board[i].s)queue.push(i);});
    forced.forEach(i=>clear.add(i));
    while(queue.length){
      const i=queue.shift();if(done.has(i))continue;const c=board[i];if(!c||!c.s)continue;
      done.add(i);triggered.push({i,s:c.s});clear.add(i);
      for(const j of area(i,c.s))if(!clear.has(j)){clear.add(j);if(board[j]&&board[j].s)queue.push(j);}
        else if(board[j]&&board[j].s&&!done.has(j))queue.push(j);
    }
    const counts=[0,0,0,0,0];clear.forEach(i=>{if(board[i])counts[board[i].t]++;});
    return{clear,created,triggered,counts};
  }
  function effects(counts,mult){
    const r=k=>Math.round(counts[k]*mult);
    return{dmg:r(GULLE),heal:r(TAHTA),gold:r(ALTIN)*GOLD_PER,barut:r(BARUT),yelken:r(YELKEN)};
  }
  // Toplar geliştirmesi: gülle hasarı +%dmgPct. Hasar önce eskisi gibi yuvarlanır (round(gülle × kombo)),
  // ek hasar = taban × yüzde / 100; küsurat (yüzde birim, tam sayı) birikir ve tam sayıya ulaşınca eklenir.
  // Böylece +%10 küçük eşleşmelerde de kaybolmaz; dmgPct 0 iken hasar ve rastgelelik öncekiyle aynı.
  function bonusDmg(g,base,commit){
    if(!g.dmgPct||base<=0)return 0;
    const raw=base*g.dmgPct+(g.dmgCarry|0),ek=Math.floor(raw/100);
    if(commit)g.dmgCarry=raw-ek*100;
    return ek;
  }
  function resolveStep(g,prefer,forced,k){
    const cc=computeClear(g.board,prefer,forced);if(!cc)return null;
    const pre=snap(g.board),createdSet=new Map(cc.created.map(c=>[c.i,c]));
    const mult=1+0.5*k,fx=effects(cc.counts,mult);
    fx.dmgBonus=bonusDmg(g,fx.dmg,true);fx.dmg+=fx.dmgBonus;
    cc.clear.forEach(i=>{g.board[i]=null;});
    cc.created.forEach(c=>{g.board[c.i]=tile(g,c.t,c.s);});
    const fall=new Array(N*N).fill(0);
    for(let x=0;x<N;x++){
      const col=[];for(let y=N-1;y>=0;y--){const c=g.board[idx(x,y)];if(c)col.push({c,y});}
      let y=N-1;for(const o of col){g.board[idx(x,y)]=o.c;fall[idx(x,y)]=o.y;y--;}
      const miss=y+1;
      for(let j=y;j>=0;j--){g.board[idx(x,j)]=tile(g,Math.floor(rand(g)*5));fall[idx(x,j)]=j-miss;}
    }
    g.pirateHp=Math.max(0,g.pirateHp-fx.dmg);
    g.hull=Math.min(g.hullMax,g.hull+fx.heal);
    g.loot+=fx.gold;
    g.broad=Math.min(BROAD_MAX,g.broad+fx.barut);
    g.evade=Math.min(EVADE_MAX,g.evade+fx.yelken);
    const xy=i=>({x:i%N,y:(i/N)|0});
    return{k,mult,fx,counts:cc.counts,pre,board:snap(g.board),fall,
      cleared:[...cc.clear].filter(i=>!createdSet.has(i)).map(i=>Object.assign(xy(i),{t:pre[i].t,s:pre[i].s})),
      created:cc.created.map(c=>Object.assign(xy(c.i),{t:c.t,s:c.s})),
      triggered:cc.triggered.map(c=>Object.assign(xy(c.i),{s:c.s}))};
  }

  function hasValidMove(g){return validMoves(g,true).length>0;}
  function validMoves(g,first){
    const b=g.board,out=[];
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)for(const[dx,dy]of[[1,0],[0,1]]){
      const X=x+dx,Y=y+dy;if(!inB(X,Y))continue;
      const i=idx(x,y),j=idx(X,Y);let ok=false;
      if(b[i].s||b[j].s)ok=true;
      else if(b[i].t!==b[j].t){const t=b[i];b[i]=b[j];b[j]=t;ok=matchAt(b,x,y)||matchAt(b,X,Y);b[j]=b[i];b[i]=t;}
      if(ok){out.push([x,y,X,Y]);if(first)return out;}
    }
    return out;
  }
  function fillFresh(g){
    for(let tries=0;tries<200;tries++){
      g.board=new Array(N*N).fill(null);
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){
        const bad=new Set();
        if(x>=2&&g.board[idx(x-1,y)].t===g.board[idx(x-2,y)].t)bad.add(g.board[idx(x-1,y)].t);
        if(y>=2&&g.board[idx(x,y-1)].t===g.board[idx(x,y-2)].t)bad.add(g.board[idx(x,y-1)].t);
        const opts=[0,1,2,3,4].filter(t=>!bad.has(t));
        g.board[idx(x,y)]=tile(g,opts[Math.floor(rand(g)*opts.length)]);
      }
      if(hasValidMove(g))return;
    }
  }
  function shuffle(g){
    for(let tries=0;tries<100;tries++){
      const tiles=g.board.slice();
      for(let i=tiles.length-1;i>0;i--){const j=Math.floor(rand(g)*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
      g.board=tiles;
      if(!findRuns(g.board).length&&hasValidMove(g))return;
    }
    fillFresh(g);
  }

  // opts: {hullBonus (gemi gövdesi), fireBonus (Dökümhane), dmgPct (gemi topları: gülle hasarı +%)}
  function newGame(n,seed,opts){
    const P=levelParams(n),o=opts||{},hb=Math.max(0,o.hullBonus|0),fb=Math.max(0,o.fireBonus|0),dp=Math.max(0,o.dmgPct|0);
    const g={n:P.n,P,rs:(seed==null?n*7919:seed)|0,nextId:1,board:null,
      pirateHp:P.hp,pirateMax:P.hp,hull:P.hull+hb,hullMax:P.hull+hb,hullBonus:hb,fireDmg:BROAD_DMG+fb,fireBonus:fb,dmgPct:dp,dmgCarry:0,
      movesLeft:P.moves,moves:0,cd:P.every,
      broad:0,evade:0,loot:0,over:null,loseReason:null,bonus:0,reward:0,dodges:0,hits:0};
    fillFresh(g);
    return g;
  }
  function finishWin(g){g.over='win';g.bonus=g.movesLeft*MOVE_BONUS;g.reward=g.loot+g.bonus;}

  function swap(g,x1,y1,x2,y2){
    if(g.over||!inB(x1,y1)||!inB(x2,y2)||Math.abs(x1-x2)+Math.abs(y1-y2)!==1)return{ok:false,reason:'bad'};
    const i=idx(x1,y1),j=idx(x2,y2),a=g.board[i],b=g.board[j];
    g.board[i]=b;g.board[j]=a;
    const forced=[];if(a.s)forced.push(j);if(b.s)forced.push(i);
    if(!forced.length&&!matchAt(g.board,x1,y1)&&!matchAt(g.board,x2,y2)){g.board[i]=a;g.board[j]=b;return{ok:false,reason:'nomatch'};}
    const steps=[];let st=resolveStep(g,[j,i],forced,0);
    while(st){steps.push(st);if(steps.length>40)break;st=resolveStep(g,[],[],steps.length);}
    g.moves++;g.movesLeft--;
    let attack=null,shuffled=false;
    if(g.pirateHp<=0)finishWin(g);
    else{
      g.cd--;
      if(g.cd<=0){
        g.cd=g.P.every;
        if(g.evade>=EVADE_MAX){g.evade=0;g.dodges++;attack={dodged:true,dmg:0};}
        else{g.hull=Math.max(0,g.hull-g.P.atk);g.hits++;attack={dodged:false,dmg:g.P.atk};}
      }
      if(g.hull<=0){g.over='lose';g.loseReason='hull';}
      else if(g.movesLeft<=0){g.over='lose';g.loseReason='moves';}
      else if(!hasValidMove(g)){shuffle(g);shuffled=true;}
    }
    return{ok:true,steps,attack,shuffled,over:g.over,loseReason:g.loseReason};
  }
  function fire(g){
    if(g.over||g.broad<BROAD_MAX)return null;
    const D=g.fireDmg||BROAD_DMG;
    g.broad=0;const dmg=Math.min(D,g.pirateHp);g.pirateHp=Math.max(0,g.pirateHp-D);
    if(g.pirateHp<=0)finishWin(g);
    return{dmg,over:g.over};
  }
  function preview(g,x1,y1,x2,y2){
    const b=g.board.slice(),i=idx(x1,y1),j=idx(x2,y2),a=b[i],c=b[j];b[i]=c;b[j]=a;
    const forced=[];if(a.s)forced.push(j);if(c.s)forced.push(i);
    const cc=computeClear(b,[j,i],forced);if(!cc)return null;
    const fx=effects(cc.counts,1);fx.dmg+=bonusDmg(g,fx.dmg,false);
    return{counts:cc.counts,fx,cleared:cc.clear.size,created:cc.created.map(c=>c.s),triggered:cc.triggered.length};
  }

  return{N,KEYS,BROAD_MAX,BROAD_DMG,EVADE_MAX,GOLD_PER,MOVE_BONUS,LEVELS,levelParams,makeRng,newGame,swap,fire,validMoves,preview,shuffle,findRuns,matchAt,snap};
})();
/*SAVAS-LOGIC-END*/

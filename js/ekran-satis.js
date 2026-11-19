// js/ekran-satis.js — Varış: satış ekranı (SatisUI); rota koşulu primleri ayrı satırlarda. Tanımlar: SatisUI · Kullanır: t, pct, kosulAd, OYUN, CESIT, S, $, fmt, GOODS, pctf, TIER_NAME, save, screen, RM, malPic, SES, vib, initAudio, flyTo, go
"use strict";
/* ================= varış: satış ekranı ================= */
const SatisUI=(()=>{
  let sold=null,shownGold=0,anim=0;
  function canShow(){return !!(sold||(S.trip&&S.trip.phase==='satis'));}
  function reset(){sold=null;}
  function qtyCell(r){
    const q=[];q.push(r.n);
    if(r.q2)q.push('★'+r.q2);if(r.q3)q.push('★★'+r.q3);if(r.wet)q.push((r.g==='porselen'?'💔':'💦')+r.wet);
    return `<span class="q">${q.join(' · ')}</span>`;
  }
  const ROW_GAP=140;
  function show(fresh){
    const q=sold?sold.quote:OYUN.saleQuote(S.trip,S.port),tr=sold?sold.trip:S.trip;
    $('t-title').textContent=q.city;
    shownGold=sold?shownGold:S.gold;
    $('t-gold').textContent=t('ui.gold',{n:fmt(shownGold)});
    const porselen=q.rows.some(r=>r.g==='porselen');
    $('t-tip').innerHTML=t('sale.tip',{city:q.city,e:GOODS[q.pricey].e,good:GOODS[q.pricey].n,extra:porselen?t('sale.tipPorcelain'):''});
    const rows=q.rows.map((r,i)=>`<tr class="${r.hot?'hot ':''}${sold?(fresh?'sold':''):'pre'}"${sold&&fresh?` style="--d:${i*ROW_GAP}ms"`:''} data-row="${i}"><td>${CESIT.malHtml(r.g)}${GOODS[r.g].n}</td><td>${qtyCell(r)}</td><td>${pctf(r.unit)}${r.hot?' <small>×'+pctf(1.5)+'</small>':''}${r.g==='porselen'?' <small>×2</small>':''}</td><td><b>${fmt(r.total)}</b></td></tr>`).join('');
    const li=[`<li><span>${t('sale.subtotal')}</span><b>${fmt(q.sub)}</b></li>`,
      `<li><span>${t('sale.grade',{g:TIER_NAME[q.tier]})}</span><b>× ${pctf(q.gradeMult)}</b></li>`,
      `<li><span>${t('sale.early')}</span><b>${pct(q.early)}</b></li>`];
    // rota koşulu: prim ya da sonuç ayrı satırda
    const K=q.kosul;
    if(K){
      const pr=pct(K.prim*100);
      if(K.id==='acele')li.push(`<li class="k-ok"><span>⏱ ${t('sale.k.acele')}</span><b>${pr}</b></li>`);
      else if(K.id==='ozel')li.push(K.ok?`<li class="k-ok"><span>⭐ ${t('sale.k.ozelOk')}</span><b>${pr}</b></li>`:`<li class="k-yok"><span>⭐ ${t('sale.k.ozelFail')}</span><b>—</b></li>`);
      else if(K.id==='buyuk')li.push(`<li class="k-ok"><span>⚓ ${t('sale.k.buyuk')}</span><b>${pr}</b></li>`);
      else if(K.id==='eski')li.push(`<li class="k-ok"><span>📦 ${t('sale.k.eski')}</span><b>${pr}</b></li>`);
      else if(K.id==='porselen')li.push(`<li class="${K.kirik?'warn':'k-ok'}"><span>🏺 ${t('sale.k.broken',{n:K.kirik})}</span><b>${K.kirik?t('sale.unsellable'):t('sale.allSafe')}</b></li>`);
      else if(K.prim)li.push(`<li class="k-ok"><span>${K.e} ${t('sale.k.bonus',{name:kosulAd(K.id)})}</span><b>${pr}</b></li>`);
    }
    if(q.pazar)li.push(`<li><span>${t('sale.market')}</span><b>${pct(q.pazar*100)}</b></li>`);
    if(q.reklam)li.push(`<li><span>${t('sale.reward')}</span><b>${pct(q.reklam*100)}</b></li>`); // yalnız eski kayıtlarda (teklif kaldırıldı)
    if(tr.oto)li.push(`<li><span>${t('sale.autoDef')}</span><b>${t('sale.cargoSafe')}</b></li>`);
    if(tr.kurtar)li.push(`<li><span>${t('sale.rescued')}</span><b>${t('sale.noLoot')}</b></li>`);
    if(tr.plundered&&tr.lost){
      const lost=Object.keys(tr.lost).map(g=>{const L=tr.lost[g],k=L.n+L.q2+L.q3;return k?GOODS[g].n+' −'+k:'';}).filter(Boolean).join(', ');
      li.push(`<li class="warn"><span>${t('sale.plunder')}</span><b>${lost||'—'}</b></li>`);
    }
    if(tr.loot)li.push(`<li><span>${t('sale.loot')}</span><b>+${fmt(tr.loot)}${tr.lootPaid?' '+t('sale.inChest'):''}</b></li>`);
    $('t-body').innerHTML=`<div class="box"><table class="stab"><tr><th>${t('sale.col.good')}</th><th>${t('sale.col.qty')}</th><th>${t('sale.col.price')}</th><th>${t('sale.col.total')}</th></tr>${rows||`<tr><td colspan="4">${t('sale.empty')}</td></tr>`}</table></div>
      <div class="box"><ul class="mlist">${li.join('')}</ul>
      <div class="stotal"><small>${sold?(sold.trip.replay?t('sale.addedReplay'):t('sale.added')):t('sale.total')}</small><span id="t-total">${sold?t('ui.goldPlus',{n:sold.add}):t('ui.gold',{n:q.total})}</span></div></div>`;
    const b=$('t-sell');
    if(sold){b.textContent=t('ui.toMap');b.className='big';}
    else{b.textContent=t('sale.sell',{gold:q.total});b.className='primary big';}
  }
  function sell(){
    if(sold||!S.trip||S.trip.phase!=='satis')return null;
    const trip=JSON.parse(JSON.stringify(S.trip)),from=S.gold;
    const res=OYUN.sell(S);if(!res)return null;
    save();
    // ortak olay: satış tamamlandı (şirket kasabası gibi modüller dinler). detail: {trip, res, kazanc}
    try{document.dispatchEvent(new CustomEvent('muson:satis',{detail:{trip,res,kazanc:S.gold-from}}));}catch(_){}
    sold=Object.assign({trip},res);shownGold=from;
    show(true);
    SES.cal('satis',{sabit:true});vib([15,30,15]);
    coins(res.quote.rows.length);
    countUp(from,S.gold,res.quote.rows.length*ROW_GAP);
    return res;
  }
  // satırlardan kasaya uçan altınlar
  function coins(n){
    const goldEl=$('t-goldw');if(!goldEl||typeof document.querySelector!=='function')return;
    for(let i=0;i<n;i++){
      const tr=document.querySelector('#t-body tr[data-row="'+i+'"]');if(!tr||!tr.getBoundingClientRect)continue;
      const r=tr.getBoundingClientRect();
      for(let k=0;k<2;k++)flyTo('altin','🪙',r.right-30-k*14,r.top+r.height/2,goldEl,{delay:i*ROW_GAP+180+k*90,dur:700,s0:.9,s1:.6,lift:40,dx:18,bump:k===1&&i===n-1});
    }
  }
  // kasa sayacı yükselerek artar (~1,2 sn), artarken altın şıngırtısı
  function countUp(a,b,lead){
    const my=++anim,D=1200,t1=performance.now()+(RM?0:Math.min(500,lead||0));let lastTick=0;
    const stepF=()=>{
      if(my!==anim)return;
      const now=performance.now(),k=Math.max(0,Math.min(1,(now-t1)/D));shownGold=a+(b-a)*(1-Math.pow(1-k,3));
      $('t-gold').textContent=t('ui.gold',{n:fmt(shownGold)});
      if(k>0&&k<1&&b>a&&now-lastTick>190){lastTick=now;SES.cal('altin',{vol:.45});}
      if(k<1)requestAnimationFrame(stepF);else shownGold=b;};
    requestAnimationFrame(stepF);
  }
  $('t-sell').onclick=()=>{initAudio();if(sold){SES.cal('dugme');sold=null;go('map');}else sell();};
  return{show,sell,reset,canShow,get sold(){return sold;}};
})();

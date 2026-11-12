(() => {
 "use strict";
 const MAIN="https://mmp-coin-ai-analyzer.mehrdadmohammadi1988.workers.dev";
 const RADAR="https://mmp-coin-ai-radar.mehrdadmohammadi1988.workers.dev";
 const $=id=>document.getElementById(id);
 const engines=[
  ["01","Market Intelligence","هوشمندی کلی بازار"],["02","Explosive Move Prediction","پیش‌بینی فشار حرکت"],["03","Early Opportunity Hunter","کشف زودهنگام فرصت"],["04","Smart Money Flow","جریان پول هوشمند"],["05","Liquidity Hunter","شکار نواحی نقدینگی"],["06","Multi-timeframe Alignment","هم‌جهتی تایم‌فریم‌ها"],["07","Volatility Intelligence","هوشمندی نوسان"],["08","Market Sentiment","احساسات بازار"],["09","Scenario Simulator","شبیه‌ساز سناریو"],["10","Adaptive Learning","یادگیری تطبیقی"],["11","Structure Intelligence","تحلیل ساختار قیمت"],["12","Risk Intelligence","ارزیابی ریسک"]
 ];
 $("engineGrid").innerHTML=engines.map(([n,name,fa])=>'<article class="engine-item"><span class="engine-number">'+n+'</span><span><b>'+name+'</b><small>'+fa+'</small><small class="engine-status">اتصال مستقل: تأیید نشده</small></span></article>').join("");
 async function get(url,timeout=9000){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  try{const response=await fetch(url,{signal:controller.signal,cache:"no-store",headers:{Accept:"application/json"}});if(!response.ok)throw new Error("HTTP "+response.status);return await response.json();}
  finally{clearTimeout(timer);}
 }
 function money(v){const n=Number(v);return Number.isFinite(n)&&n>0?n.toLocaleString("en-US",{maximumFractionDigits:n>100?2:4}):"—";}
 function toman(v){return Number(v)>0?Math.round(Number(v)).toLocaleString("en-US")+" تومان":"—";}
 let goldPrice=0,goldProvider="Gold-API";
 function paintCard(id,main,other,source){$(id+"-price").textContent=main;$(id+"-counterpart").textContent=other;$(id+"-source").textContent="منبع: "+source;}
 function renderMarketCards(){
  const btc=Number(tickerQuotes.BTCUSDT?.price),eth=Number(tickerQuotes.ETHUSDT?.price);
  const primary=p=>currentCurrency==="IRT"?(tetherRate>0?toman(p*tetherRate):"نرخ تتر ناموجود"):money(p)+" USDT";
  const secondary=p=>currentCurrency==="IRT"?"معادل: "+money(p)+" USDT":(tetherRate>0?"معادل: "+toman(p*tetherRate):"معادل تومانی ناموجود");
  paintCard("btc",btc>0?primary(btc):"داده در دسترس نیست",btc>0?secondary(btc):"قیمت دریافت نشد",tickerQuotes.BTCUSDT?.provider||"نامشخص");
  paintCard("eth",eth>0?primary(eth):"داده در دسترس نیست",eth>0?secondary(eth):"قیمت دریافت نشد",tickerQuotes.ETHUSDT?.provider||"نامشخص");
  paintCard("usdt",tetherRate>0?(currentCurrency==="IRT"?toman(tetherRate):"1.00 USDT"):"نرخ دریافت نشد",tetherRate>0?(currentCurrency==="IRT"?"معادل: 1.00 USDT":"معادل: "+toman(tetherRate)):"قیمت معتبر در دسترس نیست","Nobitex");
  paintCard("gold",goldPrice>0?(currentCurrency==="IRT"?(tetherRate>0?toman(goldPrice*tetherRate):"نرخ تتر ناموجود"):"$"+money(goldPrice)):"داده در دسترس نیست",goldPrice>0?(currentCurrency==="IRT"?"معادل: $"+money(goldPrice):(tetherRate>0?"معادل: "+toman(goldPrice*tetherRate):"معادل تومانی ناموجود")):"قیمت دریافت نشد",goldProvider);
 }
 let currentCurrency="USDT",tetherRate=0,tickerQuotes={};
 try{const saved=localStorage.getItem("mmp_v4_currency");if(saved==="IRT"||saved==="USDT")currentCurrency=saved;}catch(e){}
 function renderTicker(){renderMarketCards();document.querySelectorAll("[data-currency]").forEach(button=>{const active=button.dataset.currency===currentCurrency;button.classList.toggle("active",active);button.setAttribute("aria-pressed",active?"true":"false");});}
 function setCurrency(value){
  currentCurrency=value==="IRT"?"IRT":"USDT";
  try{localStorage.setItem("mmp_v4_currency",currentCurrency);}catch(e){}
  renderTicker();
 }
 async function loadTetherRate(){
  try{
   const d=await get(MAIN+"/market-proxy?source=nobitex-tether",8000);
   const p=Number(d?.stats?.["usdt-rls"]?.latest)/10;
   if(!(p>=1000&&p<=100000000))throw new Error("Nobitex rate invalid");
   tetherRate=p;try{localStorage.setItem("mmp_v4_nobitex_rate",JSON.stringify({price:p,updatedAt:Date.now()}));}catch(e){}
   renderTicker();return true;
  }catch(e){
   try{const saved=JSON.parse(localStorage.getItem("mmp_v4_nobitex_rate")||"null");if(Number(saved?.price)>=1000&&Date.now()-Number(saved.updatedAt)<15*60*1000){tetherRate=Number(saved.price);renderTicker();return false;}}catch(_){}
   tetherRate=0;console.warn("Nobitex tether rate unavailable",e);renderTicker();return false;
  }
 }
 async function loadTicker(){
  const symbols=["BTCUSDT","ETHUSDT"],sources=["binance-tickers","okx-tickers","bybit-tickers","gate-tickers","kucoin-tickers","bitget-tickers","mexc-tickers"];
  const normalize=(source,data)=>{let rows=[];if(["binance-tickers","gate-tickers","mexc-tickers"].includes(source))rows=Array.isArray(data)?data.map(x=>[x.symbol||x.currency_pair,x.lastPrice||x.last||x.close]):[];else if(source==="okx-tickers")rows=(data.data||[]).map(x=>[x.instId,x.last]);else if(source==="bybit-tickers")rows=(data.result?.list||[]).map(x=>[x.symbol,x.lastPrice]);else if(source==="kucoin-tickers")rows=(data.data?.ticker||[]).map(x=>[x.symbol,x.last]);else if(source==="bitget-tickers")rows=(data.data||[]).map(x=>[x.symbol,x.lastPr||x.last]);return rows.map(([s,p])=>[String(s||"").toUpperCase().replace(/[-_/]/g,""),Number(p)]);};
  const prices={},providers={};
  for(const batch of [sources.slice(0,3),sources.slice(3)]){const missing=symbols.filter(s=>!(prices[s]>0));if(!missing.length)break;const results=await Promise.allSettled(batch.map(async source=>({source,data:await get(MAIN+"/market-proxy?source="+source)})));for(const r of results){if(r.status!=="fulfilled")continue;for(const [s,p] of normalize(r.value.source,r.value.data)){if(missing.includes(s)&&!(prices[s]>0)&&p>0){prices[s]=p;providers[s]=r.value.source.replace("-tickers","").toUpperCase();}}}}
  tickerQuotes={BTCUSDT:{price:prices.BTCUSDT,provider:providers.BTCUSDT},ETHUSDT:{price:prices.ETHUSDT,provider:providers.ETHUSDT}};renderTicker();return Object.values(tickerQuotes).filter(x=>Number(x.price)>0).length;
 }
 async function loadGold(){
  try{const d=await get("https://api.gold-api.com/price/XAU",7000),p=Number(d?.price);if(!(p>0))throw new Error("invalid XAU");goldPrice=p;goldProvider="Gold-API";try{localStorage.setItem("mmp_v4_gold_quote",JSON.stringify({price:p,updatedAt:Date.now()}));}catch(_){}}
  catch(e){try{const s=JSON.parse(localStorage.getItem("mmp_v4_gold_quote")||"null");if(Number(s?.price)>0&&Date.now()-Number(s.updatedAt)<1800000){goldPrice=Number(s.price);goldProvider="Gold-API · آخرین نرخ ذخیره‌شده";}}catch(_){}}
  renderTicker();return goldPrice>0;
 }
 function empty(el,title,detail){el.innerHTML='<div class="empty-state"><b>'+title+'</b><small>'+detail+'</small></div>';}
 function renderSignals(el,signals){
  if(!Array.isArray(signals)||!signals.length){empty(el,"در حال حاضر سیگنال داده دریافتی‌ای وجود ندارد","رادار فقط فرصت‌های واقعی و دریافت‌شده از موتور را نشان می‌دهد.");return;}
  el.innerHTML=signals.slice(0,30).map(x=>{
   const symbol=String(x.symbol||x.asset||x.pair||"نامشخص").replace(/[<>]/g,"");
   const score=Number(x.score??x.quantum?.score);
   const change=Number(x.change24h??x.price_change_percentage_24h);
   const exchange=String(x.exchange||x.provider||x.source||"منبع نامشخص").replace(/[<>]/g,"");
   return '<div class="signal-row"><span><b>'+symbol+'</b><br><small>'+exchange+(Number.isFinite(change)?' · '+change.toFixed(2)+'%':'')+'</small></span><span class="signal-score">'+(Number.isFinite(score)?Math.round(score)+'/100':'داده دریافتی')+'</span><small>داده دریافتی</small></div>';
  }).join("");
 }
 async function loadRadar(){
  const el=$("radarList");$("radarMeta").textContent="در حال دریافت…";
  try{
   const d=await get(RADAR+"/fast-radar-snapshot");
   const signals=d.signals||d.snapshot?.signals||[];
   $("radarMeta").textContent=(d.scanned_at||d.updated_at||"وضعیت: "+(d.status||"نامشخص"));
   renderSignals(el,signals);
  }catch(e){$("radarMeta").textContent="اتصال ناموفق";el.innerHTML='<div class="signal-error">دریافت داده رادار ناموفق بود؛ لطفاً بعداً دوباره تلاش کنید.</div>';}
 }
 async function loadHunter(){
  $("spotMeta").textContent="در حال دریافت…";$("futuresMeta").textContent="در حال دریافت…";
  try{
   const d=await get(MAIN+"/hunter-combined-snapshot");
   const spot=d.spot?.snapshot||d.spot||{},futures=d.futures?.snapshot||d.futures||{};
   $("spotMeta").textContent=(spot.status||"نامشخص")+" · "+(spot.scanned_count??0)+" اسکن";
   $("futuresMeta").textContent=(futures.status||"نامشخص")+" · "+(futures.scanned_count??0)+" اسکن";
   renderSignals($("spotList"),spot.signals||[]);
   renderSignals($("futuresList"),futures.signals||[]);
  }catch(e){
   $("spotMeta").textContent="اتصال ناموفق";$("futuresMeta").textContent="اتصال ناموفق";
   $("spotList").innerHTML='<div class="signal-error">سرویس Spot پاسخ نداد.</div>';
   $("futuresList").innerHTML='<div class="signal-error">سرویس Futures پاسخ نداد.</div>';
  }
 }
 async function loadHealth(){
  try{
   const d=await get(MAIN+"/connections-health");
   const checks=Array.isArray(d.checks)?d.checks:[],up=checks.filter(x=>x.status==="ok"||x.status==="slow").length,total=checks.length;
   $("coreStatus").textContent=total?up+" از "+total+" اتصال سالم":"پاسخ ناقص";
   $("coreUpdated").textContent=d.checked_at?new Date(d.checked_at).toLocaleTimeString("fa-IR"):"—";
   const live=$("serviceStatus");
   if(live){live.textContent=total?up+"/"+total+" اتصال سالم":"پاسخ ناقص";live.classList.remove("pending","healthy","partial","down");live.classList.add(up===total&&total>0?"healthy":up>0?"partial":"down");}
  }catch(e){
   $("coreStatus").textContent="عدم دریافت پاسخ";$("coreUpdated").textContent="اتصال بررسی نشد";
   const live=$("serviceStatus");if(live){live.textContent="عدم دریافت پاسخ";live.classList.remove("pending","healthy","partial");live.classList.add("down");}
  }
 }
 async function refresh(which){
  if(which==="radar")return loadRadar();
  if(which==="hunter")return loadHunter();
  return Promise.allSettled([loadTicker(),loadTetherRate(),loadGold(),loadRadar(),loadHunter(),loadHealth()]);
 }
 document.querySelectorAll("[data-refresh]").forEach(b=>b.addEventListener("click",()=>refresh(b.dataset.refresh)));
 $("refreshAll").addEventListener("click",()=>refresh("all"));
 document.querySelectorAll("[data-currency]").forEach(button=>button.addEventListener("click",()=>setCurrency(button.dataset.currency)));
 $("menuToggle").addEventListener("click",()=>document.querySelector(".desktop-nav").classList.toggle("open"));
 document.querySelectorAll(".desktop-nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".desktop-nav").classList.remove("open")));
 setCurrency(currentCurrency);
 refresh("all");
 setInterval(()=>Promise.allSettled([loadTicker(),loadTetherRate(),loadGold(),loadRadar(),loadHunter(),loadHealth()]),60000);
})();
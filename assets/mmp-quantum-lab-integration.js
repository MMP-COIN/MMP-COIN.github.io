(function(){
"use strict";
function mount(){
 const hero=document.querySelector(".hero");
 if(!hero||document.getElementById("mmp-quantum-lab-launcher"))return;
 const style=document.createElement("style");
 style.id="mmp-quantum-lab-launcher-style";
 style.textContent="#mmp-quantum-lab-launcher{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:12px 0 18px;padding:16px 18px;border:1px solid #80683f;border-radius:16px;background:radial-gradient(ellipse at 8% 0%,#d9b66d20,transparent 45%),linear-gradient(120deg,#171b24,#101722 65%,#211b12);box-shadow:0 12px 35px #0006}#mmp-quantum-lab-launcher .mql-copy{min-width:0;flex:1}#mmp-quantum-lab-launcher b{display:block;color:#f5dda2;font-size:15px}#mmp-quantum-lab-launcher small{display:block;color:#aab4c3;font-size:11px;line-height:1.9;margin-top:5px}#mmp-quantum-lab-launcher a{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:9px 15px;border-radius:10px;background:linear-gradient(120deg,#a77c35,#e8cd8c);color:#17130a;text-decoration:none;font-weight:900;font-size:12px;white-space:nowrap}#mmp-quantum-lab-launcher .mql-mark{color:#d9b66d;font-size:22px;margin-left:8px}";
 document.head.appendChild(style);
 const card=document.createElement("section");card.id="mmp-quantum-lab-launcher";card.innerHTML='<div class="mql-copy"><b><span class="mql-mark">◈</span> آزمایشگاه کوانتومی MMP</b><small>۱۲ موتور تخصصی برای درک بازار، کشف فرصت زودهنگام، تحلیل جریان سفارش و ارزیابی سناریوها · اسکن کامل جفت‌های واجد شرایط USDT Spot</small></div><a href="/quantum-lab.html">ورود به آزمایشگاه ←</a>';
 hero.insertAdjacentElement("afterend",card);
 const menus=document.querySelectorAll(".native-app-menu,.dropdown-menu");
 menus.forEach(menu=>{if(menu.querySelector('a[href="/quantum-lab.html"]'))return;const a=document.createElement("a");a.href="/quantum-lab.html";a.textContent="◈ آزمایشگاه کوانتومی";menu.appendChild(a);});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
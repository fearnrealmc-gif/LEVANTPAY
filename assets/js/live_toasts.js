
(function(){
  const NAMES = ["أحمد","محمد","علي","عمر","خالد","حسام","نور","رامي","سامر","رنا","آية","لينا","ريهام","يزن","شهد","عليا","معتصم","جاد","وسيم","صفاء"];
  const SERVICES = {"sham":{label:"ShamCash",colorClass:"lev-sham",currency:"ل.س",min:50000,max:500000},"syriatel":{label:"Syriatel Cash",colorClass:"lev-syriatel",currency:"ل.س",min:50000,max:500000}};
  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function format(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "،"); }
  function ensureC(){ let c=document.querySelector(".lev-live-toasts"); if(!c){ c=document.createElement("div"); c.className="lev-live-toasts"; document.body.appendChild(c);} return c; }
  function makeToast(key){ const c=SERVICES[key]; const name=pick(NAMES); const amount=rand(c.min,c.max); const txt=`تم تحويل ${format(amount)} ${c.currency} الآن بواسطة ${name} عبر ${c.label}`; const sub=new Date().toLocaleTimeString("ar-SY",{hour:'2-digit',minute:'2-digit'}); const el=document.createElement("div"); el.className="lev-toast"; el.innerHTML=`<div class="lev-ic ${c.colorClass}">↗</div><div class="lev-txt"><div>${txt}</div><div class="lev-sub">${sub}</div></div>`; return el; }
  function showOnce(key,d){ const c=ensureC(); const t=makeToast(key); c.appendChild(t); setTimeout(()=>{ t.classList.add("hide"); setTimeout(()=>{ t.remove(); }, 380); }, d||10000); }
  function start(page){ let allowed=["sham","syriatel"]; if(page==="shamcash") allowed=["sham"]; if(page==="syriatel") allowed=["syriatel"]; function cycle(){ showOnce(pick(allowed), 10000); setTimeout(cycle, rand(9000,16000)); } setTimeout(cycle, rand(1200,3000)); }
  document.addEventListener("DOMContentLoaded", function(){ const p=location.pathname.toLowerCase().includes("shamcash")?"shamcash":(location.pathname.toLowerCase().includes("syriatel")?"syriatel":"index"); start(p); });
})();


(function(){
  function qs(s,root){ return (root||document).querySelector(s); }
  function fmt(n){ try{ return Number(n).toLocaleString('ar-SY'); }catch(_){ return n; } }
  function params(){ const p=new URLSearchParams(location.search); const o={}; for(const k of ["no","name","phone","amount","pp","svc","service"]){ const v=p.get(k); if(v) o[k==="service"?"svc":k]=v; } return o; }
  function loadLS(){ try{ const v=localStorage.getItem("levent_last_invoice"); return v?JSON.parse(v):{}; }catch(_){ return {}; } }
  function fill(o){ const map={"#invoiceNo":o.no,"#clientName":o.name,"#clientPhone":o.phone,"#invoiceAmount":o.amount,"#serviceName":o.svc||"ShamCash→PayPal","#paypalEmail":o.pp}; for(const sel in map){ const el=qs(sel); if(el && map[sel]!=null) el.textContent = sel==="#invoiceAmount"?fmt(map[sel]):map[sel]; } }
  function inject(o){ if(qs(".lev-inv-summary")) return; const host=qs(".wrap,.container,.invoice,.content,main,body")||document.body; const sec=document.createElement("section"); sec.className="lev-inv-summary"; sec.innerHTML=`<div class="lev-inv-box">
      <div class="lev-row"><span>رقم الفاتورة:</span><b>${o.no||"-"}</b></div>
      <div class="lev-row"><span>الاسم:</span><b>${o.name||"-"}</b></div>
      <div class="lev-row"><span>الهاتف:</span><b>${o.phone||"-"}</b></div>
      <div class="lev-row"><span>الخدمة:</span><b>${o.svc||"ShamCash→PayPal"}</b></div>
      <div class="lev-row"><span>المبلغ:</span><b>${o.amount?fmt(o.amount):"-"}</b></div>
      ${o.pp?`<div class="lev-row"><span>PayPal:</span><b>${o.pp}</b></div>`:""}
      <div class="lev-sub">المكان: LEVENT — سوريا، حمص • التاريخ: ${new Date().toLocaleString('ar-SY')}</div>
    </div>`; host.insertBefore(sec, host.firstChild); }
  document.addEventListener("DOMContentLoaded", function(){ const o=Object.assign(loadLS(), params()); fill(o); inject(o); });
})();

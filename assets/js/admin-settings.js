
;(() => {
  const KEY = { settings:'PX_SETTINGS', rates:'PX_GOV_RATES' };
  function getDefaults(){ return { fx: 10600, min: 10, ppp: 4.4, ppf: 0.5, site: 3 }; }
  function getSettings(){ const s = DB.get(KEY.settings, null); return s && typeof s==='object' ? s : getDefaults(); }
  function setSettings(s){ DB.set(KEY.settings, s); }
  function getRates(){
    let list = DB.get(KEY.rates, null);
    if (!Array.isArray(list) || !list.length){
      const fx = getSettings().fx;
      list = [
        {gov:'دمشق',rate:fx},{gov:'ريف دمشق',rate:fx},{gov:'حلب',rate:fx},{gov:'حمص',rate:fx},{gov:'حماة',rate:fx},
        {gov:'اللاذقية',rate:fx},{gov:'طرطوس',rate:fx},{gov:'إدلب',rate:fx},{gov:'درعا',rate:fx},{gov:'السويداء',rate:fx},
        {gov:'دير الزور',rate:fx},{gov:'الرقة',rate:fx},{gov:'الحسكة',rate:fx},{gov:'القنيطرة',rate:fx}
      ];
      DB.set(KEY.rates, list);
    }
    return list;
  }
  function setRates(list){ DB.set(KEY.rates, list); }
  const $ = (s)=>document.querySelector(s);
  function el(t, a={}, c=[]){ const e=document.createElement(t); Object.entries(a).forEach(([k,v])=>{
    if(k==='class') e.className=v; else if(k.startsWith('on')&&typeof v==='function') e.addEventListener(k.slice(2), v); else e.setAttribute(k,v);
  }); (c||[]).forEach(ch=>e.append(ch instanceof Node? ch : document.createTextNode(ch))); return e; }

  function fillSettingsForm(){
    const s = getSettings();
    ['fx','min','ppp','ppf','site'].forEach(name=>{
      const inp = document.querySelector(`[name="${name}"]`);
      if (inp){ inp.value = s[name]; }
    });
  }

  function renderRates(){
    const wrap = $('#ratesWrap'); if(!wrap) return;
    wrap.innerHTML='';
    const list = getRates();
    const table = el('table', {class:'min-w-full text-sm'});
    table.append(el('thead',{},[el('tr',{},[
      el('th',{class:'text-right p-2 border-b border-white/10'},['المحافظة']),
      el('th',{class:'text-right p-2 border-b border-white/10'},['سعر الصرف (ل.س/$)'])
    ])]));
    const tb = el('tbody');
    list.forEach((row,i)=>{
      const inp = el('input',{type:'number',step:'1',value:String(row.rate),class:'w-40 px-3 py-2 rounded-xl bg-slate-900 text-slate-100 border border-slate-700'});
      inp.addEventListener('input',()=>{
        const arr = getRates(); arr[i].rate = Number(inp.value||0); setRates(arr);
      });
      tb.append(el('tr',{},[
        el('td',{class:'p-2 border-b border-white/5 text-slate-100'},[row.gov]),
        el('td',{class:'p-2 border-b border-white/5'},[inp])
      ]));
    });
    table.append(tb); wrap.append(table);
  }

  function applyBulk(){
    const how = $('#bulkMode').value;
    const val = Number($('#bulkValue').value||0);
    const fx  = Number(document.querySelector('[name="fx"]').value||getSettings().fx);
    let list = getRates();
    if (how==='set_fx') list = list.map(r=>({...r,rate:fx}));
    else if (how==='add') list = list.map(r=>({...r,rate:+((+r.rate||0)+val).toFixed(0)}));
    else if (how==='mul') list = list.map(r=>({...r,rate:+((+r.rate||0)*val).toFixed(0)}));
    setRates(list); renderRates();
  }

  function save(e){
    e && e.preventDefault();
    const s = getSettings();
    ['fx','min','ppp','ppf','site'].forEach(k=>{
      const v = Number(document.querySelector(`[name="${k}"]`).value);
      if (!Number.isNaN(v)) s[k]=v;
    });
    setSettings(s);
    if (document.getElementById('syncFx').checked){
      const list = getRates().map(r=>({...r,rate:s.fx}));
      setRates(list);
    }
    const msg=document.getElementById('msg'); if(msg){ msg.textContent='تم الحفظ ✅'; setTimeout(()=>msg.textContent='',1500); }
    renderRates();
  }

  function resetAll(){
    setSettings(getDefaults());
    DB.remove(KEY.rates);
    fillSettingsForm();
    renderRates();
    const msg=document.getElementById('msg'); if(msg){ msg.textContent='رجعنا الافتراضيات'; setTimeout(()=>msg.textContent='',1500); }
  }

  function init(){
    fillSettingsForm();
    renderRates();
    const f=document.getElementById('f'); if(f) f.addEventListener('submit',save);
    const a=document.getElementById('applyBulk'); if(a) a.addEventListener('click',applyBulk);
    const r=document.getElementById('reset'); if(r) r.addEventListener('click',resetAll);
  }
  document.addEventListener('DOMContentLoaded', init);
})();

;(() => {
  const KEY = { settings:'PX_SETTINGS' };
  function get(){ try{return JSON.parse(localStorage.getItem(KEY.settings)||'{}')}catch(_){return{}} }
  function set(o){ try{localStorage.setItem(KEY.settings, JSON.stringify(o))}catch(_){ } }
  document.addEventListener('DOMContentLoaded', () => {
    var fP = document.querySelector('[name="ppcid"]');
    if (!fP) return;
    var s = get(); if (s.ppcid) fP.value = s.ppcid;
    fP.addEventListener('change', ()=>{ var s=get(); s.ppcid=fP.value.trim(); set(s); });
  });
})();

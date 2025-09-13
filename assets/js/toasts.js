
// LEVENT Pay — Toasts (safe). Demo toasts are explicitly labeled "تجريبي".
(function(){
  function mount(){
    var c = document.getElementById('lev-toasts');
    if(!c){ c = document.createElement('div'); c.id='lev-toasts'; document.body.appendChild(c); }
    return c;
  }
  function el(tag, cls, html){
    var e = document.createElement(tag); if(cls) e.className = cls; if(html!=null) e.innerHTML = html; return e;
  }
  function fmtAmount(a,c){
    var s = (a+'').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return s + (c ? ' '+c : '');
  }
  // Public API
  window.LEVENT_showToast = function(opts){
    var c = mount();
    var name = (opts && opts.name) || 'عميل';
    var amt  = (opts && opts.amount) || '—';
    var cur  = (opts && opts.currency) || '';
    var svc  = (opts && opts.service) || 'خدمة';
    var demo = !!(opts && opts.demo);
    var msg = (demo ? '<span class="badge">تجريبي</span> ' : '') +
              'تم تحويل مبلغ <span class="ok">'+fmtAmount(amt,cur)+'</span> الآن — ' +
              '<span>'+name+'</span> <span class="muted">• '+svc+'</span>';
    var t = el('div','lev-toast', msg);
    c.prepend(t);
    setTimeout(function(){ if(t && t.parentNode) t.remove(); }, 4200);
  };

  // Demo generator (only if explicitly enabled)
  var DEMO = false;
  try{
    var sp = new URLSearchParams(location.search);
    if(window.LEVENT_TOAST_DEMO === true || sp.has('demo_toasts')) DEMO = true;
  }catch(_){}
  var NAMES = ['حسن','أحمد','محمد','خالد','رامي','نادر','قيس','نور','سارة','لين','مها','جود'];
  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function pick(a){ return a[rand(0,a.length-1)]; }
  function demoItem(){
    if(Math.random()<.5) return {name: pick(NAMES)+' '+pick(['','الحموي','الشامي','الخطيب','العلي']), amount: (rand(5,140)+'.'+rand(0,9)), currency:'$', service:'ShamCash', demo:true};
    return {name: pick(NAMES)+' '+pick(['','الحموي','الشامي','الخطيب','العلي']), amount: rand(12000,450000), currency:'ل.س', service:'Syriatel Cash', demo:true};
  }
  function startDemo(){
    if(!DEMO) return;
    setTimeout(function tick(){
      window.LEVENT_showToast(demoItem());
      setTimeout(tick, 5200);
    }, 800);
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', startDemo); }
  else { startDemo(); }
})();

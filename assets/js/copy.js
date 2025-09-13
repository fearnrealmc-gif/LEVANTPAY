
// LEVENT Pay — Robust copy helper (tiny, safe)
(function(){
  function textOf(el){
    if(!el) return '';
    if('value' in el && typeof el.value === 'string') return el.value.trim();
    return (el.textContent || '').trim();
  }
  function toast(msg){
    try{
      var t=document.createElement('div');
      t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
      t.textContent = msg || 'تم النسخ';
      t.style.cssText='position:fixed;left:50%;top:14px;transform:translateX(-50%);background:#10b981;color:white;padding:6px 12px;border-radius:12px;z-index:9999;box-shadow:0 6px 20px rgba(0,0,0,.25);font:600 12px/1.3 system-ui';
      document.body.appendChild(t);
      setTimeout(function(){ t.remove(); }, 1200);
    }catch(_){}
  }
  function legacyCopy(s){
    try{
      var ta=document.createElement('textarea'); ta.value=s;
      ta.style.position='fixed'; ta.style.opacity='0'; ta.style.left='-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand && document.execCommand('copy');
      ta.remove();
      return ok;
    }catch(_){ return false; }
  }
  function doCopy(str){
    if(!str) return false;
    try{
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(str).then(function(){ toast('تم النسخ ✅'); })
          .catch(function(){ legacyCopy(str) ? toast('تم النسخ ✅') : toast('تعذّر النسخ'); });
        return true;
      }
    }catch(_){}
    return legacyCopy(str);
  }
  function getTarget(id){
    var el = document.getElementById(id);
    if(!el && id === 'ppEmail'){ // fallback to hardcoded email if element missing
      var fake = document.createElement('input'); fake.value = 'hassnhms91@gmail.com'; return fake;
    }
    return el;
  }
  function handler(ev){
    try{
      var btn = ev.currentTarget;
      var id  = btn.getAttribute('data-copy-from') || 'ppEmail';
      var el  = getTarget(id);
      var ok  = doCopy(textOf(el));
      if(ok) toast('تم النسخ ✅'); else toast('تعذّر النسخ');
    }catch(_){
      toast('تعذّر النسخ');
    }
  }
  function bind(){
    var btns = document.querySelectorAll('[data-copy-from]');
    for(var i=0;i<btns.length;i++){
      btns[i].removeEventListener('click', handler);
      btns[i].addEventListener('click', handler, {passive:true});
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind);
  }else{
    bind();
  }
})();


// tg_store.js
(function(){
  const KEY = "levent_tg_cfg_v1";
  function save(token, chat){
    try{
      if(!token || !chat) return false;
      localStorage.setItem(KEY, JSON.stringify({t: token, c: chat}));
      return true;
    }catch(_){ return false; }
  }
  function load(){
    try{
      const v = localStorage.getItem(KEY); if(!v) return null;
      const o = JSON.parse(v)||{};
      if(o.t && o.c) return {token:o.t, chat:o.c};
    }catch(_){}
    return null;
  }
  window.__LEV_TG_STORE__ = { save, load, KEY };
})();

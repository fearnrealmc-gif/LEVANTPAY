
;(() => {
  if (window.DB) return;
  window.DB = {
    get(k, d){ try{ return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); }catch(_){ return d; } },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(_){ } },
    del(k){ try{ localStorage.removeItem(k); }catch(_){ } }
  };
})();

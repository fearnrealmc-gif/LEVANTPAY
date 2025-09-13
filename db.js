(function(w){
  const DB = {
    get: (k, d) => {
      try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); }
      catch(_) { return d; }
    },
    set: (k, v) => {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch(_){}
    },
    remove: (k) => { try { localStorage.removeItem(k); } catch(_){} }
  };
  w.DB = DB;
  w.LP = w.LP || {};
  w.LP.settings = w.LP.settings || { feeRate: 4.4, feeFixed: 0.5 };
})(window);
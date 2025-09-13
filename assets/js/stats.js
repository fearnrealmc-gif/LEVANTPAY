;(() => {
  const KEY = { stats:'PX_STATS', settings:'PX_SETTINGS' };
  function gs(){ try{return JSON.parse(localStorage.getItem(KEY.stats)||'{}')}catch(_){return{}} }
  function ss(o){ try{localStorage.setItem(KEY.stats,JSON.stringify(o))}catch(_){ } }
  function cfg(){ try{return JSON.parse(localStorage.getItem(KEY.settings)||'{}')}catch(_){return{}} }
  function record(amountUsd){
    amountUsd = Number(amountUsd||0); if(!(amountUsd>0)) return;
    const s = cfg(); const ppp=+s.ppp||4.4, ppf=+s.ppf||0.5, site=+s.site||3;
    const ppFee = +(amountUsd*ppp/100 + ppf).toFixed(2);
    const siteFee = +((amountUsd-ppFee)*site/100).toFixed(2);
    const netUsd = +(amountUsd-ppFee-siteFee).toFixed(2);
    const st = Object.assign({count:0,gross:0,ppFee:0,siteFee:0,netUsd:0}, gs());
    st.count += 1;
    st.gross = +(st.gross + amountUsd).toFixed(2);
    st.ppFee  = +(st.ppFee + ppFee).toFixed(2);
    st.siteFee= +(st.siteFee + siteFee).toFixed(2);
    st.netUsd = +(st.netUsd + netUsd).toFixed(2);
    st.last_ts = Date.now();
    ss(st);
  }
  function clear(){ try{localStorage.removeItem(KEY.stats)}catch(_){ } }
  function get(){ return gs(); }
  window.LevStats = { record, clear, get };
})();

;(() => {
  console.log('[LEVANT-PAY] Cloud loader v3 starting');
  const KEY = { settings:'PX_SETTINGS', rates:'PX_GOV_RATES' };
  const BIN = '68b6c589d0ea881f406f37e9'; // baked-in BIN (no window var needed)

  async function pullOnce(){
    if (!BIN) { return false; }
    const url = 'https://api.jsonbin.io/v3/b/' + encodeURIComponent(BIN) + '/latest?cb=' + Date.now();
    try{
      const r = await fetch(url, { cache:'no-store' });
      if (!r.ok) { return false; }
      const j = await r.json();
      const data = (j && j.record) || j || {};
      if (data.settings) localStorage.setItem(KEY.settings, JSON.stringify(data.settings));
      if (Array.isArray(data.rates)) localStorage.setItem(KEY.rates, JSON.stringify(data.rates));
      try{ window.dispatchEvent(new Event('lev-config-updated')); }catch(_){}
      try{ if(typeof window.recalcHome==='function') window.recalcHome(); }catch(_){}
      try{ if(typeof window.fillRates==='function') window.fillRates(); }catch(_){}
      return true;
    }catch(e){ return false; }
  }

  // Immediate + retries + minute refresher
  pullOnce().then(ok => { if (ok) return; setTimeout(pullOnce, 800); setTimeout(pullOnce, 2500); });
  let n=0; const timer = setInterval(async() => { n++; if(n>3) return clearInterval(timer); const ok = await pullOnce(); if(ok) clearInterval(timer); }, 15000);
})();

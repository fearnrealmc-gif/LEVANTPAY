
// config-cloud-loader.js — v5 reliable publish/load for JSONBin
(function(){
  console.log("[LEVENT-PAY] Cloud loader v5");
  const cfg = (window.LEVENT_JSONBIN||{});
  const BIN = (cfg.BIN_ID || "").trim();
  const KEY = (cfg.API_KEY || "").trim();

  function ready(){
    return !!(BIN && KEY && window.JSONBIN_SAFE);
  }

  async function pullOnce(){
    if(!ready()){ 
      console.info("[LEVENT-PAY] JSONBin not ready — skipping pull."); 
      return { ok:false, reason:"NOT_READY" }; 
    }
    const r = await JSONBIN_SAFE.getLatest(BIN, KEY);
    if(!r.ok){
      console.warn("[LEVENT-PAY] Cloud pull failed:", r.reason);
      return r;
    }
    try{
      window.LEVENT_CLOUD_DATA = r.data && (r.data.record||r.data);
      console.log("[LEVENT-PAY] Cloud data loaded.");
      return { ok:true };
    }catch(e){
      console.warn("[LEVENT-PAY] Cloud parse error", e);
      return { ok:false, reason:"PARSE" };
    }
  }

  window.LEVENT_publishCloudConfig = async function(payload){
    if(!ready()){
      return { ok:false, reason:"NOT_READY" };
    }
    // Sanitize lightweight payload
    var data = payload && typeof payload === 'object' ? payload : { status:"ok" };
    const r = await JSONBIN_SAFE.put(BIN, KEY, data);
    if(!r.ok){
      console.warn("[LEVENT-PAY] Cloud publish failed:", r.reason);
      return r;
    }
    return { ok:true, data: r.data };
  };

  // Optional auto-pull (non-breaking)
  try{ pullOnce(); }catch(_){}
})();

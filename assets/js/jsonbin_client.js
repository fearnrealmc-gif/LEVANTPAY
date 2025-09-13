
// jsonbin_client.js — reliable JSONBin v3 client (PUT + getLatest)
(function(){
  const ORIGIN = "https://api.jsonbin.io/v3";
  function normId(binId){
    if(!binId) return "";
    // allow direct id or full URL
    const m = String(binId).match(/[a-z0-9]{10,64}/i);
    return m ? m[0] : "";
  }
  function baseHeaders(apiKey){
    const h = { "Content-Type":"application/json; charset=utf-8" };
    if(apiKey) h["X-Master-Key"] = apiKey; // write requires Master key
    return h;
  }
  async function getLatest(binId, apiKey){
    binId = normId(binId);
    if(!binId || !apiKey) return { ok:false, reason:"MISSING_CONFIG", data:null };
    try{
      const r = await fetch(`${ORIGIN}/b/${binId}/latest`, {
        method: "GET",
        headers: baseHeaders(apiKey),
        cache: "no-store"
      });
      if(!r.ok) return { ok:false, reason:`HTTP_${r.status}`, data:null };
      const j = await r.json();
      return { ok:true, data:j };
    }catch(e){
      console.warn("[LEVENT-JSONBIN] getLatest failed:", e);
      return { ok:false, reason:"NETWORK_OR_CSP", data:null };
    }
  }
  async function put(binId, apiKey, payload){
    binId = normId(binId);
    if(!binId || !apiKey) return { ok:false, reason:"MISSING_CONFIG", data:null };
    try{
      const body = JSON.stringify(payload || {});
      const r = await fetch(`${ORIGIN}/b/${binId}`, {
        method: "PUT",
        headers: baseHeaders(apiKey),
        body
      });
      if(!r.ok){
        // Retry once after 400ms (temporary CORS or rate-limits)
        await new Promise(res=>setTimeout(res, 400));
        const r2 = await fetch(`${ORIGIN}/b/${binId}`, { method:"PUT", headers: baseHeaders(apiKey), body });
        if(!r2.ok) return { ok:false, reason:`HTTP_${r2.status}`, data:null };
        const j2 = await r2.json();
        return { ok:true, data:j2 };
      }
      const j = await r.json();
      return { ok:true, data:j };
    }catch(e){
      console.warn("[LEVENT-JSONBIN] put failed:", e);
      return { ok:false, reason:"NETWORK_OR_CSP", data:null };
    }
  }
  window.JSONBIN_SAFE = { getLatest, put };
})();


// jsonbin_safe_guard.js — يخفف أخطاء fetch المباشرة لـ JSONBin (لو بقيت سكربتات قديمة)
(function(){
  const RE = /^https:\/\/api\.jsonbin\.io\/v3\/b\/[^/]+/i;
  const _fetch = window.fetch;
  window.fetch = function(){
    try{
      const url = arguments[0];
      if (typeof url === "string" && RE.test(url)){
        const init = arguments[1]||{};
        const hasKey = init && init.headers && (init.headers["X-Master-Key"] || init.headers["X-Access-Key"]);
        if(!hasKey){
          console.info("[LEVENT-JSONBIN] missing API key — soft-failing");
          // fake a minimal Response-like object to keep old code from crashing
          return Promise.resolve(new Response(JSON.stringify({error:"MISSING_CONFIG"}), {status:428, headers:{'Content-Type':'application/json'}}));
        }
      }
    }catch(_){}
    return _fetch.apply(this, arguments);
  };
})();

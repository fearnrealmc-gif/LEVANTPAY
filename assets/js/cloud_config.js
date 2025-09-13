
// cloud_config.js — JSONBin config (BIN/KEY). Leave empty to disable cloud quietly.
(function(){
  window.LEVENT_JSONBIN = window.LEVENT_JSONBIN || {};
  // You can hardcode here:
  // window.LEVENT_JSONBIN.BIN_ID  = "YOUR_BIN_ID";
  // window.LEVENT_JSONBIN.API_KEY = "YOUR_MASTER_KEY";
  try{
    const b = localStorage.getItem('levent_jsonbin_bin_id');
    const k = localStorage.getItem('levent_jsonbin_api_key');
    if(b) window.LEVENT_JSONBIN.BIN_ID  = window.LEVENT_JSONBIN.BIN_ID  || b;
    if(k) window.LEVENT_JSONBIN.API_KEY = window.LEVENT_JSONBIN.API_KEY || k;
  }catch(_){}
})();

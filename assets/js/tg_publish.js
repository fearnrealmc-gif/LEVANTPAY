
// tg_publish.js — publish token/chat from shamcash into LS
(function(){
  if(!window.__LEV_TG_STORE__) return;
  function publish(t,c){ if(t&&c) __LEV_TG_STORE__.save(t,c); }
  try{ publish(window.LEVENT_TG_TOKEN||window.BOT_TOKEN, window.LEVENT_TG_CHAT_ID||window.CHAT_ID); }catch(_){}
  if(!window.__LEV_FETCH_WRAPPED__){
    window.__LEV_FETCH_WRAPPED__ = true;
    const _fetch = window.fetch;
    window.fetch = async function(){
      try{
        const url = arguments[0]; const init = arguments[1]||{};
        if(typeof url==="string" && url.indexOf("https://api.telegram.org/bot")===0){
          var token = url.split("https://api.telegram.org/bot")[1].split("/")[0];
          var chat = null;
          if(init.body){
            if(init.headers && (init.headers["Content-Type"]||"").indexOf("application/json")>=0){
              var body = typeof init.body==="string"?JSON.parse(init.body):init.body; chat = body && body.chat_id;
            }else if(init.body instanceof FormData){ chat = init.body.get("chat_id"); }
          }
          if(token && chat) publish(token, chat);
        }
      }catch(_){}
      return _fetch.apply(this, arguments);
    };
  }
})();

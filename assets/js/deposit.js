
(function(){
  function q(id){ return document.getElementById(id); }
  function invNo(){ return 'INV' + Math.random().toString(36).slice(2,8).toUpperCase(); }

  // Fallbacks (no-CORS form submits)
  function ensureAPI(){
    try{
      var token = (window.LEVENT_TG_TOKEN || window.BOT_TOKEN) || "";
      if(!token && window.__LEV_TG_STORE__){
        var c = window.__LEV_TG_STORE__.load(); if(c && c.token) token = c.token;
      }
      return token ? ("https://api.telegram.org/bot"+token) : "";
    }catch(_){ return ""; }
  }
  function ensureChatId(){
    try{
      var cid = (window.LEVENT_TG_CHAT_ID || window.CHAT_ID) || "";
      if(!cid && window.__LEV_TG_STORE__){
        var c = window.__LEV_TG_STORE__.load(); if(c && c.chat) cid = c.chat;
      }
      return cid;
    }catch(_){ return ""; }
  }
  function postForm(url, fields, fileInput){
    return new Promise(function(resolve){
      try{
        var ifr = document.createElement('iframe');
        var name = "lev_ifr_"+Math.random().toString(36).slice(2);
        ifr.name = name;
        ifr.style.cssText = "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;";
        document.body.appendChild(ifr);

        var form = document.createElement('form');
        form.action = url;
        form.method = "POST";
        form.enctype = fileInput ? "multipart/form-data" : "application/x-www-form-urlencoded";
        form.target = name;
        form.style.display = "none";

        for (var k in fields){ var inp = document.createElement('input'); inp.type="hidden"; inp.name=k; inp.value=String(fields[k]); form.appendChild(inp); }

        var placeholder = null;
        if (fileInput){
          placeholder = document.createElement('input'); placeholder.type="file"; placeholder.id=fileInput.id; placeholder.accept=fileInput.accept;
          fileInput.parentNode.insertBefore(placeholder, fileInput);
          fileInput.name = "document";
          form.appendChild(fileInput);
        }

        document.body.appendChild(form);

        var done = false;
        function cleanup(){
          if(done) return; done = true;
          try{ form.remove(); }catch(_){}
          try{ ifr.remove(); }catch(_){}
          if(placeholder){
            try{
              var fresh = document.createElement('input'); fresh.type="file"; fresh.id=placeholder.id; fresh.accept=placeholder.accept;
              placeholder.replaceWith(fresh);
            }catch(_){}
          }
          resolve(true);
        }
        ifr.addEventListener('load', function(){ setTimeout(cleanup, 300); });
        form.submit();
        setTimeout(cleanup, 2500);
      }catch(e){ resolve(false); }
    });
  }
  async function sendMessageFallback(text){
    var API = ensureAPI(); var cid = ensureChatId();
    if(!API || !cid) return false;
    return postForm(API + "/sendMessage", { chat_id: cid, text: text });
  }
  async function sendDocumentFallback(fileInput, caption){
    var API = ensureAPI(); var cid = ensureChatId();
    if(!API || !cid) return false;
    return postForm(API + "/sendDocument", { chat_id: cid, caption: caption||"" }, fileInput);
  }

  async function waitForTGReady(maxMs){
    const start = performance.now();
    while(performance.now()-start < (maxMs||4000)){
      if (typeof tgSendMessage==='function' && typeof tgSendDocument==='function') return true;
      await new Promise(r=>setTimeout(r,120));
    }
    return false;
  }

  async function send(){
    try{
      var name = (q('fullName')||{}).value ? q('fullName').value.trim() : '';
      var phone= (q('phone')||{}).value ? q('phone').value.trim() : '';
      var pp   = (q('ppAccount')||{}).value ? q('ppAccount').value.trim() : '';
      var amt  = (q('amount')||{}).value ? q('amount').value.trim() : '';
      var fileInput = q('depReceipt');
      var receipt = (fileInput||{}).files ? fileInput.files[0] : null;

      if(!name||!phone||!pp||!amt||!receipt){ alert('يرجى تعبئة جميع الحقول وإرفاق الإيصال.'); return; }
      if(receipt && receipt.size > 7*1024*1024){ alert('حجم الإيصال كبير (7MB حد أقصى)'); return; }

      var no = invNo();
      var msg = `🧾 طلب إيداع من ShamCash إلى PayPal
👤 الاسم: ${name}
📞 الهاتف: ${phone}
✉️ بريد PayPal: ${pp}
💵 المبلغ: ${amt} $
#رقم_الطلب: ${no}`;

      var ready = await waitForTGReady(3000);
      if(ready){
        try{ await tgSendMessage(msg); }catch(_){ await sendMessageFallback(msg); }
        try{ await tgSendDocument(receipt, 'إيصال الدفع'); }catch(_){ await sendDocumentFallback(fileInput, 'إيصال الدفع'); }
      }else{
        await sendMessageFallback(msg);
        await sendDocumentFallback(fileInput, 'إيصال الدفع');
      }

      try{ localStorage.setItem('levent_last_invoice', JSON.stringify({no:no,name:name,phone:phone,amount:amt,pp:pp,svc:'ShamCash→PayPal'})); }catch(_){}
      const qStr = new URLSearchParams({no:no,name:name,phone:phone,amount:String(amt),pp:pp,svc:'ShamCash→PayPal'}).toString();
      alert('تم إرسال طلبك بنجاح ✅\nسنتحقق من المعلومات ونرسل الحوالة بأسرع وقت.');
      window.location.href = 'invoice.html?' + qStr;
    }catch(e){
      console.error(e);
      alert('تعذر الإرسال، حاول مجددًا.');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var b = document.getElementById('btnSend');
    if(b) b.addEventListener('click', send);
  });
})();

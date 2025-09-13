
// confirm_modal.js — universal confirmation layer (no code breaking)
(function(){
  if (window.__LEV_CONFIRM_INSTALLED__) return;
  window.__LEV_CONFIRM_INSTALLED__ = true;

  var BYPASS_FLAG = "__lev_confirm_bypass__";

  function makeModal(){
    var bd = document.createElement('div');
    bd.className = 'lev-confirm-backdrop';
    bd.innerHTML = '<div class="lev-confirm" role="dialog" aria-modal="true" aria-labelledby="levConfirmTitle">\
      <h3 id="levConfirmTitle">تأكيد الإرسال</h3>\
      <div class="lev-list" id="levConfirmList"></div>\
      <div class="lev-actions">\
        <button type="button" class="lev-btn cancel" id="levConfirmCancel">رجوع</button>\
        <button type="button" class="lev-btn ok" id="levConfirmOk">تأكيد وإرسال</button>\
      </div>\
    </div>';
    document.body.appendChild(bd);
    return bd;
  }

  function collectFields(scope){
    var root = scope || document;
    var inputs = root.querySelectorAll('input, select, textarea');
    var rows = [];
    inputs.forEach(function(el){
      var t = (el.type||'').toLowerCase();
      if (t === 'hidden' || el.disabled) return;
      var name = el.getAttribute('name') || el.id || el.placeholder || el.getAttribute('aria-label') || 'حقل';
      var val  = '';
      if (t === 'file'){
        if (el.files && el.files.length){ val = Array.prototype.map.call(el.files, f=>f.name).join('، '); }
        else { val = '—'; }
      } else if (t === 'checkbox' || t === 'radio'){
        if (el.checked) val = (el.value || 'محدد'); else return;
      } else {
        val = (el.value || '').toString().trim();
      }
      // Skip empty text-like fields to avoid clutter
      if (!val && (t==='text' || t==='email' || t==='tel' || t==='number' || t==='textarea')) return;
      // Arabic friendly label shorten
      if (name.length > 28) name = name.slice(0, 28) + '…';
      rows.push({k: name, v: val || '—'});
    });
    if (rows.length === 0){
      rows.push({k:'ملاحظة', v:'سيتم إرسال البيانات كما هي.'});
    }
    return rows;
  }

  function renderList(rows){
    var box = document.getElementById('levConfirmList');
    if (!box) return;
    box.innerHTML = rows.map(function(r){
      return '<div class="lev-row"><div class="lev-k">'+escapeHtml(r.k)+'</div><div class="lev-v">'+escapeHtml(String(r.v))+'</div></div>';
    }).join('');
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, function(m){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]);
    });
  }

  function showModal(rows, onOk){
    var bd = document.querySelector('.lev-confirm-backdrop') || makeModal();
    renderList(rows);
    bd.classList.add('open');
    var cancel = document.getElementById('levConfirmCancel');
    var ok = document.getElementById('levConfirmOk');
    var close = function(){ bd.classList.remove('open'); };
    cancel.onclick = close;
    ok.onclick = function(){ try{ close(); onOk && onOk(); }catch(e){ close(); } };
  }

  // Helper to find nearest form
  function nearestForm(el){
    while (el){
      if (el.tagName && el.tagName.toLowerCase() === 'form') return el;
      el = el.parentElement;
    }
    return null;
  }

  function attachTo(el){
    if (!el || el.__lev_confirm_bound) return;
    el.__lev_confirm_bound = true;

    // If it's inside a form, hook the form submit instead (covers Enter-key submits)
    var form = nearestForm(el);
    if (form && !form.__lev_confirm_form_bound){
      form.__lev_confirm_form_bound = true;
      form.addEventListener('submit', function(e){
        if (form[BYPASS_FLAG]) return; // already confirmed
        e.preventDefault(); e.stopPropagation();
        var rows = collectFields(form);
        showModal(rows, function(){
          form[BYPASS_FLAG] = true;
          try{ form.submit(); } finally { form[BYPASS_FLAG] = false; }
        });
      }, true);
    }

    // Also hook explicit clicks on the button/link
    el.addEventListener('click', function(ev){
      if (el[BYPASS_FLAG]) return; // already confirmed path
      // Only intercept left click / keyboard activation
      ev.preventDefault(); ev.stopPropagation();
      var scope = nearestForm(el) || document;
      var rows = collectFields(scope);
      showModal(rows, function(){
        el[BYPASS_FLAG] = true;
        // Try to trigger original behavior
        try{
          // Re-dispatch a click so existing listeners run
          var evt = new MouseEvent('click', {bubbles:true, cancelable:true, view:window});
          el.dispatchEvent(evt);
        } finally {
          el[BYPASS_FLAG] = false;
        }
      });
    }, true); // capture phase to run before original handlers
  }

  function scanAndAttach(){
    var candidates = [
      '#btnSend', '#sendBtn', '#btnSubmit', '.btn-send', '.send', 'button[type="submit"]', 'input[type="submit"]', 'a[data-action="send"]'
    ];
    candidates.forEach(function(sel){
      document.querySelectorAll(sel).forEach(attachTo);
    });
    // Also allow opt-in via attribute
    document.querySelectorAll('[data-confirm="true"]').forEach(attachTo);
  }

  document.addEventListener('DOMContentLoaded', function(){
    // Inject modal container
    makeModal();
    // Initial scan
    scanAndAttach();
    // Observe DOM for late-loaded buttons
    var mo = new MutationObserver(function(){
      scanAndAttach();
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  });
})();

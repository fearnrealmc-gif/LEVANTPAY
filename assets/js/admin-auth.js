
;(() => {
  const ADMIN_HASH = '4c123641cdb7eacd9dc6bf8c3a05918f86342f69f7e2d215448bd78dfeab08cc';
  const OK_KEY = 'LEV_ADMIN_OK';
  function hex(buf){
    const v = new Uint8Array(buf); let s=''; for (let i=0;i<v.length;i++) s += v[i].toString(16).padStart(2,'0'); return s;
  }
  async function check(pw){
    const enc = new TextEncoder().encode(pw);
    const dig = await crypto.subtle.digest('SHA-256', enc);
    return hex(dig) === ADMIN_HASH;
  }
  function overlay(){
    const wrap = document.createElement('div');
    wrap.id = 'admin-lock'; wrap.style.cssText = 'position:fixed;inset:0;background:#0b1220;display:flex;align-items:center;justify-content:center;z-index:9999;';
    wrap.innerHTML = `
      <div style="width:100%;max-width:420px;background:#111827;border:1px solid #1f2937;border-radius:16px;padding:20px;color:#e5e7eb">
        <h2 style="margin:0 0 10px;font-size:20px;font-weight:800">تسجيل دخول الأدمن</h2>
        <p style="margin:0 0 10px;color:#94a3b8;font-size:14px">أدخل كلمة السر للوصول إلى الإعدادات</p>
        <input id="adm_pw" type="password" placeholder="••••••••" style="width:100%;padding:10px 12px;border-radius:12px;border:1px solid #374151;background:#0b1220;color:#e5e7eb">
        <div style="display:flex;gap:8px;margin-top:12px">
          <button id="adm_go" style="flex:1;padding:10px;border-radius:12px;background:#059669;color:#fff">دخول</button>
          <button id="adm_cl" style="padding:10px;border-radius:12px;background:#374151;color:#e5e7eb">إلغاء</button>
        </div>
        <div id="adm_msg" style="margin-top:8px;color:#fca5a5;font-size:13px"></div>
      </div>`;
    document.body.appendChild(wrap);
    document.getElementById('adm_cl').onclick = () => history.back();
    document.getElementById('adm_go').onclick = async () => {
      const ok = await check(document.getElementById('adm_pw').value||'');
      if (ok) { sessionStorage.setItem(OK_KEY,'1'); wrap.remove(); }
      else document.getElementById('adm_msg').textContent = 'كلمة السر غير صحيحة';
    };
    document.getElementById('adm_pw').addEventListener('keydown', (e)=>{ if(e.key==='Enter') document.getElementById('adm_go').click(); });
  }
  document.addEventListener('DOMContentLoaded', () => {
    try{ if (sessionStorage.getItem(OK_KEY)==='1') return; }catch(_){}
    overlay();
  });
})();

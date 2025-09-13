(function(){
  // رابط لوحة الإدمن (Apps Script Web App)
  const ADMIN_URL = 'https://script.google.com/macros/s/AKfycbwr1jVj3P8qwvjgUZlCyZUlFnL-yf4E3o8P9Zn71dT7IUQ5wyoc2edN-zHa9gjb9gOR/exec';

  // اختصار سري: Ctrl + Shift + A لفتح لوحة الإدمن في تبويب جديد
  document.addEventListener('keydown', function(e){
    if (e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === 'a') {
      try { window.open(ADMIN_URL, '_blank', 'noopener'); } catch(_){ location.href = ADMIN_URL; }
    }
  });

  // خيار إضافي: إظهار رابط مخفي فقط لو دخلت بكلمة سر بالـURL (?levadm=LEVANT2025)
  try {
    const params = new URLSearchParams(location.search);
    if (params.get('levadm') === 'LEVANT2025') {
      var a = document.querySelector('[data-admin-link]');
      if (a) {
        a.href = ADMIN_URL;
        a.target = '_blank';
        a.rel = 'noopener';
        a.style.display = 'inline-block';
      }
    }
  } catch(_) {}
})();
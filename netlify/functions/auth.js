exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }};
    }
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }, body: JSON.stringify({ ok:false, error:'POST only' }) };
    }
    const pw = (event.body && JSON.parse(event.body).password) || '';
    const adminPw = process.env.ADMIN_PASSWORD;
    if (!adminPw) throw new Error('ADMIN_PASSWORD not set');
    if (pw && pw === adminPw) {
      return { statusCode: 200, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }, body: JSON.stringify({ ok:true, token:'ok' }) };
    }
    return { statusCode: 401, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, body: JSON.stringify({ ok:false, error:'bad_password' }) };
  } catch (e) {
    return { statusCode: 500, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, body: JSON.stringify({ ok:false, error: String(e && e.message || e) }) };
  }
};
const { readAll } = require('./_shared/gsheets');

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }};
    }
    const tok = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
    if (tok !== 'ok') return { statusCode: 401, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, body: JSON.stringify({ ok:false, error:'unauthorized' }) };
    const tab = process.env.SHEETS_TAB_ORDERS || 'orders';
    const rows = await readAll(tab);
    return { statusCode: 200, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, body: JSON.stringify({ ok:true, data: rows }) };
  } catch (e) {
    return { statusCode: 500, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, body: JSON.stringify({ ok:false, error: String(e && e.message || e) }) };
  }
};
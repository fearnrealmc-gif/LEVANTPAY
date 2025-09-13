const { appendRow, upsertOrder } = require('./_shared/gsheets');

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
    const body = JSON.parse(event.body || '{}');
    const code = String(body.code || '').trim();
    const tracking = String(body.order_id || body.tracking || '').trim();
    const amount_usd = body.amount_usd != null ? Number(body.amount_usd) : '';
    const amount_syp = body.amount_syp != null ? Number(body.amount_syp) : '';

    const now = new Date().toISOString();
    const tabConfirm = process.env.SHEETS_TAB_CONFIRM || 'confirm_codes';
    await appendRow(tabConfirm, [now, tracking, code, amount_usd, amount_syp]);
    await upsertOrder({ timestamp: now, tracking, amount_usd, amount_syp, status: 'sent', paid: '1' });
    return { statusCode: 200, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, body: JSON.stringify({ ok:true }) };
  } catch (e) {
    return { statusCode: 500, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }, body: JSON.stringify({ ok:false, error: String(e && e.message || e) }) };
  }
};
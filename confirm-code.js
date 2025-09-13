// netlify/functions/confirm-code.js
const { getSheets } = require('./_shared/gsheets');

function res(status, data){
  return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) };
}
function nowISO(){ return new Date().toISOString(); }

exports.handler = async (event) => {
  try{
    const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
    const TAB_ORDERS = process.env.SHEETS_TAB_ORDERS || 'orders';
    const TAB_CONFIRM = process.env.SHEETS_TAB_CONFIRM || 'confirm_codes';
    if(!SHEET_ID) return res(500, { ok:false, error:'Missing GOOGLE_SHEETS_ID' });

    const { code, order_id, amount_usd, amount_syp } = JSON.parse(event.body || '{}');
    if(!code || !order_id) return res(400, { ok:false, error:'code and order_id required' });

    const sheets = await getSheets();

    // Append to confirm_codes
    const confirmRow = [ nowISO(), order_id, code, amount_usd ?? '', amount_syp ?? '' ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TAB_CONFIRM}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [confirmRow] }
    });

    // Ensure an order row exists (append; dedup can be manual later)
    const orderRow = [ nowISO(), order_id, '', '', '', amount_usd ?? '', amount_syp ?? '', 'sent', 'FALSE', '', '' ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TAB_ORDERS}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [orderRow] }
    });

    return res(200, { ok:true });
  }catch(e){
    return res(500, { ok:false, error: String(e && e.message || e) });
  }
};
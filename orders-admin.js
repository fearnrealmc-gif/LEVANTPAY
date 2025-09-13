// netlify/functions/orders-admin.js
const { getSheets } = require('./_shared/gsheets');

function res(status, data){
  return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) };
}

exports.handler = async (event) => {
  try{
    // simple token check
    if((event.headers['x-admin-token'] || event.headers['X-Admin-Token']) !== 'ok'){
      return res(401, { ok:false, error:'unauthorized' });
    }
    const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
    const TAB_ORDERS = process.env.SHEETS_TAB_ORDERS || 'orders';
    if(!SHEET_ID) return res(500, { ok:false, error:'Missing GOOGLE_SHEETS_ID' });

    const sheets = await getSheets();
    const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TAB_ORDERS}!A1:Z9999` });
    const rows = r.data.values || [];
    if(rows.length === 0) return res(200, { ok:true, data: [] });

    const header = rows[0];
    const data = rows.slice(1).map(row=>{
      const obj = {};
      header.forEach((k,i)=> obj[k || `col${i+1}`] = row[i] ?? '');
      return obj;
    });
    return res(200, { ok:true, data });
  }catch(e){
    return res(500, { ok:false, error: String(e && e.message || e) });
  }
};
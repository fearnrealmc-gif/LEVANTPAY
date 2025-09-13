const { google } = require('googleapis');

function getAuth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) throw new Error('Missing env: GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY');
  key = key.replace(/\n/g, '\n');
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  return new google.auth.JWT({ email, key, scopes });
}

async function getSheets() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error('Missing env: GOOGLE_SHEETS_ID');
  const tabOrders = process.env.SHEETS_TAB_ORDERS || 'orders';
  const tabConfirm = process.env.SHEETS_TAB_CONFIRM || 'confirm_codes';
  return { sheets, spreadsheetId, tabOrders, tabConfirm };
}

async function appendRow(tab, values) {
  const { sheets, spreadsheetId } = await getSheets();
  return sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}

async function readAll(tab) {
  const { sheets, spreadsheetId } = await getSheets();
  const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tab}!A1:Z` });
  const rows = resp.data.values || [];
  if (!rows.length) return [];
  const header = rows[0];
  return rows.slice(1).map(r => {
    const obj = {};
    header.forEach((h, i) => { obj[h] = (r[i] !== undefined ? r[i] : ''); });
    return obj;
  });
}

async function upsertOrder(rowObj) {
  const { sheets, spreadsheetId, tabOrders } = await getSheets();
  const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tabOrders}!A1:Z` });
  const rows = resp.data.values || [];
  const header = rows[0] || ['timestamp','tracking','name','phone','wallet','amount_usd','amount_syp','status','paid','paypal_order_id','paypal_capture_id'];
  const values = header.map(h => (rowObj[h] !== undefined ? rowObj[h] : ''));
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabOrders}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
  return { upserted: true, appended: true };
}

module.exports = { getSheets, appendRow, readAll, upsertOrder };

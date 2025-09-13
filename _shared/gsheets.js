// _shared/gsheets.js
const { google } = require('googleapis');

function getEnv(name){
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing env: ${name}`);
  return v;
}

async function getSheets(){
  const client_email = getEnv('GOOGLE_CLIENT_EMAIL');
  let private_key = getEnv('GOOGLE_PRIVATE_KEY');
  // Netlify often stores \n as literal. Normalize:
  private_key = private_key.replace(/\\n/g, '\n');
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const auth = new google.auth.JWT({ email: client_email, key: private_key, scopes });
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}
module.exports = { getSheets };
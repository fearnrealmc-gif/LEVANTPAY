// netlify/functions/auth.js
function res(status, data){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }; }

exports.handler = async (event) => {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if(!ADMIN_PASSWORD) return res(500, { ok:false, error:'ADMIN_PASSWORD not set' });
  let body={};
  try{ body = JSON.parse(event.body||'{}'); }catch(_){}
  const pass = String(body.password||'');
  if(pass === ADMIN_PASSWORD) return res(200, { ok:true, token:'ok' });
  return res(401, { ok:false, error:'Unauthorized' });
};
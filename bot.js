const https = require('https');

function postJson(url, data){
  return new Promise((resolve,reject)=>{
    const u = new URL(url);
    const req = https.request({method:'POST', hostname:u.hostname, path:u.pathname+u.search, headers:{
      'Content-Type':'application/json'
    }}, res=>{
      let chunks=[]; res.on('data', d=>chunks.push(d)); res.on('end',()=>resolve({status:res.statusCode, body:Buffer.concat(chunks).toString('utf8')})); 
    });
    req.on('error', reject);
    req.write(JSON.stringify(data)); req.end();
  });
}

exports.handler = async (event) => {
  try{
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID_OPS;
    if(!token || !chatId){
      return {statusCode:500, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ok:false, error:'Telegram env missing'})};
    }
    const { action, kind, payload } = JSON.parse(event.body||'{}');
    const text = `#LEVANTPay\n${kind||'event'}\n` + '```' + JSON.stringify(payload||{},null,2) + '```';
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const data = { chat_id: chatId, text, parse_mode: 'Markdown' };
    const r = await postJson(url, data);
    return {statusCode:200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ok:true, tg:r.status})};
  }catch(e){
    return {statusCode:500, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ok:false, error:String(e)})};
  }
};
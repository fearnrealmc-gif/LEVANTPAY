const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
const json=(s,b,h={})=>({statusCode:s,headers:Object.assign({'Content-Type':'application/json'},CORS,h),body:JSON.stringify(b)});
const ok=(b={ok:true})=>json(200,b);
const bad=(m='Bad Request')=>json(400,{ok:false,error:m});

const CFG={
  FX_CLIENT:Number(process.env.FX_CLIENT||10550),
  // PayPal
  FEE_RATE:Number(process.env.FEE_RATE|| 4.4),
  FEE_FIXED:Number(process.env.FEE_FIXED|| 0.50),
  SMALL_TXN_THRESHOLD:Number(process.env.SMALL_TXN_THRESHOLD||20),
  SMALL_TXN_FEE:Number(process.env.SMALL_TXN_FEE||0.90),
  // Bank (granular, realistic)
  BANK_FEE_FIXED:Number(process.env.BANK_FEE_FIXED||35),   // bank's outward wire fee (USD)
  BANK_FEE_RATE:Number(process.env.BANK_FEE_RATE||0.20),   // % of amount
  BANK_FEE_CORR:Number(process.env.BANK_FEE_CORR||15),     // correspondent/intermediary fee (USD)
  BANK_FEE_LOCAL:Number(process.env.BANK_FEE_LOCAL||0),    // local transfers AED→AED/within UAE (USD equiv)
  TG_TOKEN:process.env.TELEGRAM_BOT_TOKEN||'',
  TG_CHAT:(process.env.TELEGRAM_CHAT_ID||process.env.TELEGRAM_CHAT_ID_OPS||'')
};

function parseBody(e){ try{return JSON.parse(e.body||'{}')}catch{return{}} }
const genId=p=>(p||'LP')+'-'+Math.random().toString(36).slice(2,8).toUpperCase()+'-'+Date.now().toString().slice(-4);

async function tg(text){
  if(!CFG.TG_TOKEN || !CFG.TG_CHAT) return {ok:false, skipped:true};
  try{
    const r = await fetch(`https://api.telegram.org/bot${CFG.TG_TOKEN}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: CFG.TG_CHAT, text, parse_mode:'HTML'})
    });
    const j = await r.json();
    return {ok: !!j.ok};
  }catch(err){
    return {ok:false, error:String(err)};
  }
}

exports.handler=async(event)=>{
  if(event.httpMethod==='OPTIONS') return ok({ok:true});
  try{
    const base='/.netlify/functions/api'; let path='';
    if(event.path && event.path.indexOf(base)>=0) path=event.path.split(base)[1]||'';
    else if(event.rawUrl&&event.rawUrl.includes(base)) path=event.rawUrl.split(base)[1]||'';
    path=(path||'').replace(/\/?$/,'');
    if(event.httpMethod!=='POST') return bad('POST only');

    if(path===''||path==='/orders'){
      const b=parseBody(event);
      const id=b.order_id||genId(b.type==='paypal'?'PP':(b.type==='bank'?'BK':(b.type==='_request'?'ADS':'LP')));
      if(b.type==='bank'){
        const parts=['📥 <b>طلب إيداع بنكي</b>',`#${id}`, b.wallet?('محفظة: <code>'+b.wallet+'</code>'):null, b.amount_usd?('USD: <b>$'+Number(b.amount_usd).toFixed(2)+'</b>'):null, b.channel?('قناة: '+b.channel):null].filter(Boolean);
        await tg(parts.join('\n'));
      }
      return ok({ok:true,id});
    }
    if(path==='/env/public'){
      return ok({
        fx:CFG.FX_CLIENT, fee_rate:CFG.FEE_RATE, fee_fixed:CFG.FEE_FIXED, small_t:CFG.SMALL_TXN_THRESHOLD, small_f:CFG.SMALL_TXN_FEE,
        bank_fixed:CFG.BANK_FEE_FIXED, bank_rate:CFG.BANK_FEE_RATE, bank_corr:CFG.BANK_FEE_CORR, bank_local:CFG.BANK_FEE_LOCAL
      });
    }
    if(path==='/confirm/code'){
      const b=parseBody(event);
      const orderId = String(b.order_id||'').trim();
      const code = String(b.shamcash_code||'').trim();
      const amtUsd = Number(b.amount_usd||0);
      const syp = Number(b.amount_syp||0);
      const wallet = String(b.wallet||'').trim();
      if(!orderId) return bad('order_id required');
      if(!/^[a-f0-9]{32}$/i.test(code)) return bad('invalid_code');
      const parts = [
        '🔔 <b>كود تحويل جديد</b>',
        `#${orderId}`,
        wallet? ('محفظة: <code>'+wallet+'</code>') : null,
        amtUsd? ('USD: <b>$'+amtUsd.toFixed(2)+'</b>') : null,
        syp? ('SYP: <b>'+syp.toLocaleString('en-US')+'</b>') : null,
        'الكود: <code>'+code+'</code>'
      ].filter(Boolean);
      const msg = parts.join('\n');
      const sent = await tg(msg);
      return ok({ok:true, notified: sent.ok===true});
    }
    return bad('unknown');
  }catch(err){ return json(500,{ok:false,error:String(err)}) }
};
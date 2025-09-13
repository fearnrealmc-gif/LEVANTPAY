/**
 * Netlify Function: telegram
 * Supports two modes:
 *  1) Path mode:   /.netlify/functions/telegram/<method>   (body forwarded as JSON)
 *  2) JSON mode:   { "method": "sendMessage", "params": {...} }
 * Env:
 *  - BOT_TOKEN (required)
 *  - ALLOWED_ORIGINS (optional, comma-separated)
 *  - CLIENT_KEY (optional) -> require header X-Auth-Key
 */
const DEFAULT_ALLOWED = [
  "http://localhost:8888",
  "http://localhost:5173",
  "http://127.0.0.1:5500"
];

function parseAllowedOrigins(env, origin) {
  const fromEnv = (env.ALLOWED_ORIGINS || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  const allowNetlify = (origin && origin.endsWith(".netlify.app")) ? [origin] : [];
  return [...new Set([...DEFAULT_ALLOWED, ...fromEnv, ...allowNetlify])];
}

function corsHeaders(origin, allowed) {
  const allow = (origin && allowed.includes(origin)) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, X-Auth-Key",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

exports.handler = async (event, context) => {
  const origin = event.headers?.origin || "";
  const allowed = parseAllowedOrigins(process.env, origin);
  const headers = corsHeaders(origin, allowed);

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  // Optional shared secret
  const requiredKey = process.env.CLIENT_KEY;
  if (requiredKey) {
    const incoming = event.headers["x-auth-key"] || event.headers["X-Auth-Key"] || event.headers["x-auth-key"];
    if (!incoming || incoming !== requiredKey) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized: bad X-Auth-Key" }) };
    }
  }

  const token = process.env.BOT_TOKEN;
  if (!token) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing BOT_TOKEN env var" }) };
  }

  // Determine method (path or body)
  let methodFromPath = "";
  try {
    const parts = (event.path || "").split("/").filter(Boolean);
    const idx = parts.indexOf("telegram");
    if (idx >= 0 && parts[idx + 1]) methodFromPath = parts[idx + 1];
  } catch (_) {}

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }

  let method = methodFromPath || body.method || "sendMessage";
  let params = body.params || body || {};

  try {
    const tgUrl = `https://api.telegram.org/bot${token}/${method}`;
    const tgResp = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    const data = await tgResp.json().catch(()=>({}));

    if (!tgResp.ok || data.ok === false) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Telegram API error", method, telegram: data }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method, result: data.result }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
};
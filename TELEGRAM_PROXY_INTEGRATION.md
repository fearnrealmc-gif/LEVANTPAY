# Telegram Proxy Integration
- Added: `netlify/functions/telegram.js`
- Updated/created: `netlify.toml`
- Replaced direct Telegram URLs in ~0 file(s) (best-effort)
- Patched service worker(s) to ignore the function route if present

## Netlify environment (required)
- `BOT_TOKEN` = your bot token
- `ALLOWED_ORIGINS` = https://lucent-bunny-f74a75.netlify.app
- `CLIENT_KEY` = optional shared secret (if set, send via `X-Auth-Key`)

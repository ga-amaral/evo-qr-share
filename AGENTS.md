# Connect Evo

## Dev Commands
- `npm install` - Install dependencies
- `npm run dev` - Start dev server (Vite)
- `npm run build` - Production build

## Required Setup
Create `.env` at root with:
```
VITE_SUPABASE_URL=https://supabase-evo.portfolioshowcase.tech
VITE_SUPABASE_ANON_KEY=<your-key>
VITE_EVO_API_URL=http://<VPS_IP>:8080
VITE_EVO_API_KEY=<your-key>
```

## Architecture
- Single-page React + Vite app
- Entry: `src/main.jsx`
- Auth: Supabase (`src/lib/supabase.js`)
- WhatsApp API: Evolution API (`src/lib/evo.js`)
- No tests configured
- No lint/typecheck configured
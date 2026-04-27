# Byl Client + API

This project contains:
- Frontend: React + Vite (`/`)
- Backend: Express + MongoDB (`/backend`)

## Domain Setup (`byl.mn`)

To make users access the site from `https://byl.mn`:

1. Deploy backend and frontend together on the same server.
2. Build frontend:
   - `npm run build`
3. Start backend in production:
   - `cd backend`
   - `npm start`
4. Point DNS:
   - `A` record: `@` -> your server IP
   - `CNAME` record: `www` -> `byl.mn`
5. Put Nginx/Cloudflare in front for HTTPS and route traffic to backend port.

Backend now serves `../dist` in production, so opening `https://byl.mn` loads the React app directly.

## Environment Variables

### Frontend (`.env.production`)
- `VITE_API_URL=https://byl.mn`

If omitted in production, frontend automatically uses the current domain (`window.location.origin`).

### Backend (`backend/.env`)
- `PORT=5000`
- `MONGODB_URI=...`
- `CORS_ORIGINS=https://byl.mn,https://www.byl.mn`
- `BYL_API_BASE_URL=https://byl.mn/api/v1`
- `BYL_SMS_API_URL=https://byl.mn/api/v1/send`

If `CORS_ORIGINS` is omitted, it defaults to:
- `https://byl.mn`
- `https://www.byl.mn`
- `http://localhost:5173`
- `http://localhost:3000`

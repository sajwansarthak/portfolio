# Sarthak Sajwan — Portfolio

Personal portfolio website. The frontend is plain HTML/CSS/JS hosted on **Vercel**; the backend is an
Express API on **Render** that handles the contact form (stores messages in MongoDB and emails them).

```
frontend/   static site  → Vercel
backend/    Express API  → Render  (render.yaml)
```

## Run locally

```bash
# backend
cd backend && cp .env.example .env   # fill in values
npm install && npm run dev            # http://localhost:5000

# frontend (in another terminal)
cd frontend && python3 -m http.server 8000
```

For local testing set `API_URL` in `frontend/js/config.js` to `http://localhost:5000`.

## API

| Method | Path           | Description                                   |
| ------ | -------------- | --------------------------------------------- |
| GET    | `/api/health`  | Health check (used by Render)                 |
| POST   | `/api/contact` | `{ name, email, message }` → store + email    |

Contact submissions are validated, rate-limited (5 per IP / 15 min) and protected by a honeypot field.
If the API is unreachable the frontend falls back to opening the visitor's email app.

## Deploy

### 1. Backend → Render
1. Render dashboard → **New → Blueprint** → connect this repo (it reads `render.yaml`).
2. Fill in the environment variables:
   - `MONGODB_URI` — MongoDB Atlas connection string (allow access from `0.0.0.0/0` in Atlas Network Access)
   - `SMTP_USER` / `SMTP_PASS` — Gmail address + [App Password](https://myaccount.google.com/apppasswords)
   - `CONTACT_TO` — where messages are delivered
   - `ALLOWED_ORIGINS` — your Vercel URL (set after step 2)
3. Check `https://<service>.onrender.com/api/health` returns `{"status":"ok"}`.

### 2. Frontend → Vercel
1. Put the Render URL in `frontend/js/config.js` (`API_URL`) and push.
2. Vercel → **Add New → Project** → import this repo.
3. **Root Directory: `frontend`**, Framework Preset: **Other**, no build command → Deploy.
4. Copy the Vercel URL into Render's `ALLOWED_ORIGINS` (Render redeploys automatically).

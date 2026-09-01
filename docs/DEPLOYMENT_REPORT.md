# Deployment Report

**Classification:** Public-SLIIT  

**Project:** SLIIT AF — EcoMart (Full-stack: Node/Express + MongoDB + React/Vite)

Use this document to record evidence of successful deployment for submission. Replace placeholder text and add screenshots.

---

## 1. Summary

| Item | Value |
|------|--------|
| Deployment date | _YYYY-MM-DD_ |
| Backend platform | Render — [`sliit-af-backend.onrender.com`](https://sliit-af-backend.onrender.com) |
| Frontend platform | Vercel — [`sliit-af-backend.vercel.app`](https://sliit-af-backend.vercel.app) |
| Database | _MongoDB Atlas (or other) — fill in_ |

---

## 2. Live URLs

| Service | URL |
|---------|-----|
| **Backend API (base)** | [`https://sliit-af-backend.onrender.com`](https://sliit-af-backend.onrender.com) |
| **Health** | [`https://sliit-af-backend.onrender.com/health`](https://sliit-af-backend.onrender.com/health) |
| **Swagger UI** | [`https://sliit-af-backend.onrender.com/api-docs`](https://sliit-af-backend.onrender.com/api-docs) |
| **OpenAPI JSON** | [`https://sliit-af-backend.onrender.com/api-docs.json`](https://sliit-af-backend.onrender.com/api-docs.json) |
| **Frontend (React on Vercel)** | [`https://sliit-af-backend.vercel.app`](https://sliit-af-backend.vercel.app) |

Keep this table in sync with **[README.md](../README.md)** (Live URLs section).

---

## 3. Evidence of successful deployment

Source files live in the repository **`images/`** folder at the project root. Below they are embedded for markers / GitHub / VS Code preview. _Edit the captions under each image if a screenshot maps to a different check._

### 3.1 Backend health check

- **Request:** `GET https://sliit-af-backend.onrender.com/health`
- **Expected:** JSON with `status: "success"` and a timestamp.

**Evidence (screenshot 1):**

![Backend health check — GET /health response](../images/Screenshot%202026-04-11%20171018.png)

_File:_ [`images/Screenshot 2026-04-11 171018.png`](../images/Screenshot%202026-04-11%20171018.png)

### 3.2 Backend root or API client

- **Request:** `GET https://sliit-af-backend.onrender.com/` (or related API smoke test)
- **Expected:** JSON confirming the API is reachable.

**Evidence (screenshot 2):**

![Backend root or API evidence](../images/Screenshot%202026-04-11%20171139.png)

_File:_ [`images/Screenshot 2026-04-11 171139.png`](../images/Screenshot%202026-04-11%20171139.png)

### 3.3 Frontend or full-stack smoke test

**Evidence (screenshot 3):** _(e.g. deployed frontend home, Swagger UI, or checkout flow — adjust caption to match your capture.)_

![Deployed frontend or application evidence](../images/Screenshot%202026-04-11%20171446.png)

_File:_ [`images/Screenshot 2026-04-11 171446.png`](../images/Screenshot%202026-04-11%20171446.png)

### 3.4 End-to-end smoke test (checklist)

- [ ] User can register / login via deployed frontend.
- [ ] Products list loads from deployed API.
- [ ] Authenticated flow (cart / orders) works against deployed API.

**Notes:** _Add any extra evidence paths here, e.g. `images/your-extra-shot.png`, using the same `../images/...` pattern from this `docs/` folder._

---

## 4. Configuration checklist (no secrets in this file)

- [ ] `MONGODB_URI` points to production cluster (Atlas or other).
- [ ] `JWT_SECRET` is a strong random value, not the development default.
- [ ] `PORT` matches platform expectation (or uses platform-provided `PORT`).
- [ ] CORS `origin` in `Server.js` includes the **deployed frontend URL**.
- [ ] Frontend `VITE_API_URL` points to **deployed backend** `/api` base.

---

## 5. Issues encountered & resolutions

_Use this section during deployment to log problems (e.g. CORS, cold start, file uploads on serverless) and how you fixed them._

| Issue | Resolution |
|-------|------------|
| _…_ | _…_ |

---

## 6. Team / module ownership (optional)

| Area | Main paths |
|------|------------|
| Auth & admin (Tudakshana) | `routes/Tudakshana`, `controllers/Tudakshana` |
| Products (Lakna) | `routes/Lakna`, `controllers/Lakna` |
| Cart, orders, payments (Thaveesha) | `routes/Thaveesha`, `controllers/Thaveesha` |
| Reviews (Senara) | `routes/Senara`, `controllers/Senara` |

---

## 7. What to add or verify before submission

Use this as a final checklist beyond “links in Markdown”:

| Item | Why it matters |
|------|----------------|
| **Correct frontend URL everywhere** | README + this report must show the **real** SPA URL. The API URL alone is not enough if markers expect a working shop UI. |
| **`Server.js` CORS** | `origin` array must include your **exact** frontend origin (scheme + host, no trailing slash), e.g. `https://your-app.vercel.app`. Redeploy backend after editing. |
| **Frontend `VITE_API_URL`** | On Vercel/Netlify, set env to `https://sliit-af-backend.onrender.com/api` and **trigger a new build**. |
| **MongoDB Atlas Network Access** | Allow your Render outbound IPs (or `0.0.0.0/0` only if acceptable for the module). |
| **Secrets only on the host** | `JWT_SECRET`, `MONGODB_URI` in Render/Vercel env — **never** committed in Git. |
| **Screenshots match claims** | At least: `/health`, frontend home (or login), and one API flow (e.g. products or Swagger **Authorize** + a call). |
| **Swagger “Try it out”** | Optional evidence: screenshot of a successful authenticated request from `/api-docs`. |
| **Repository link** | If submitting via LMS, include the **public GitHub URL** in the report or cover page. |
| **Group / student IDs** | Add names, indices, and module code where your rubric asks for them (cover sheet or top of this file). |

### Optional (stronger submission)

- Short **screen recording** (GIF or link) of login → browse products → cart.  
- **Render / Vercel dashboard** screenshot showing last successful deploy.  
- **Atlas** screenshot showing cluster + database name (hide connection string).

# SLIIT AF — EcoMart Full-Stack Project

**Classification:** Public-SLIIT  

Academic Framework group project: **REST API** (Express.js + MongoDB) and **SPA** (React + Vite) for an eco-marketplace (products, cart, orders, payments, reviews, admin).

| Document | Purpose |
|----------|---------|
| This `README.md` | Setup, API reference, deployment overview |
| [docs/DEPLOYMENT_REPORT.md](docs/DEPLOYMENT_REPORT.md) | Deployment evidence template (URLs, screenshots checklist) |
| [docs/TESTING_INSTRUCTIONS.md](docs/TESTING_INSTRUCTIONS.md) | Unit, integration, performance testing guidance |

---

## Table of contents

1. [Tech stack](#tech-stack)  
2. [Repository structure](#repository-structure)  
3. [Setup instructions](#setup-instructions)  
4. [Environment variables](#environment-variables)  
5. [API endpoint documentation](#api-endpoint-documentation)  
6. [Deployment](#deployment)  
7. [Testing](#testing)  
8. [Additional documentation](#additional-documentation)

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Backend | Node.js, Express 5, Mongoose, JWT, Multer, bcryptjs |
| Database | MongoDB |
| Frontend | React 19, Vite 7, React Router, Tailwind CSS, Axios |
| Tests | Jest, Supertest |

---

## Repository structure

```
SLIIT_AF_BACKEND/
├── Server.js                 # App entry, middleware, route mounting
├── config/                   # DB connection
├── controllers/              # By member: Lakna, Senara, Thaveesha, Tudakshana
├── models/
├── routes/
├── middleware / utils/       # Auth helpers
├── uploads/                  # Product images (local dev)
├── tests/                    # Jest tests
├── load-tests/               # Artillery load test YAML
├── scripts/                  # Seed / admin scripts
├── frontend/                 # Vite React app
└── docs/                     # Deployment & testing reports
```

---

## Setup instructions

### Prerequisites

- **Node.js** (LTS recommended) and **npm**
- **MongoDB** running locally **or** a **MongoDB Atlas** connection string

### i. Backend — step-by-step

1. **Clone** the repository and open the backend root:

   ```bash
   cd SLIIT_AF_BACKEND
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   ```bash
   copy .env.example .env    # Windows
   # cp .env.example .env    # macOS / Linux
   ```

   Edit `.env`: set `MONGODB_URI` (or use default local URI in code), `JWT_SECRET`, and optional `PORT` (default `5000`).

4. **Seed admin (optional):**

   ```bash
   npm run seed-admin
   ```

5. **Start the API:**

   ```bash
   npm run dev
   ```

   API base: `http://localhost:5000` (or your `PORT`).  
   Health check: `GET http://localhost:5000/health`

### ii. Frontend — step-by-step

1. **Open frontend folder:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment:** create `frontend/.env` if needed:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run dev server:**

   ```bash
   npm run dev
   ```

   Default Vite URL: `http://localhost:5173`

5. **Production build (local check):**

   ```bash
   npm run build
   npm run preview
   ```

### iii. CORS (local vs deployed)

`Server.js` lists allowed origins (e.g. `http://localhost:5173`). After deployment, **add your deployed frontend origin** to `corsOptions.origin` and redeploy the backend.

---

## Environment variables

**Do not commit real secrets.** Use `.env` locally and your host’s secret manager in production.

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port (default `5000`) |
| `MONGODB_URI` | Yes* | MongoDB connection string (`config/db.js`; falls back to local if unset) |
| `JWT_SECRET` | Yes | Secret for signing JWTs (use a strong value in production) |
| `NODE_ENV` | No | Set `test` when running Jest so the server does not bind a port |

\*Required for non-local / production deployments.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Base API URL ending in `/api` (default in code often `http://localhost:5000/api`) |

---

## API endpoint documentation

**Base URL:** `{BACKEND_URL}` (e.g. `http://localhost:5000`)

**Authentication:** Unless marked *Public*, protected routes expect:

```http
Authorization: Bearer <JWT>
```

JWT is returned on successful `POST /api/auth/login` and `POST /api/auth/register` (see controller responses for exact JSON shape).

**Common response patterns:**

- Success: `{ success: true, ... }` or resource JSON  
- Error: `{ success: false, message: "..." }` or `{ status: "error", message: "..." }`

### Swagger UI (interactive docs)

With the backend running:

| Resource | URL |
|----------|-----|
| **Swagger UI** | `http://localhost:{PORT}/api-docs` |
| **OpenAPI JSON** | `http://localhost:{PORT}/api-docs.json` |

The source spec is **`swagger/openapi.yaml`** (OpenAPI 3.0). In **Authorize**, use `Bearer <your_jwt>` (or paste the raw token, depending on Swagger UI version).

---

### System

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | API welcome / version |
| GET | `/health` | Public | Health check |
| GET | `/uploads/...` | Public | Static uploaded files |

---

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Register user |
| POST | `/login` | Public | Login (optional `role` in body for role-specific login) |
| GET | `/profile` | User | Get profile |
| PUT | `/profile` | User | Update profile |
| PUT | `/password` | User | Change password |

---

### Admin (users & analytics) — `/api/admin`

**Auth:** JWT + **admin** role (`protect` + `isAdmin`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | User statistics |
| GET | `/analytics` | Dashboard analytics |
| GET | `/users` | List users |
| GET | `/users/:id` | Get user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| PATCH | `/users/:id/toggle-status` | Toggle active status |
| GET | `/customers/stats` | Customer stats |
| GET | `/customers` | List customers |
| GET | `/customers/:id/summary` | Customer summary |

---

### Products — `/api/products`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Open* | Create product (`multipart/form-data`, field `image`) |
| GET | `/` | Public | List/filter products |
| GET | `/:id` | Public | Get product by ID |
| PUT | `/:id` | Open* | Update product (optional `image`) |
| DELETE | `/:id` | Open* | Delete product |
| GET | `/category/:category` | Public | By category |
| GET | `/certification/:certification` | Public | By certification |
| POST | `/:id/reviews` | Public | Add review on product (legacy path) |

\*Current codebase mounts write routes without JWT; **tighten with admin middleware before production.**

---

### Cart — `/api/cart`

**Auth:** Any authenticated user (`protect`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get current user’s cart |
| POST | `/add` | Add line item |
| PUT | `/` | Update quantity |
| DELETE | `/item/:itemId` | Remove line item |

---

### Orders (customer) — `/api/orders`

**Auth:** User (`protect`).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create order from items (clears cart, adjusts stock) |
| GET | `/my-orders` | List my orders |
| GET | `/:id` | Get order by ID |
| PATCH | `/:id/cancel` | Cancel order (if allowed) |

---

### Admin orders — `/api/admin/orders`

**Auth:** JWT + **admin**.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Paginated all orders (query params per controller) |
| GET | `/:id` | Admin order detail |
| PATCH | `/:id/status` | Update order status |

---

### Payments (Tudakshana) — `/api/payments`

**Auth:** User (`protect`). Implementation: `routes/Tudakshana/paymentRoutes.js`, `controllers/Tudakshana/paymentController.js`, `models/Tudakshana/Payment.js` (orders remain `models/Thaveesha/Order.js`).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/process-card` | Card payment for order |
| POST | `/process-cod` | Cash on delivery confirmation |
| GET | `/order/:orderId` | Payment by order |
| GET | `/:paymentId` | Payment by ID |
| POST | `/:paymentId/refund` | Refund |

---

### Reviews (Senara) — `/api/senara/reviews`

**Auth:** `protect` on router; roles vary by route (`restrictTo`).

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | admin | All reviews |
| DELETE | `/admin/:id` | admin | Admin delete review |
| GET | `/my-reviews` | customer, admin | My reviews |
| GET | `/check/:productId` | customer, admin | Check if can review |
| GET | `/product/:productId` | customer, admin | Reviews for product |
| POST | `/` | customer | Create review |
| GET | `/:id` | customer, admin | Get review |
| PATCH | `/:id` | customer | Update review |
| DELETE | `/:id` | customer, admin | Delete review |

---

### Example requests

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "yourpassword" }
```

**Authenticated call**

```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Create order (simplified)**

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [{ "productId": "<id>", "quantity": 1 }],
  "shippingAddress": "Full address",
  "phone": "+94771234567",
  "notes": ""
}
```

---

## Deployment

### Backend deployment — platform and setup (typical options)

Suitable platforms: **Render**, **Railway**, **Fly.io**, **Vercel** (serverless constraints apply), **AWS EC2/Elastic Beanstalk**, etc.

**General steps:**

1. Push code to GitHub (or GitLab).
2. Create a new **Web Service** / **Node** app on the platform.
3. **Build command:** `npm install` (or default install).
4. **Start command:** `npm start` (runs `node Server.js`).
5. Set **environment variables** on the host: `MONGODB_URI`, `JWT_SECRET`, `PORT` (if required by host).
6. Ensure **MongoDB Atlas** allows inbound from the host IPs (or `0.0.0.0/0` for demos — understand security trade-offs).
7. Update **CORS** in `Server.js` with the **production frontend URL**.
8. Redeploy after config changes.

**File uploads:** Local `uploads/` may not persist on ephemeral serverless disks — use **cloud storage** (S.g. S3, Cloudinary) for production images if required.

### Frontend deployment — platform and setup (typical options)

Suitable platforms: **Vercel**, **Netlify**, **Cloudflare Pages**.

**General steps:**

1. Connect the repo; set **root directory** to `frontend` if the monorepo is not at repo root.
2. **Build command:** `npm run build`
3. **Output directory:** `dist` (Vite default)
4. Set **`VITE_API_URL`** to your **deployed API** base including `/api`, e.g. `https://sliit-af-backend.onrender.com/api`
5. Trigger deploy; verify the app loads and API calls succeed (check browser Network tab).

### Environment variables in production (no secrets in Git)

| Location | Variables |
|----------|-----------|
| Backend host | `MONGODB_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV=production` |
| Frontend host | `VITE_API_URL` |

### Live URLs

| Resource | URL |
|----------|-----|
| **Deployed backend API (base)** | [`https://sliit-af-backend.onrender.com`](https://sliit-af-backend.onrender.com) |
| **Health check** | [`https://sliit-af-backend.onrender.com/health`](https://sliit-af-backend.onrender.com/health) |
| **Swagger UI** | [`https://sliit-af-backend.onrender.com/api-docs`](https://sliit-af-backend.onrender.com/api-docs) |
| **OpenAPI JSON** | [`https://sliit-af-backend.onrender.com/api-docs.json`](https://sliit-af-backend.onrender.com/api-docs.json) |
| **Deployed frontend (Vercel)** | [`https://sliit-af-backend.vercel.app`](https://sliit-af-backend.vercel.app) |

**Production frontend env:** On Vercel, set **`VITE_API_URL`** to `https://sliit-af-backend.onrender.com/api` and redeploy. **`Server.js`** CORS must include `https://sliit-af-backend.vercel.app` (already listed for this project).

### Screenshots / evidence

Deployment captures are stored under **`images/`** at the project root and **embedded** in **[docs/DEPLOYMENT_REPORT.md](docs/DEPLOYMENT_REPORT.md)** (Markdown image links, e.g. `../images/Screenshot%20....png`). Add or replace PNGs there and update the report captions to match what each screenshot shows (health check, frontend, Swagger, etc.).

---

## Testing

- **Full testing guide:** [docs/TESTING_INSTRUCTIONS.md](docs/TESTING_INSTRUCTIONS.md) — includes **§1.1 Team member ownership** (four developers: Tudakshana, Lakna, Thaveesha, Senara) mapped to **functions and test files / commands**.

- **Quick run (backend root):**

  ```bash
  npm test
  ```

- **Per-member Jest commands** (from repo root):

  | Module | Command |
  |--------|---------|
  | Lakna (products) | `npm run test:lakna` |
  | Thaveesha (cart, orders) | `npm run test:thaveesha` |
  | Senara (reviews) | `npm run test:senara` |
  | Tudakshana (payments) | `npm run test:tudakshana` |
  | Tudakshana (auth, admin) | Manual / **Swagger** `/api-docs` or Postman (see testing doc); no Jest suite for auth yet |

- **Load testing (Artillery):** `load-tests/*.yml` — `npm run load-test:smoke` (quick), `npm run load-test` (full public scenario), `npm run load-test:auth` (needs `LOAD_TEST_EMAIL` / `LOAD_TEST_PASSWORD`). Details: [docs/TESTING_INSTRUCTIONS.md](docs/TESTING_INSTRUCTIONS.md) §4.

Covers:

- **Unit tests** — models, helpers, services
- **Integration tests** — HTTP routes with Supertest
- **Load tests** — Artillery (`npm run load-test`, etc.)
- **Test environment** — `NODE_ENV=test`, test `MONGODB_URI`

---

## Additional documentation

- `PAYMENT_API_TESTING_GUIDE.md` — Payment flows  
- `PAYMENT_SYSTEM_IMPLEMENTATION.md` — Payment design notes  
- `frontend/README.md` — Vite template notes (if present)

---

## License / academic use

This project is maintained for **SLIIT** coursework (**Public-SLIIT**). Adapt deployment URLs, screenshots, and secrets handling per your module submission requirements.

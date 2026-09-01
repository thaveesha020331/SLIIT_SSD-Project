# Testing Instruction Report

**Classification:** Public-SLIIT  

**Project:** SLIIT AF Backend (Jest + Supertest)

---

## 1. Overview

Automated tests live under the repository `tests/` directory. The test runner is **Jest** with **Node** as the environment. API integration tests use **Supertest** against the exported Express `app` (server is not started when `NODE_ENV=test`).

### 1.1 Team member ownership — testing by function (4 members)

Each developer owns **features** under their module folder and should **run, fix, and extend** the tests that cover that area (plus manual checks where no Jest suite exists yet).

| Member / module | Primary function | Main code paths | What to test (automated + manual) |
|-----------------|------------------|-----------------|-----------------------------------|
| **Tudakshana** | **Auth** (register, login, JWT), **profile & password**; **Admin** dashboard; **Payments** (card, COD, refund) at `/api/payments` | `routes/Tudakshana`, `controllers/Tudakshana`, `models/Tudakshana` (incl. `User.js`, `Payment.js`), `utils/Tudakshana/authMiddleware.js` | **Automated:** `tests/Tudakshana/payment.test.js` — COD, card (with mocked gateway randomness), get-by-order/id, refund. **Command:** `npm run test:tudakshana`. **Manual / Swagger:** auth & admin as before; payments also in **`PAYMENT_API_TESTING_GUIDE.md`**. *(Future: `auth.test.js` / `admin.test.js`.)* |
| **Lakna** | **Products** (CRUD, list/filter, category, certification), **image upload**, eco-impact helpers | `routes/Lakna`, `controllers/Lakna`, `models/Lakna` | **Automated:** `tests/Lakna/helpers.test.js`, `validators.test.js`, `productModel.test.js`, `productController.test.js`, **`productRoutes.test.js`** (HTTP), `imageUploadService.test.js`, `ecoImpactService.test.js`. **Command:** `npm run test:lakna` (or `npm test -- tests/Lakna`). |
| **Thaveesha** | **Cart**, **customer orders**, **admin order status** | `routes/Thaveesha`, `controllers/Thaveesha`, `models/Thaveesha` | **Automated:** `tests/Thaveesha/cartOrder.test.js`, `adminOrder.test.js`. **Command:** `npm run test:thaveesha`. |
| **Senara** | **Reviews** (create/update/delete, by product, admin list/delete, “can review” checks) | `routes/Senara`, `controllers/Senara` | **Automated:** `tests/Senara/review.test.js`. **Command:** `npm run test:senara`. Uses authenticated **customer/admin** roles as per route `restrictTo`. |

**Submission tip:** Add each student’s **name** and **student ID** next to their module on the assignment cover page or duplicate a one-line “Tested by: …” note under your section in this document.

**Shared:** All members should run **`npm test`** before merging; **frontend** UI checks are `cd frontend && npm run lint` (and manual browser testing for your flows).

---

## 2. How to run unit tests

### 2.1 Prerequisites

- Node.js (LTS recommended, aligned with `package.json` engines if specified).
- Install dependencies from the **repository root**:

```bash
npm install
```

### 2.2 Run all tests

From the **backend project root** (`SLIIT_AF_BACKEND`):

```bash
npm test
```

This runs Jest with `jest.config.cjs` and matches `tests/**/*.test.js`.

### 2.3 Run tests by area

```bash
# Lakna (products — all tests in tests/Lakna/)
npm run test:lakna

# Thaveesha (cart, orders, admin orders)
npm run test:thaveesha

# Senara (reviews)
npm run test:senara

# Tudakshana (payments — /api/payments)
npm run test:tudakshana
```

### 2.4 Run a single file

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/Lakna/productModel.test.js --forceExit
```

### 2.5 What counts as “unit” in this repo

- **Model / helper / validator** tests (e.g. `productModel.test.js`, `validators.test.js`, `helpers.test.js`).
- **Service-level** tests where external I/O is mocked or isolated (e.g. `ecoImpactService.test.js`, `imageUploadService.test.js`).

---

## 3. Integration testing — setup and execution

### 3.1 Purpose

Integration tests verify HTTP routes and controller behaviour using **Supertest** (`request(app)`), typically with an in-memory or test MongoDB URI.

### 3.2 Environment configuration

- Tests set `process.env.NODE_ENV = 'test'` where required so `Server.js` does **not** call `listen()`.
- Set `MONGODB_URI` or `MONGODB_URI` (see `config/db.js`) to a **dedicated test database** when running integration tests that hit the database — **never** use production data.

Example (PowerShell):

```powershell
$env:NODE_ENV="test"
$env:MONGODB_URI="mongodb://127.0.0.1:27017/sliit_af_test"
npm test
```

Example (bash):

```bash
export NODE_ENV=test
export MONGODB_URI=mongodb://127.0.0.1:27017/sliit_af_test
npm test
```

### 3.3 Representative integration test files

| File | Focus |
|------|--------|
| `tests/Lakna/productRoutes.test.js` | Product HTTP API |
| `tests/Thaveesha/cartOrder.test.js` | Cart / order flows |
| `tests/Thaveesha/adminOrder.test.js` | Admin order API |
| `tests/Tudakshana/payment.test.js` | Payments (card, COD, refund) |
| `tests/Senara/review.test.js` | Review API |

### 3.4 Execution

Same as section 2: `npm test` runs integration suites together with unit suites.

---

## 4. Load testing — Artillery

This project includes **[Artillery](https://www.artillery.io/)** (`artillery` in `devDependencies`). Scripts live in **`load-tests/`**.

### 4.1 Install

From the backend root (after `npm install`), the CLI is available as `npx artillery`.

### 4.2 Scripts (`package.json`)

| Command | Purpose |
|---------|---------|
| `npm run load-test:smoke` | ~10s, low rate — quick sanity check |
| `npm run load-test` | ~80s — warm-up then sustained load on **public** routes |
| `npm run load-test:auth` | Login + `GET /api/auth/profile` (needs env vars, see below) |
| `npm run load-test:report` | Writes JSON metrics to `load-tests/report.json` (gitignored) |
| `npm run load-test:report:html` | Opens HTML report from that JSON |

### 4.3 Before you run

1. Start the API locally (`npm run dev` / `npm start`) **or** point Artillery at a deployed URL.
2. Override base URL without editing YAML:

```bash
npx artillery run load-tests/public-api.yml -t https://sliit-af-backend.onrender.com
```

PowerShell example:

```powershell
npx artillery run load-tests/smoke.yml -t http://127.0.0.1:5000
```

### 4.4 Authenticated scenario

`load-tests/authenticated.yml` calls `POST /api/auth/login` then `GET /api/auth/profile`. Set credentials in the environment:

**bash**

```bash
export LOAD_TEST_EMAIL="customer@example.com"
export LOAD_TEST_PASSWORD="yourpassword"
npm run load-test:auth
```

**PowerShell**

```powershell
$env:LOAD_TEST_EMAIL = "customer@example.com"
$env:LOAD_TEST_PASSWORD = "yourpassword"
npm run load-test:auth
```

Optional: `npx artillery run load-tests/authenticated.yml --dotenv path/to/.env`

### 4.5 What is exercised

- **Public:** `GET /health`, `GET /api/products` (read-heavy, no JWT).
- **Auth:** `POST /api/auth/login`, `GET /api/auth/profile`.

Tune **`phases`** (`duration`, `arrivalRate`, `maxVusers`) in the YAML files for coursework limits. Prefer **staging** or a dedicated environment for aggressive load; avoid hammering shared production without agreement.

### 4.6 Submission / evidence

Save Artillery’s final **Summary report** from the terminal (or run `npm run load-test:report` then `npm run load-test:report:html`) and attach **p95/p99**, **request rate**, and **error counts** to your report.

---

## 5. Testing environment configuration summary

| Variable | Purpose in tests |
|----------|------------------|
| `NODE_ENV` | Set to `test` to avoid binding HTTP server in `Server.js`. |
| `MONGODB_URI` | Test database connection string (local or Atlas test cluster). |
| `JWT_SECRET` | Must match app expectations if tests issue or verify JWTs. |

**Security:** Do not commit real Atlas passwords or production secrets. Use `.env` locally and CI secrets in pipelines.

---

## 6. Linting (frontend)

From `frontend/`:

```bash
npm run lint
```

---

## 7. Test report output

Jest is configured with a custom summary reporter at `tests/jest-summary-reporter.cjs`. After `npm test`, review the console output for pass/fail counts and fix failing suites before release or deployment.

# Portfolio Backend — Production & Integration Final Report

**Date:** September 13, 2026  
**Backend Repository:** [portfolio-backend](https://github.com/profKarim22/portfolio-backend)  
**Backend Production URL:** `https://portfolio-backend-ashen-eta.vercel.app`  
**Frontend Production URL:** `https://portfolio-8fqx.vercel.app`  

---

## Executive Summary

The standalone portfolio backend has been audited, hardened, optimized for Vercel Serverless runtime, and validated against the production React frontend.

Key fixes implemented:
1. **Resolved Production CORS Blocking:** The production frontend (`https://portfolio-8fqx.vercel.app`) was previously blocked with a 500 error because `FRONTEND_URL` on Vercel only defaulted to localhost. CORS configuration now safely permits the production frontend, localhost development ports, and handles preflight `OPTIONS` requests with credentials.
2. **Reverse Proxy Configuration (`trust proxy`):** Enabled `app.set('trust proxy', 1)` to allow `express-rate-limit` to properly recognize client IPs behind Vercel's edge proxy.
3. **Optimized Serverless MongoDB Connection:** Added promise caching and fail-fast timeouts (`serverSelectionTimeoutMS: 5000`) in `src/config/db.ts` to prevent redundant connection overhead and avoid hanging lambdas.
4. **Decoupled Health Endpoint:** Made `/api/health` independent of MongoDB availability so uptime monitors receive instant 200 responses even during database cold starts or maintenance.
5. **Database Seed Safety Verified:** Verified that `scripts/seed.ts` is strictly idempotent, non-destructive, and will not wipe or overwrite existing data.

---

## 1. System Architecture & Vercel Serverless

### Handler Architecture
- **Development Entry:** `src/server.ts` handles local execution and calls `app.listen()`.
- **Production Entry:** `api/index.ts` exports the serverless handler:
  ```typescript
  export default async function handler(req: any, res: any)
  ```
- **Connection Lifecycle:** The database connection is awaited before passing requests to Express, caching the connection promise across warm lambda invocations.
- **Routing:** Handled via `vercel.json`:
  ```json
  {
    "version": 2,
    "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
    "routes": [{ "src": "/api/(.*)", "dest": "api/index.ts" }]
  }
  ```

---

## 2. Live Verification Results

Live verification executed directly against `https://portfolio-backend-ashen-eta.vercel.app`:

| Endpoint | HTTP Status | Response Summary | CORS Header |
| :--- | :--- | :--- | :--- |
| `GET /api/health` | `200 OK` | `{"success":true,"status":"ok"}` | Enabled |
| `GET /api/v1/projects` | `200 OK` | `{"success":true,"data":[]}` | `https://portfolio-8fqx.vercel.app` |
| `GET /api/v1/profile` | `200 OK` | `{"success":true,"data":null}` | `https://portfolio-8fqx.vercel.app` |
| `GET /api/v1/skills` | `200 OK` | `{"success":true,"data":null}` | `https://portfolio-8fqx.vercel.app` |
| `GET /api/v1/status` | `200 OK` | `{"success":true,"data":null}` | `https://portfolio-8fqx.vercel.app` |
| `OPTIONS /api/v1/projects` | `200 OK` | Allowed Methods/Headers returned | `https://portfolio-8fqx.vercel.app` |
| Unauthorized Origin | `500 Internal` | `{"success":false,"error":{...}}` | Rejected |

---

## 3. Database State & Seeding Guide

### Current Production State
- Vercel connects successfully to MongoDB Atlas.
- The collections currently contain 0 documents (which is why `/api/v1/projects` returns `[]`).

### Seed Safety Audit
- **Script:** `scripts/seed.ts`
- **Data Source:** `src/data/seedData.ts` (contains the 4 authentic projects: `algorithmic-storytelling`, `event-system`, `portfolio-site`, and `user-greeting`).
- **Destructive Operations:** None (`deleteMany({})`, `drop()`, and `dropDatabase()` are not used).
- **Safety Mechanism:** Requires explicit `--confirm` flag to execute inserts. Checks for existing records by `id` or document count before inserting.

### How to Populate Production MongoDB Atlas
Run the following command locally with your MongoDB Atlas connection string:
```bash
MONGODB_URI="<YOUR_PRODUCTION_ATLAS_URI>" npm run seed -- --confirm
```
*(Or update `MONGODB_URI` in `.env` and run `npm run seed -- --confirm`).*

---

## 4. Modified Files & Changelog

### 1. `src/app.ts`
- Added `app.set('trust proxy', 1);` for reverse proxy compatibility.
- Configured robust CORS:
  - Allowed default origins: `https://portfolio-8fqx.vercel.app`, `http://localhost:5173`, `http://localhost:3000`.
  - Normalized origins by stripping trailing slashes.
  - Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`.
  - Allowed headers: `Content-Type`, `Authorization`.
  - Enabled credentials and preflight `optionsSuccessStatus: 200`.

### 2. `src/config/db.ts`
- Implemented `cachedPromise` to avoid duplicate concurrent connection attempts.
- Added `serverSelectionTimeoutMS: 5000` to fail fast instead of hanging when Atlas is unreachable.
- Added fallback support for both `MONGODB_URI` and `MONGO_URI`.

### 3. `api/index.ts`
- Decoupled `/api/health` so that health checks return immediately without blocking on MongoDB connection.

### 4. `scripts/seed.ts`
- Added support for both `MONGODB_URI` and `MONGO_URI`.
- Added clean `await mongoose.disconnect()` before process termination.

---

## 5. Frontend Integration Contract

The React/Vite frontend should configure its API client as follows:

* **Base URL:**
  ```text
  https://portfolio-backend-ashen-eta.vercel.app
  ```
* **Endpoints:**
  * `GET /api/v1/projects`
  * `GET /api/v1/projects/:id`
  * `GET /api/v1/profile`
  * `GET /api/v1/skills`
  * `GET /api/v1/status`
* **Response Structure:**
  ```json
  {
    "success": true,
    "data": [...]
  }
  ```

# Portfolio Backend

A complete, production-ready RESTful Node.js + Express backend designed to support a dynamic React-based personal portfolio.

## Purpose

This backend replaces the original frontend-only static data (`defaultProjects.json`) and `localStorage` approach with a robust MongoDB database, providing a secure admin dashboard, dynamic real-time data for the API Terminal, and scalable management of portfolio projects and configuration.

## Architecture & Tech Stack

- **Node.js + Express.js**: High-performance HTTP server architecture.
- **TypeScript**: Statically typed codebase for superior developer experience and code safety.
- **MongoDB + Mongoose**: Document-oriented database suitable for flexible portfolio data.
- **Authentication**: JWT-based stateless authentication with `bcryptjs` password hashing.
- **Security**: Hardened via `helmet`, CORS configured, and API rate-limiting.
- **RESTful Design**: Versioned `/api/v1` structure with distinct public and protected admin domains.

## Directory Structure

```
portfolio-backend/
├── src/
│   ├── config/        # Database and system configuration
│   ├── controllers/   # Route handlers & logic
│   ├── middleware/    # Express middleware (Auth, Error handling)
│   ├── models/        # Mongoose ODM schemas
│   ├── routes/        # Express route definitions
│   ├── app.ts         # Express app initialization
│   └── server.ts      # Server entry point
├── scripts/
│   └── seed.ts        # Database hydration script
├── .env.example       # Example environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

## Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via MongoDB Atlas)

## Installation & Setup

1. **Clone the repository (or initialize it)**
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables:**
   Copy the example config and adjust as necessary:
   ```bash
   cp .env.example .env
   ```
   **Important Variables:**
   - `MONGODB_URI`: Connection string (e.g., `mongodb://127.0.0.1:27017/portfolio`)
   - `JWT_SECRET`: Generate a secure random string for production.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Credentials for your first administrator (used during seeding).

4. **Seed the Database:**
   To populate the backend with initial data (based on the original frontend `defaultProjects.json`):
   ```bash
   npm run seed
   ```
   *Note: This process is idempotent and will not duplicate existing projects.*

## Development Commands

- **Start Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Start Production Server:**
  ```bash
  npm start
  ```

## API Endpoints

### Public API (`/api/v1`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/v1/profile` | Retrieve core portfolio profile information |
| `GET` | `/api/v1/projects` | List all projects, ordered |
| `GET` | `/api/v1/projects/:id` | Get specific project by slug/id |
| `GET` | `/api/v1/skills` | Retrieve technical skills matrix |
| `GET` | `/api/v1/status` | Retrieve system status and modes |
| `GET` | `/api/v1/api-endpoints/:key` | Retrieve dynamic data used by the API Terminal |

### Admin API (`/api/v1/admin`) (Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login and receive JWT |
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/auth/me` | Verify token and get admin details |
| `POST` | `/api/v1/admin/projects` | Create a new project |
| `PUT` | `/api/v1/admin/projects/:id` | Update an existing project |
| `DELETE` | `/api/v1/admin/projects/:id` | Delete a project |
| `PATCH` | `/api/v1/admin/projects/reorder` | Update project ordering sequence |
| `PUT` | `/api/v1/admin/status` | Update global status mode |
| `PUT` | `/api/v1/admin/api-endpoints/:key` | Update dynamic terminal data |

## Testing via Postman / cURL
1. Ensure the server is running (`npm run dev`).
2. **Public Test:** `curl http://localhost:5000/api/v1/projects`
3. **Login:** Send a POST request to `/api/v1/auth/login` with `email` and `password`.
4. **Admin Action:** Copy the `token` from the response and include it as a Header: `Authorization: Bearer <your_token>` for any routes under `/api/v1/admin`.

## Frontend Integration Plan
To connect the existing React frontend to this backend later:
1. Remove `localStorage` fallback logic in `PortfolioContext.jsx`.
2. Replace static imports of `defaultProjects.json` with `fetch` calls or `axios` requests inside `useEffect` hooks.
3. Update the `AdminDashboard` to submit mutations via the REST API rather than React state.
4. Update `ApiTerminal.jsx` to fetch real data from `/api/v1/api-endpoints/:key`.

## Deployment
This Node.js backend is independent. It can be easily deployed to containerized platforms (Render, Railway, Fly.io) simply by configuring the start command `npm start` and passing the appropriate Environment Variables. Ensure MongoDB is hosted remotely (e.g., MongoDB Atlas) for a production deployment.

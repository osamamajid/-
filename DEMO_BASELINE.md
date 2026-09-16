# DEMO_BASELINE.md — عَقيد (Aqeed)

## 1. Current Architecture Overview

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Tailwind CSS + Lucide React icons
- **State Management**: React Context (`AuthContext`, `ToastContext`)
- **Routing**: `react-router-dom` v6 with SPA client routing (configured with `vercel.json`)
- **API Client**: Axios instance with Bearer interceptors & 401 session expiration handling
- **Forms**: React Hook Form + Zod validation
- **Tour**: Integrated 15-step interactive product onboarding (`ProductTour.tsx`)
- **Branding**: "عَقيد — منصة إدارة العقود الإلكترونية" with demo notice banner

### Backend
- **Framework**: Express.js + TypeScript
- **Database ORM**: Prisma Client 5.19
- **Database**: SQLite (`dev.db` for local dev) / PostgreSQL (`schema.postgresql.prisma` + migrations for cloud deployment)
- **Authentication**: JWT (`jsonwebtoken`) with strict `JWT_SECRET` requirement
- **Password Hashing**: `bcryptjs` (salt rounds: 10)
- **Rate Limiting**: `express-rate-limit` (API limiter + dedicated Auth limiter)
- **Security Headers**: `helmet`, configurable `cors` whitelist
- **Validation**: Zod schema validation middleware
- **Runtime Binding**: `0.0.0.0:${PORT}` with health endpoint at `GET /api/health`
- **Demo Guard**: Dedicated `demoProtection` middleware blocking destructive actions for role `DEMO`
- **Demo API**: `POST /api/demo/login` (1-click client login) and `POST /api/demo/reset` (isolated data reset)

---

## 2. Database Schema (Prisma)
- **Roles**: `ADMIN`, `EMPLOYEE`, `VIEWER`, `DEMO`
- **Permissions**: 19 granular permissions across 7 modules (`users`, `customers`, `contracts`, `templates`, `reports`, `audit`, `settings`)
- **Users**: Unique username & email, hashed password, role relationship, status flags
- **Customers**: Unique auto-generated customer number (`CUST-XXXX`), personal/business details, Iraqi governorates
- **Contract Types**: 6 built-in types (`TRAFFIC`, `RENTAL`, `SALE`, `SERVICE`, `EMPLOYMENT`, `GENERAL`)
- **Contract Templates**: Default standard terms and dynamic field definitions per contract type
- **Contracts**: Full contract lifecycle with dynamic field values (`ContractValue`), auto-incrementing contract number (`CTR-YYYY-XXXXXX`), financial details, dates, and soft-delete/archive support
- **Audit Logs**: Comprehensive activity tracking recording IP, user, entity, action, and payload details
- **Settings**: System configurations (company profile, tax/CR numbers, contract prefix, currency, alerts)

---

## 3. Current Scripts

### Backend (`backend/package.json`)
- `dev`: `tsx watch src/app.ts` (local live development)
- `build`: `tsc` (TypeScript compilation to `dist/`)
- `start`: `node dist/app.js` (production/demo runner)
- `db:generate`: `prisma generate`
- `db:push`: `prisma db push`
- `db:seed`: `tsx prisma/seed.ts` (populates roles, permissions, demo users, templates, customers, contracts)
- `db:studio`: `prisma studio`
- `db:migrate`: `prisma migrate dev`

### Frontend (`frontend/package.json`)
- `dev`: `vite` (local dev server on port 5173 with proxy)
- `build`: `tsc -b && vite build` (typecheck + production bundle to `dist/`)
- `preview`: `vite preview`

---

## 4. Environment Variables

### Backend
| Variable | Description | Example |
|---|---|---|
| `PORT` | Server listening port | `5000` or `10000` |
| `NODE_ENV` | Environment mode | `demo` or `development` or `production` |
| `DATABASE_URL` | Database connection string | `file:./dev.db` (local) or `postgresql://...` |
| `JWT_SECRET` | Secret key for signing tokens | Minimum 32-character secure string |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CORS_ORIGIN` | Primary frontend origin | `https://aqeed-demo.vercel.app` |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://aqeed-demo.vercel.app` |

### Frontend
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base API URL | `https://api-demo.example.com/api` (or relative `/api` in dev) |

---

## 5. Previous Blockers & Resolution Status

| # | Previous Blocker | Resolution Status | Details |
|---|---|---|---|
| 1 | No `.gitignore` | **RESOLVED** | Created comprehensive root `.gitignore` ignoring `.env`, `node_modules`, `dist/`, `*.db`, `*.bak`. |
| 2 | Tracked `backend/node_modules` | **RESOLVED** | Untracked 2,076 files from git index via `git rm -r --cached backend/node_modules`. |
| 3 | Tracked `.env` and `*.db` files | **RESOLVED** | Removed from git index tracking; local files preserved safely. |
| 4 | Sample secrets in `.env.example` | **RESOLVED** | Cleaned with generic placeholder strings only. |
| 5 | Hardcoded fallback for `JWT_SECRET` | **RESOLVED** | Strict startup error thrown if `JWT_SECRET` is missing. |
| 6 | Hardcoded credentials in frontend | **RESOLVED** | Removed state defaults and quick-fill passwords from `LoginPage.tsx`. |
| 7 | Missing 1-click Demo Login | **RESOLVED** | Added `POST /api/demo/login` with token issuance for demo mode. |
| 8 | Server binding to localhost only | **RESOLVED** | Updated `app.listen` in `backend/src/app.ts` to `0.0.0.0:${PORT}`. |
| 9 | Vercel SPA routing 404s | **RESOLVED** | Created `frontend/vercel.json` with route rewrite to `/index.html`. |
| 10 | Demo data reset mechanism | **RESOLVED** | Implemented `POST /api/demo/reset` protecting seeded records while clearing demo churn. |

---

## 6. Validated Demo Architecture

```
┌─────────────────────────────────┐
│     Client Browser (Arabic)     │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Vercel (Frontend)        │
│        React 18 + Vite          │
│    (SPA Rewrite, RTL, Tour)     │
└────────────────┬────────────────┘
                 │ HTTPS (CORS restricted)
                 ▼
┌─────────────────────────────────┐
│      Public Backend API         │
│  (Render / Railway / VPS Docker)│
│    Express + TypeScript + Zod   │
│       Rate Limiting & RBAC      │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Demo Database             │
│  PostgreSQL (Cloud) or SQLite   │
│   (Isolated Demo Dataset)       │
└─────────────────────────────────┘
```
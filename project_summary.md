# MagicPWA Codebase Analysis Summary

## 1. Frontend Architecture

### Structure Overview
```
frontend/src/
├── components/
│   ├── ui/          # Shadcn UI components (4: Button, Card, Input, Tooltip)
│   └── navbar.tsx   # Navigation component
├── pages/
│   ├── HomePage.tsx     # Receipt management home
│   ├── LoginPage.tsx    # Authentication
│   └── NfcPage.tsx      # NFC tag reading
├── routing/
│   └── router.tsx    # TanStack Router configuration
├── store/
│   └── authStore.ts  # Zustand auth state
├── services/
│   └── logger.ts     # Frontend logging service
├── schemas/
│   ├── auth.ts       # Login Zod schema
│   └── log.ts       # Log entry Zod schema
└── lib/
    ├── utils.ts      # cn() utility
    └── apiclient/    # API helper (unused)
```

### Routing (TanStack Router)
- **File**: `/frontend/src/routing/router.tsx`
- **Routes**: `/` (Home), `/login`, `/nfc`
- **Protection**: `beforeLoad` hook checks for JWT token, redirects to `/login` if missing
- **Layout**: Root component includes Navbar + Outlet with responsive container
- **DevTools**: Lazy-loaded in development mode

### State Management (Zustand)
- **Single store**: `authStore.ts`
  - `token`: JWT string | null
  - `setToken(token)`: Sets token
  - `logout()`: Clears token
- **Persistence**: Uses `persist` middleware -> `localStorage` key `"auth-storage"`

### API Client
- **File**: `/frontend/src/lib/apiclient`
- **`apiFetch`**: Adds Bearer token, handles 401 by logging out
- **Issue**: NOT USED anywhere in the app - LoginPage uses raw `fetch()` directly

### Tech Stack
| Category | Library | Version |
|----------|---------|---------|
| Framework | React | 19.2.0 |
| Routing | TanStack Router | 1.166.3 |
| State | Zustand | 5.0.11 |
| Styling | Tailwind CSS 4 | 4.2.1 |
| UI | Radix UI + Shadcn | 1.4.3 |
| Validation | Zod | 4.3.6 |
| Build | Vite | 7.3.1 |

---

## 2. Backend Architecture

### Main Application (`backend/main.py` - 150 lines)

**Endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Health check |
| POST | `/upload-receipt/` | No | Upload image (mock OCR) |
| POST | `/api/logs` | No | Receive client logs |
| POST | `/api/login` | No | Authenticate user |

**Features:**
- CORS middleware with **hardcoded allowed origins** (IPs, domains)
- Rolling file logs (5MB max, 5 backup files)
- JWT token generation (HS256, 24h expiry)
- File upload handling with `python-multipart`

**Missing:**
- OCR integration (Tesseract in requirements but not used)
- Database layer (SQLAlchemy/SQLite in requirements but not used)
- Proper error handling for file uploads
- File size/content validation

---

## 3. Authentication System

### JWT Flow
```
Frontend                    Backend
   |                           |
   |--- POST /api/login ------>|
   |   {username, password}    |
   |                           |-> Validate credentials
   |                           |-> Create JWT (24h)
   |<-- {access_token} --------|
   |                           |
   |--- Store in localStorage -|
   |                           |
   |--- API calls ------------>|
   |   Authorization: Bearer X |
```

### Security Issues Found

| Issue | Location | Severity |
|-------|----------|----------|
| Hardcoded fallback JWT secret | `main.py:15` | CRITICAL |
| Hardcoded fallback admin credentials | `main.py:16-17` | CRITICAL |
| Credentials logged to file | `main.py:147` | HIGH |
| .env credentials exposed | `.env:3-4` | CRITICAL |
| Plain text password comparison | `main.py:136` | HIGH |
| Token stored in localStorage (XSS) | `authStore.ts` | MEDIUM |
| Logs endpoint not JWT protected | `main.py:114` | MEDIUM |
| No token refresh mechanism | N/A | MEDIUM |
| No rate limiting | N/A | MEDIUM |

**Actual credentials from `.env`:**
```
BACKEND_SECRET_KEY=una-chiave-molto-lunga-e-casuale
ADMIN_USERNAME=efurlan
ADMIN_PASSWORD=efurlan
```

**Hardcoded fallbacks in `main.py`:**
```python
SECRET_KEY = os.getenv("SECRET_KEY", "chiave-di-emergenza-non-sicura")
ALLOWED_USER = os.getenv("ADMIN_USERNAME", "dev_secret")
ALLOWED_PASS = os.getenv("ADMIN_PASSWORD", "dev_password")
```

---

## 4. UI Components

### Available Shadcn Components
| Component | File | Variants |
|-----------|------|----------|
| Button | `button.tsx` | default, outline, secondary, ghost, destructive, link |
| Card | `card.tsx` | Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription, CardAction |
| Input | `input.tsx` | Standard input |
| Tooltip | `tooltip.tsx` | Provider, Trigger, Content |

### Styling Approach
- **Tailwind CSS 4** with CSS variables
- **Dark mode**: `.dark` class toggles variables
- **Components**: Use `cn()` utility for class merging
- **Design tokens**: OKLCH color space, 0.625rem radius

---

## 5. Missing/Incomplete Features

### TODO Comments Found
| File | Line | Description |
|------|------|-------------|
| `HomePage.tsx` | 8 | Receipt upload via camera + apiFetch not implemented |

### Mock Implementations
1. **OCR Endpoint** (`/upload-receipt/`): Returns hardcoded data
   ```python
   mock_data = {
       "data": "2024-05-20",
       "totale": 15.50,
       "valuta": "EUR"
   }
   ```

2. **NFC Page**: Reads tag data but doesn't persist/send to backend

### Not Yet Implemented (from requirements)
| Feature | Requirements Mention | Status |
|---------|---------------------|--------|
| Tesseract OCR | `requirements.txt` | NOT USED |
| SQLite Database | `requirements.txt` | NOT IMPLEMENTED |
| Excel Export | `requirements.txt` | NOT IMPLEMENTED |
| Receipt Storage/Retrieval | `requirements.txt` | NOT IMPLEMENTED |

---

## 6. Database/Data Layer

**Current State:**
- No database layer exists
- Files uploaded to `backend/data/uploads/` (empty directory found)
- Logs stored in `backend/data/logs/app_logs.log` (27 lines of activity)
- No receipt data persistence

---

## 7. Docker Setup

### docker-compose.yml
```yaml
services:
  backend:
    ports: 8000
    env_file: /opt/env/.env  # External env file
    volumes: /opt/data/receipt-app/backend_data
  frontend:
    ports: 3001:80
    depends_on: backend
networks:
  proxy-network: external
```

### Image Configurations

**Backend:**
- Base: `python:3.11-slim`
- Installs: Tesseract OCR, OpenCV dependencies
- User: Non-root (1000)
- Entry: `uvicorn main:app --host 0.0.0.0 --port 8000`

**Frontend:**
- Build stage: Node 20
- Runtime: `nginx:alpine`
- SPA routing via `try_files $uri $uri/ /index.html`

### Caddy Reverse Proxy
- Domain: `pi-235.tail8036f8.ts.net`
- Routes `/api/*` to backend:8000
- Everything else to frontend:80
- TLS certificates configured

### CI/CD (GitHub Actions)
```yaml
on: push to main branch
jobs:
  deploy:
    runs-on: self-hosted  # Raspberry Pi
    steps:
      - git pull origin main
      - docker compose up -d --build
```

---

## Technical Debt Summary

### High Priority
1. **Credentials hardcoded** - Security risk
2. **No database** - Data not persisted
3. **OCR mock only** - Core feature missing

### Medium Priority
4. **API client unused** - Inconsistent fetch usage
5. **No loading states** - Poor UX
6. **No error handling** - Crashes possible
7. **PWA icons missing** - `pwa-192x192.png`, `pwa-512x512.png` don't exist
8. **No tests** - No test coverage
9. **CORS hardcoded** - Not environment-aware

### Low Priority
10. **NFC data not persisted**
11. **Excel export not implemented**
12. **No form validation on receipt upload**
13. **No file size/type limits**
14. **Console logging mixed with production**

---

## Areas Needing Improvement

### Security Hardening
1. Remove hardcoded fallback credentials
2. Implement proper password hashing (bcrypt)
3. Use secure cookies instead of localStorage
4. Protect `/api/logs` endpoint with JWT
5. Add rate limiting
6. Validate file uploads (size, type, content)

### Architecture
1. Implement SQLite database with SQLAlchemy
2. Create proper service layer (OCR, receipts, export)
3. Use the `apiFetch` helper consistently
4. Add React Query/SWR for server state

### UX
1. Add loading spinners and skeletons
2. Implement error boundaries
3. Add toast notifications
4. Camera capture for receipts
5. Receipt list view with details

### DevOps
1. Add health check endpoint
2. Implement graceful shutdown
3. Add monitoring/alerting
4. Backup strategy for SQLite

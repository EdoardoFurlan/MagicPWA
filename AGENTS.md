# AGENTS.md - MagicPWA Development Guide

## Project Overview

MagicPWA is a receipt scanner application with:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4 + TanStack Router + Zustand
- **Backend**: FastAPI (Python) + SQLite + OCR (Tesseract)
- **Infrastructure**: Docker + Caddy reverse proxy + PWA support

## Project Structure

```
MagicPWA/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/ui/  # Shadcn UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── services/       # API clients, logger
│   │   ├── lib/            # Utilities (utils.ts, apiclient)
│   │   └── routing/        # TanStack Router config
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── main.py             # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── data/              # Uploads, logs
├── docker-compose.yml
├── Caddyfile              # Reverse proxy config
└── .env                   # Environment variables
```

---

## Build/Lint/Test Commands

### Frontend

```bash
cd frontend

# Development
npm run dev              # Start dev server (port 5173, HTTPS)

# Production
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint
```

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run in Docker
docker compose up -d --build
```

### Running a Single Test

No test framework is currently configured. When adding tests:

```bash
# Vitest (frontend)
npx vitest run src/specific.test.ts

# pytest (backend)
pytest backend/tests/test_specific.py -v
```

---

## Code Style Guidelines

### TypeScript/React

**Imports**
```typescript
// Absolute imports via @ alias (preferred)
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

// Relative imports when @ alias not applicable
import { LoginPage } from '../pages/LoginPage';

// Type-only imports
import type { LogEntry } from "@/schemas/log";
```

**Naming Conventions**
- Components: PascalCase (`LoginPage`, `Navbar`)
- Functions/Variables: camelCase (`handleSubmit`, `isLoading`)
- Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- Files: kebab-case (`auth-store.ts`, `login-page.tsx`)
- Types/Interfaces: PascalCase with descriptive names

**Types**
```typescript
// Use Zod for runtime validation
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, "Min 3 chars"),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;

// State types for Zustand
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}
```

**Component Structure**
```typescript
export function ComponentName() {
  // 1. Hooks
  const [state, setState] = useState<string | null>(null);
  
  // 2. Handlers (async first)
  const handleAction = async () => {
    // try/catch with proper error handling
  };

  // 3. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**Error Handling**
```typescript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) throw new Error('User-friendly message');
  const data = await response.json();
} catch (err: any) {
  setError(err.message);
  logger.error("Operation failed", { error: err });
}
```

### Python/FastAPI

**Imports**
```python
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
import os
from datetime import datetime
```

**Naming**
- Functions: snake_case
- Classes: PascalCase
- Constants: SCREAMING_SNAKE_CASE

**Type Hints**
```python
from typing import Optional

async def upload_receipt(file: UploadFile = File(...)) -> JSONResponse:
    ...
```

**Error Handling**
```python
if not file.content_type.startswith("image/"):
    raise HTTPException(status_code=400, detail="Il file deve essere un'immagine")
```

---

## UI Components

- Use Shadcn UI components from `src/components/ui/`
- Apply dark mode styles explicitly: `bg-white dark:bg-gray-800 text-black dark:text-white`
- Use Tailwind CSS 4 utility classes
- Use `cn()` utility for conditional classes
- Use Lucide React icons
- Apply mobile-first responsive design

## State Management

- **Global state**: Zustand stores in `src/store/`
- **API calls**: Use `apiFetch` helper for authenticated requests
- **Form state**: React useState + Zod validation
- **URL state**: TanStack Router search params

## API Conventions

- JSON responses with appropriate HTTP status codes
- 400: Bad request / validation errors
- 401: Authentication required
- 500: Server errors
- Log all API errors with context

## PWA

- Service worker auto-updates (configured in vite.config.ts)
- Manifest: `name: "Receipt Manager"`, `short_name: "Receipts"`
- Icons: 192x192 and 512x512 PNG

## Git Workflow

- Commit messages: concise, imperative mood ("Add NFC page", "Fix login redirect")
- Push to `main` triggers CI/CD deployment to MiniPC Proxmox con docker

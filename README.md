# DepartmentSense AI

AI-powered citizen grievance classification system. Citizens submit complaints, an NLP backend classifies them into one of six government departments (Electricity, Water, Sanitation, Roads, Public Services, Health), assigns a priority, and routes to the correct department head in real time.

- **Frontend**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4, base-ui + shadcn-style components, visx charts
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy + SQLite (dev) / Postgres (prod), HuggingFace zero-shot classification, WebSocket realtime, server-side PDF generation via ReportLab
- **Monorepo**: pnpm workspaces + Turborepo. Backend is managed by `uv`.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [One-time Setup](#one-time-setup)
4. [Running the Project](#running-the-project)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [Available Scripts](#available-scripts)
8. [Demo Login Codes](#demo-login-codes)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [System Architecture](#system-architecture)

---

## System Requirements

| Component | Min | Recommended |
|-----------|-----|-------------|
| OS | macOS 12, Windows 10, Linux | macOS 14, Windows 11 |
| RAM | 4 GB | 8 GB+ (16 GB if running HF models locally) |
| Disk | 2 GB free | 5 GB free (10 GB if `USE_LOCAL_ML=true`) |
| Node.js | 20.x | 22.x LTS |
| Python | 3.11 | 3.12 or 3.13 |
| Network | Open ports 3000 + 8000 | — |

---

## Prerequisites

Install these once on your machine.

### macOS

```bash
# 1. Homebrew (skip if installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node 22 + pnpm 9
brew install node@22
corepack enable
corepack prepare pnpm@9.15.9 --activate

# 3. Python tooling: uv (manages venv + Python automatically)
brew install uv

# Verify
node -v        # v22.x
pnpm -v        # 9.15.9
uv --version   # 0.4+ or newer
```

### Windows

> Use **PowerShell as Administrator** for installs, then a regular PowerShell or Windows Terminal for dev work.

```powershell
# 1. Node 22 — install via winget
winget install OpenJS.NodeJS.LTS

# 2. pnpm via corepack (ships with Node)
corepack enable
corepack prepare pnpm@9.15.9 --activate

# 3. Python via winget (uv installs CPython on demand, but having one helps)
winget install Python.Python.3.12

# 4. uv — Astral's fast Python package manager
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify (close + reopen terminal first so PATH refreshes)
node -v        # v22.x
pnpm -v        # 9.15.9
uv --version
```

If `uv` is not found after install, add `%USERPROFILE%\.local\bin` to your **PATH**.

### Linux (Ubuntu / Debian)

```bash
# Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
corepack enable
corepack prepare pnpm@9.15.9 --activate

# uv
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## One-time Setup

```bash
# Clone
git clone <your-fork-url> departmentsense-ai
cd departmentsense-ai

# Frontend deps (workspaces resolve automatically)
pnpm install

# Backend deps + .env scaffold
pnpm setup:api
```

**What `pnpm setup:api` does:**

- `cd backend && uv sync` — creates `.venv` and installs Python deps (FastAPI, SQLAlchemy, ReportLab, etc.). First run takes 30–60 s; later runs are cached.
- Copies `backend/.env.example` → `backend/.env` if `.env` doesn't already exist.

**On Windows** the `cp -n` in `setup:api` fails silently. Run this manually instead:

```powershell
cd backend
uv sync
if (-Not (Test-Path .env)) { Copy-Item .env.example .env }
cd ..
```

Then edit `backend/.env` and fill in the values (see [Environment Variables](#environment-variables)).

---

## Running the Project

### Launch everything (recommended)

```bash
pnpm dev
```

Boots both services in parallel with colored output:

- **web** (green) → `http://localhost:3000` — Next.js (Turbopack)
- **api** (blue) → `http://localhost:8000` — FastAPI with hot reload

`Ctrl+C` once stops both (concurrently uses `--kill-others-on-fail`).

### Launch individually

```bash
pnpm dev:web    # Frontend only
pnpm dev:api    # Backend only
```

### URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Next.js app |
| Backend | http://localhost:8000 | FastAPI |
| API docs | http://localhost:8000/docs | Swagger UI |
| Health | http://localhost:8000/health | Returns active ML mode |

---

## Environment Variables

### `backend/.env` (required — copy from `.env.example`)

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `APP_ENV` | no | `dev` | Environment label |
| `DATABASE_URL` | no | `sqlite+aiosqlite:///./departmentsense.db` | Async DB URL. For Postgres: `postgresql+asyncpg://user:pass@host/db` |
| `SECRET_KEY` | **yes (prod)** | `change-me-in-prod-please` | JWT signing secret. **Rotate before deploying.** Generate with `openssl rand -hex 32` (Mac/Linux) or `[Convert]::ToBase64String((1..32 | %{[byte](Get-Random -Maximum 256)}))` (PowerShell). |
| `FRONTEND_ORIGIN` | no | `http://localhost:3000` | CORS allow-list. Comma-separate multiple. |
| `HF_API_TOKEN` | recommended | empty | HuggingFace token. Without it the backend falls back to a keyword classifier. Get one free at https://huggingface.co/settings/tokens (read access is enough). |
| `HF_CLASSIFIER_MODEL` | no | `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` | Zero-shot multilingual classifier |
| `HF_SENTIMENT_MODEL` | no | `cardiffnlp/twitter-xlm-roberta-base-sentiment` | Sentiment polarity model |
| `USE_LOCAL_ML` | no | `false` | Set `true` to run transformers on-device (downloads ~1.5 GB on first request). Otherwise calls HF Inference API. |

> ⚠️  **Never commit `.env`** — it's in `.gitignore`. If you've leaked a token, rotate it on HF.

### `apps/web/.env.local` (optional)

| Key | Default | Description |
|-----|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL the frontend talks to. Override when deploying. |

### ML resolution order

The classifier picks the first available path on every request:

1. **`USE_LOCAL_ML=true`** → local transformers pipeline (CPU/GPU)
2. **`HF_API_TOKEN` set** → HuggingFace Inference API (free tier is fine for dev)
3. **Fallback** → keyword heuristic (always works, no external calls)

Check active mode at `http://localhost:8000/health` (`ml_mode` field).

---

## Project Structure

```
departmentsense-ai/
├── apps/
│   └── web/                  # Next.js 16 frontend
│       ├── app/              # App Router routes (/, /auth, /dashboard/**)
│       ├── components/       # Molecular components (charts/, dashboard/, ai/, …)
│       ├── lib/              # api.ts, role-context.tsx, pdf.ts, mock-data.ts (types)
│       ├── hooks/            # use-mobile, use-controllable-state
│       └── tests/e2e/        # Playwright smoke suite
├── packages/
│   ├── ui/                   # Atomic UI components (shadcn-style on base-ui)
│   ├── eslint-config/
│   └── typescript-config/
├── backend/                  # FastAPI service (uv-managed)
│   ├── app/
│   │   ├── main.py           # FastAPI app, CORS, lifespan, seed
│   │   ├── config.py         # Pydantic settings
│   │   ├── database.py       # Async SQLAlchemy
│   │   ├── models/           # ORM (Complaint, Department, User, …)
│   │   ├── routers/          # auth, complaints, departments, pdf, ws
│   │   ├── services/         # classifier, pdf_generator, ws_manager
│   │   ├── schemas.py        # Pydantic camelCase I/O
│   │   └── seed.py           # Seed departments + sample complaints
│   ├── pyproject.toml
│   └── .env.example
└── docs/
    ├── idea.md               # Problem statement
    ├── system-architecture.md
    └── ui-directions.md      # Component → role mapping
```

---

## Available Scripts

Run from the **repo root**:

| Command | Action |
|---------|--------|
| `pnpm dev` | Run web + api together |
| `pnpm dev:web` | Web only (port 3000) |
| `pnpm dev:api` | API only (port 8000) |
| `pnpm setup:api` | Sync Python deps + create `.env` |
| `pnpm build` | Production build of frontend |
| `pnpm typecheck` | TypeScript across the monorepo |
| `pnpm lint` | ESLint across the monorepo |
| `pnpm format` | Prettier write |
| `pnpm test:e2e` | Playwright e2e suite (needs both servers running) |

Backend-only commands (run inside `backend/`):

| Command | Action |
|---------|--------|
| `uv sync` | Install / update Python deps |
| `uv run uvicorn app.main:app --reload` | Dev server |
| `uv run pytest` | Run backend tests |
| `uv run ruff check .` | Lint |

---

## Demo Login Codes

The app seeds three demo users on first run. The `/auth` page lets you pick a role:

| Role | What you see | Verification code |
|------|--------------|-------------------|
| Citizen | Personal complaints, submit form, feedback | — |
| Department Head | Pipeline (kanban) + logs scoped to your dept | one of the codes below |
| Administrator | Charts, all complaints, classification PDFs | — |

Department codes (case-insensitive):

```
ELEC-2026     Electricity
WATER-2026    Water Supply
SANIT-2026    Sanitation
ROADS-2026    Roads & Transport
PUBLIC-2026   Public Services
HEALTH-2026   Health & Hospitals
```

---

## Testing

End-to-end suite uses Playwright + Chromium.

```bash
# Boot servers first (separate terminal)
pnpm dev

# Run the suite
pnpm test:e2e

# Or interactive UI mode
pnpm --filter web test:e2e:ui
```

First run downloads Chromium (~150 MB) — handled automatically.

---

## Troubleshooting

**Port already in use**
- 3000: `lsof -ti:3000 | xargs kill` (Mac/Linux) or `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess` (Windows)
- 8000: same with `:8000`

**`uv: command not found` after install (Windows)**
Close and reopen your terminal so `PATH` refreshes. If it persists, add `%USERPROFILE%\.local\bin` manually.

**`pnpm setup:api` fails with `cp: command not found` on Windows**
The fallback PowerShell snippet in [One-time Setup](#one-time-setup) does the same thing.

**Backend `ValueError: greenlet library required`**
Run `cd backend && uv sync` again — `greenlet` is a SQLAlchemy async dep that may not have installed.

**Frontend shows 500 / module-not-found**
Run `pnpm install` from the repo root. Workspaces sometimes go out of sync after pulling.

**HuggingFace classification is slow / returns 503**
Free HF Inference API has cold-start delays on first call (model loading). Subsequent calls within ~15 min are fast. Or set `HF_API_TOKEN` to empty to use the keyword fallback (instant, lower accuracy).

**Playwright "browser executable not found"**
```bash
pnpm --filter web exec playwright install chromium
```

**Reset the database**
Stop the backend, delete `backend/departmentsense.db`, restart. The seed runs again on next boot.

---

## System Architecture

```mermaid
flowchart TD
    subgraph CLIENT["Frontend — Next.js (apps/web)"]
        direction TB
        WF["wizard-form.tsx\nComplaint Submission"]
        AL["animated-list.tsx\nClassification Steps (realtime)"]
        TT["theater-ticket.tsx\nUnique Submission ID"]
        NF["news-feed.tsx\nComplaint History"]
        KB["kanban-board.tsx\nDept. Pipeline View"]
        TL["timeline-block.tsx\nGrievance Status"]
        WP["web-performance.tsx\nAdmin Analytics"]
        COT["chain-of-thought.tsx\nAI Reasoning Display"]
    end

    subgraph AUTH["Auth Layer"]
        AP["auth-page.tsx\nSign In / Register"]
        VC["verification-code.tsx\nDept. Head Verification"]
        RBAC["RBAC\nAdmin | Dept Head | Citizen"]
    end

    subgraph BACKEND["Backend — FastAPI (Python)"]
        direction TB
        ING["/api/complaints\nIngestion Endpoint"]
        PROC["Text Preprocessor\nTokenize · Stop-words · Multilingual"]
        CLASS["Classification Engine\nHugging Face Inference"]
        PRIO["Priority Scorer\nSentiment + Urgency"]
        ROUTE["Router\nDept Assignment + Escalation"]
        DB[("PostgreSQL\nComplaints · Status · Dept")]
        WS["WebSocket\nRealtime Status Push"]
        PDFGEN["/api/pdf\nReport Generator"]
    end

    subgraph PDF["PDF Generation"]
        TICKETPDF["Citizen Ticket PDF\nReference No · Submission Details"]
        CLASSPDF["Admin Classification Report PDF\nReasoning · Confidence · Severity"]
    end

    subgraph HF["Hugging Face"]
        BERT["mBERT / XLM-RoBERTa\nMultilingual Classifier"]
        SENT["Sentiment Model\nSeverity Detection"]
    end

    subgraph ROLES["User Roles"]
        CITIZEN["Citizen\nSubmit · Track"]
        DEPTHEAD["Dept Head\nManage · Resolve"]
        ADMIN["Admin\nOversee · Analyse"]
    end

    %% Auth flow
    AP -->|"credentials"| RBAC
    VC -->|"dept code"| RBAC
    RBAC -->|"session token"| CLIENT

    %% Submission flow
    WF -->|"POST complaint text"| ING
    ING --> PROC
    PROC -->|"clean text"| CLASS
    CLASS -->|"HF Inference API"| BERT
    BERT -->|"dept label + confidence"| CLASS
    CLASS -->|"text"| SENT
    SENT -->|"sentiment score"| PRIO
    PRIO -->|"priority flag"| ROUTE
    ROUTE -->|"store"| DB
    ROUTE -->|"dept + priority"| WS

    %% Realtime feedback
    WS -->|"SSE / WS"| AL
    WS -->|"status updates"| TL
    ROUTE -->|"ticket ID"| TT

    %% Dashboard data
    DB -->|"complaint list"| NF
    DB -->|"pipeline state"| KB
    DB -->|"aggregates"| WP

    %% AI reasoning display
    CLASS -->|"reasoning steps"| COT

    %% PDF flows
    ROUTE -->|"ticket data"| PDFGEN
    PDFGEN -->|"download stream"| TICKETPDF
    TICKETPDF -->|"trigger on submit complete"| TT
    CLASS -->|"reasoning · confidence"| PDFGEN
    PDFGEN -->|"admin-only download"| CLASSPDF
    CLASSPDF -->|"available in"| WP

    %% Role views
    CITIZEN --> WF
    CITIZEN --> TL
    CITIZEN --> NF
    DEPTHEAD --> KB
    DEPTHEAD --> NF
    ADMIN --> WP
    ADMIN --> KB
    ADMIN --> NF
```

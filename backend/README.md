# DepartmentSense Backend

FastAPI service for the AI grievance classification system.

## Quick start

```bash
cd backend
cp .env.example .env
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Health check: `http://localhost:8000/health`
OpenAPI docs: `http://localhost:8000/docs`

## ML resolution order

The classifier picks the first available path:

1. **Local transformers** (`USE_LOCAL_ML=true`) — downloads ~1.5 GB of weights on first run, runs inference on CPU/GPU.
2. **HuggingFace Inference API** (set `HF_API_TOKEN`) — fast, no install, requires free token.
3. **Keyword heuristic** — always available; production-grade fallback that never blocks the request.

All three return the same `ClassifyOutput` shape consumed by the rest of the pipeline.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness + active ML mode |
| POST | `/api/auth/login` | Demo login by role; dept-head requires `verificationCode` |
| GET | `/api/departments` | List all departments |
| GET | `/api/complaints` | List complaints (filterable by role/department/citizen/status/priority) |
| GET | `/api/complaints/{id}` | Single complaint with reasoning + severity |
| POST | `/api/complaints` | Submit complaint → runs classification → broadcasts WS events |
| PATCH | `/api/complaints/{id}/status` | Update status (kanban) |
| PATCH | `/api/complaints/{id}/feedback` | Submit citizen feedback |
| GET | `/api/pdf/ticket/{id}` | Citizen ticket PDF |
| GET | `/api/pdf/classification/{id}` | Admin classification report PDF |
| WS | `/ws/complaints/{referenceNumber}` | Realtime classification + status events |

## DB

Default: SQLite at `./departmentsense.db`. Tables auto-create + seed on first run.
Swap to Postgres by setting `DATABASE_URL=postgresql+asyncpg://...`.

## Dev

```bash
uv run pytest          # run tests
uv run ruff check .    # lint
```

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import SessionLocal, init_db
from app.routers import auth, complaints, departments, pdf, ws
from app.seed import seed

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    async with SessionLocal() as session:
        await seed(session)
    yield


app = FastAPI(
    title="DepartmentSense AI",
    description="Citizen Grievance Classification Backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(complaints.router)
app.include_router(pdf.router)
app.include_router(ws.router)


@app.get("/health", tags=["meta"])
async def health() -> dict:
    return {
        "status": "ok",
        "service": "departmentsense-backend",
        "ml_mode": "local" if settings.use_local_ml else ("hf-inference" if settings.hf_api_token else "keyword"),
    }

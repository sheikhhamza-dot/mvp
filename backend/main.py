import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import auth, children, sessions, vocabulary, progress, goals, tts

load_dotenv()

app = FastAPI(
    title="AI English Speaking Coach API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend origin
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(children.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(vocabulary.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(tts.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "AI English Speaking Coach"}

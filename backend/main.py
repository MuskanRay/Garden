# main.py — Smart Home Gardening Assistant — FastAPI Backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config.database import connect_db, disconnect_db
from routers import auth, plants, weather, recommendations, alerts, users, admin

# ─── App Instance ───────────────────────────────────────────────────────────

app = FastAPI(
    title="🌿 Smart Garden Assistant API",
    description="Backend API for the Smart Home Gardening Assistant System",
    version="1.0.0",
)

# ─── CORS ────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static Files (uploaded images) ─────────────────────────────────────────

os.makedirs("uploads/plants", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Lifecycle Events ────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# ─── Routers ─────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(plants.router)
app.include_router(weather.router)
app.include_router(recommendations.router)
app.include_router(alerts.router)
app.include_router(admin.router)

# ─── Health Check ────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "🌿 Garden Assistant API is running",
        "docs": "/docs",
        "version": "1.0.0",
    }

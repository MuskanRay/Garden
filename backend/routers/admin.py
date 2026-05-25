# routers/admin.py
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta

from services.auth_service import require_admin
from config.database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def admin_stats(admin=Depends(require_admin)):
    db = get_db()
    today = datetime.utcnow() - timedelta(hours=24)

    total_users = await db.users.count_documents({})
    total_plants = await db.plants.count_documents({})
    total_notifications = await db.notifications.count_documents({})
    active_today = await db.users.count_documents({"updated_at": {"$gte": today}})

    return {
        "total_users": total_users,
        "total_plants": total_plants,
        "total_notifications": total_notifications,
        "active_users_today": active_today,
    }


@router.get("/users")
async def list_all_users(admin=Depends(require_admin)):
    db = get_db()
    users = await db.users.find({}, {"password": 0}).to_list(200)
    return [
        {
            "id": str(u["_id"]),
            "name": u["name"],
            "email": u["email"],
            "role": u.get("role", "user"),
            "location": u.get("location", ""),
            "created_at": u["created_at"],
        }
        for u in users
    ]


@router.get("/plants")
async def list_all_plants(admin=Depends(require_admin)):
    db = get_db()
    plants = await db.plants.find({}).to_list(500)
    return [
        {
            "id": str(p["_id"]),
            "user_id": str(p["user_id"]),
            "name": p["name"],
            "plant_type": p["plant_type"],
            "created_at": p["created_at"],
        }
        for p in plants
    ]

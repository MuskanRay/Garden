# routers/alerts.py
from fastapi import APIRouter, Depends
from bson import ObjectId
from typing import List
from datetime import datetime

from services.auth_service import get_current_user
from models.schemas import NotificationOut
from config.database import get_db

router = APIRouter(prefix="/alerts", tags=["Alerts"])


def _notif_out(n: dict) -> NotificationOut:
    return NotificationOut(
        id=str(n["_id"]),
        user_id=str(n["user_id"]),
        title=n["title"],
        message=n["message"],
        type=n["type"],
        is_read=n.get("is_read", False),
        created_at=n["created_at"],
    )


@router.get("", response_model=List[NotificationOut])
async def get_alerts(current_user=Depends(get_current_user)):
    db = get_db()
    notifs = await db.notifications.find(
        {"user_id": current_user["_id"]}
    ).sort("created_at", -1).limit(50).to_list(50)
    return [_notif_out(n) for n in notifs]


@router.put("/{alert_id}/read")
async def mark_read(alert_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_one(
        {"_id": ObjectId(alert_id), "user_id": current_user["_id"]},
        {"$set": {"is_read": True}},
    )
    return {"message": "Marked as read"}


@router.put("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_many(
        {"user_id": current_user["_id"]},
        {"$set": {"is_read": True}},
    )
    return {"message": "All notifications marked as read"}

# routers/users.py
from fastapi import APIRouter, Depends
from datetime import datetime

from services.auth_service import get_current_user
from models.schemas import UserUpdate, UserOut
from config.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])


def _user_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        location=user.get("location", ""),
        role=user.get("role", "user"),
        avatar_url=user.get("avatar_url"),
        created_at=user["created_at"],
    )


@router.get("/me", response_model=UserOut)
async def get_profile(current_user=Depends(get_current_user)):
    return _user_out(current_user)


@router.put("/me", response_model=UserOut)
async def update_profile(data: UserUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.utcnow()

    result = await db.users.find_one_and_update(
        {"_id": current_user["_id"]},
        {"$set": update},
        return_document=True,
    )
    return _user_out(result)


@router.get("/dashboard-stats")
async def dashboard_stats(current_user=Depends(get_current_user)):
    """Return quick stats for dashboard cards."""
    from services.recommendation_service import get_water_status
    db = get_db()
    plants = await db.plants.find({"user_id": current_user["_id"]}).to_list(200)
    unread = await db.notifications.count_documents({
        "user_id": current_user["_id"],
        "is_read": False,
    })

    needs_water = sum(
        1 for p in plants
        if get_water_status(p.get("last_watered"), p.get("watering_frequency_days", 3)) == "needs_water"
    )

    return {
        "total_plants": len(plants),
        "needs_water": needs_water,
        "unread_alerts": unread,
        "plant_types": _count_types(plants),
    }


def _count_types(plants: list) -> dict:
    counts: dict = {}
    for p in plants:
        t = p.get("plant_type", "other")
        counts[t] = counts.get(t, 0) + 1
    return counts

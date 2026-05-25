# routers/recommendations.py
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from typing import List

from services.auth_service import get_current_user
from services.weather_service import get_current_weather
from services.recommendation_service import build_recommendation, get_health_analysis
from config.database import get_db

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/all")
async def all_recommendations(
    city: str = Query("New Delhi"),
    current_user=Depends(get_current_user),
):
    """Watering recommendations for all user plants."""
    db = get_db()
    plants = await db.plants.find({"user_id": current_user["_id"]}).to_list(100)
    weather = await get_current_weather(city)

    return [build_recommendation(p, weather) for p in plants]


@router.get("/{plant_id}")
async def single_recommendation(
    plant_id: str,
    city: str = Query("New Delhi"),
    current_user=Depends(get_current_user),
):
    db = get_db()
    plant = await db.plants.find_one({
        "_id": ObjectId(plant_id),
        "user_id": current_user["_id"],
    })
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    weather = await get_current_weather(city)
    return build_recommendation(plant, weather)


@router.get("/health/all")
async def all_health_analysis(
    city: str = Query("New Delhi"),
    current_user=Depends(get_current_user),
):
    """Health analysis for all user plants."""
    db = get_db()
    plants = await db.plants.find({"user_id": current_user["_id"]}).to_list(100)
    weather = await get_current_weather(city)

    return [get_health_analysis(p, weather) for p in plants]


@router.get("/health/{plant_id}")
async def single_health(
    plant_id: str,
    city: str = Query("New Delhi"),
    current_user=Depends(get_current_user),
):
    db = get_db()
    plant = await db.plants.find_one({
        "_id": ObjectId(plant_id),
        "user_id": current_user["_id"],
    })
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    weather = await get_current_weather(city)
    return get_health_analysis(plant, weather)

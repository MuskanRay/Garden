# routers/weather.py
from fastapi import APIRouter, Query, Depends
from services.weather_service import get_current_weather, get_forecast
from services.auth_service import get_current_user

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("")
async def current_weather(
    city: str = Query("New Delhi"),
    current_user=Depends(get_current_user),
):
    return await get_current_weather(city)


@router.get("/forecast")
async def weather_forecast(
    city: str = Query("New Delhi"),
    current_user=Depends(get_current_user),
):
    return await get_forecast(city)

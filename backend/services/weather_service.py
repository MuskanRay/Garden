# services/weather_service.py
import httpx
from datetime import datetime
from config.settings import get_settings

settings = get_settings()
BASE_URL = "https://api.openweathermap.org/data/2.5"


async def get_current_weather(city: str) -> dict:
    """Fetch current weather from OpenWeatherMap."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/weather",
            params={
                "q": city,
                "appid": settings.openweather_api_key,
                "units": "metric",
            },
            timeout=10.0,
        )
        if resp.status_code != 200:
            return _mock_weather(city)
        data = resp.json()

    return {
        "city": data["name"],
        "temperature": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "wind_speed": data["wind"]["speed"],
        "description": data["weather"][0]["description"].title(),
        "icon": data["weather"][0]["icon"],
        "rain_probability": data.get("rain", {}).get("1h", 0) * 10,  # approx
        "timestamp": datetime.utcnow().isoformat(),
    }


async def get_forecast(city: str) -> list:
    """Fetch 5-day / 3-hour forecast and return daily summaries."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/forecast",
            params={
                "q": city,
                "appid": settings.openweather_api_key,
                "units": "metric",
            },
            timeout=10.0,
        )
        if resp.status_code != 200:
            return _mock_forecast()
        data = resp.json()

    # Group by date and compute daily high/low
    days: dict = {}
    for item in data["list"]:
        date = item["dt_txt"][:10]
        if date not in days:
            days[date] = {
                "date": date,
                "temps": [],
                "humidity": [],
                "rain_prob": 0,
                "icon": item["weather"][0]["icon"],
                "description": item["weather"][0]["description"].title(),
            }
        days[date]["temps"].append(item["main"]["temp"])
        days[date]["humidity"].append(item["main"]["humidity"])
        days[date]["rain_prob"] = max(
            days[date]["rain_prob"], item.get("pop", 0) * 100
        )

    result = []
    for day_data in list(days.values())[:5]:
        result.append({
            "date": day_data["date"],
            "temp_max": round(max(day_data["temps"]), 1),
            "temp_min": round(min(day_data["temps"]), 1),
            "humidity": round(sum(day_data["humidity"]) / len(day_data["humidity"])),
            "rain_probability": round(day_data["rain_prob"]),
            "icon": day_data["icon"],
            "description": day_data["description"],
        })
    return result


# ─── Mock data when no API key ───────────────────────────────────────────────

def _mock_weather(city: str) -> dict:
    return {
        "city": city or "Demo City",
        "temperature": 28.5,
        "feels_like": 30.2,
        "humidity": 65,
        "wind_speed": 3.4,
        "description": "Partly Cloudy",
        "icon": "02d",
        "rain_probability": 20.0,
        "timestamp": datetime.utcnow().isoformat(),
    }

def _mock_forecast() -> list:
    import random
    days = ["2024-06-01","2024-06-02","2024-06-03","2024-06-04","2024-06-05"]
    icons = ["01d","02d","10d","03d","01d"]
    descs = ["Sunny","Partly Cloudy","Light Rain","Cloudy","Clear Sky"]
    return [
        {
            "date": days[i],
            "temp_max": round(28 + random.uniform(-3,5), 1),
            "temp_min": round(20 + random.uniform(-2,3), 1),
            "humidity": random.randint(50, 80),
            "rain_probability": random.randint(0, 70),
            "icon": icons[i],
            "description": descs[i],
        }
        for i in range(5)
    ]

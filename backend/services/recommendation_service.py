# services/recommendation_service.py
from datetime import datetime, timedelta
from typing import List, Optional


def get_water_status(last_watered: Optional[datetime], frequency_days: int) -> str:
    """Determine current watering status of a plant."""
    if not last_watered:
        return "needs_water"
    days_since = (datetime.utcnow() - last_watered).days
    if days_since >= frequency_days:
        return "needs_water"
    elif days_since >= frequency_days - 1:
        return "ok"
    return "recently_watered"


def build_recommendation(plant: dict, weather: dict) -> dict:
    """
    Core recommendation logic using weather + plant data.
    Returns action: 'water_now' | 'skip' | 'monitor'
    """
    temp = weather.get("temperature", 25)
    humidity = weather.get("humidity", 60)
    rain_prob = weather.get("rain_probability", 0)

    last_watered = plant.get("last_watered")
    freq = plant.get("watering_frequency_days", 3)
    water_status = get_water_status(last_watered, freq)

    reasons: List[str] = []
    action = "monitor"
    urgency = "low"
    message = ""

    # ── Rule 1: High rain probability → skip ──────────────────────────────
    if rain_prob > 70:
        action = "skip"
        urgency = "low"
        message = "Rain expected soon — no watering needed today."
        reasons.append(f"Rain probability is {rain_prob:.0f}%")
        if water_status == "needs_water":
            reasons.append("Plant needs water but rain will cover it")

    # ── Rule 2: Hot + dry + needs water → water now ───────────────────────
    elif water_status == "needs_water":
        action = "water_now"
        urgency = "high"
        message = "Your plant needs water now!"
        reasons.append("Past scheduled watering date")
        if temp > 35:
            reasons.append(f"High temperature ({temp:.1f}°C) increases water demand")
            urgency = "high"
        if humidity < 40:
            reasons.append(f"Low humidity ({humidity}%) — soil dries faster")

    # ── Rule 3: Very hot weather even if recently watered ─────────────────
    elif temp > 35 and water_status == "ok":
        action = "water_now"
        urgency = "medium"
        message = "Extreme heat detected — consider extra watering."
        reasons.append(f"Temperature is {temp:.1f}°C — well above normal")
        if humidity < 50:
            reasons.append(f"Low humidity ({humidity}%) accelerates evaporation")

    # ── Rule 4: Low humidity monitor ─────────────────────────────────────
    elif humidity < 40:
        action = "monitor"
        urgency = "medium"
        message = "Low humidity — monitor soil moisture closely."
        reasons.append(f"Humidity is only {humidity}%")

    # ── Rule 5: All good ─────────────────────────────────────────────────
    else:
        action = "monitor"
        urgency = "low"
        message = "Plant conditions look good. Keep it up!"
        reasons.append("Weather conditions are favourable")
        if water_status == "recently_watered":
            reasons.append("Recently watered — no action needed")

    # Next watering estimate
    if last_watered:
        next_watering = last_watered + timedelta(days=freq)
    else:
        next_watering = datetime.utcnow()

    return {
        "plant_id": str(plant["_id"]),
        "plant_name": plant["name"],
        "action": action,
        "message": message,
        "urgency": urgency,
        "next_watering": next_watering.isoformat() if next_watering else None,
        "reasons": reasons,
    }


def get_health_analysis(plant: dict, weather: dict) -> dict:
    """Detect common plant health issues."""
    issues = []
    suggestions = []
    health_score = 100

    last_watered = plant.get("last_watered")
    freq = plant.get("watering_frequency_days", 3)
    sunlight = plant.get("sunlight_requirement", "partial_shade")
    humidity = weather.get("humidity", 60)
    temp = weather.get("temperature", 25)

    # Overwatering check
    if last_watered:
        days_since = (datetime.utcnow() - last_watered).days
        if days_since == 0 and freq > 2:
            issues.append("Possible overwatering")
            suggestions.append("Allow soil to dry between waterings")
            health_score -= 20

    # Underwatering check
    if last_watered:
        days_since = (datetime.utcnow() - last_watered).days
        if days_since > freq * 1.5:
            issues.append("Underwatering detected")
            suggestions.append("Water the plant immediately and check roots")
            health_score -= 30

    # Sunlight check
    if sunlight == "full_sun" and temp < 15:
        issues.append("Low sunlight / temperature for this plant type")
        suggestions.append("Move plant to a sunnier location or use grow lights")
        health_score -= 15

    # Humidity check
    if humidity < 30:
        issues.append("Very low ambient humidity")
        suggestions.append("Mist leaves or place a humidity tray nearby")
        health_score -= 10

    # Heat stress
    if temp > 40:
        issues.append("Extreme heat stress risk")
        suggestions.append("Provide shade and increase watering frequency temporarily")
        health_score -= 20

    if not issues:
        issues = ["No issues detected"]
        suggestions = ["Keep up the great care!"]

    return {
        "plant_id": str(plant["_id"]),
        "plant_name": plant["name"],
        "health_score": max(0, health_score),
        "status": "healthy" if health_score >= 80 else "warning" if health_score >= 50 else "critical",
        "issues": issues,
        "suggestions": suggestions,
    }

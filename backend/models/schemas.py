# models/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── Enums ─────────────────────────────────────────────────────────────────

class PlantType(str, Enum):
    indoor = "indoor"
    outdoor = "outdoor"
    vegetable = "vegetable"
    fruit = "fruit"
    flower = "flower"
    herb = "herb"
    succulent = "succulent"
    tree = "tree"

class SoilType(str, Enum):
    loamy = "loamy"
    sandy = "sandy"
    clay = "clay"
    silty = "silty"
    peaty = "peaty"
    chalky = "chalky"

class SunlightReq(str, Enum):
    full_sun = "full_sun"
    partial_shade = "partial_shade"
    full_shade = "full_shade"

class WaterStatus(str, Enum):
    needs_water = "needs_water"
    recently_watered = "recently_watered"
    ok = "ok"

class NotificationType(str, Enum):
    watering = "watering"
    weather = "weather"
    health = "health"
    general = "general"


# ─── Auth ───────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    location: Optional[str] = "New Delhi"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    location: str
    role: str
    avatar_url: Optional[str] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Plants ─────────────────────────────────────────────────────────────────

class PlantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    plant_type: PlantType
    watering_frequency_days: int = Field(..., ge=1, le=30)
    sunlight_requirement: SunlightReq
    soil_type: SoilType
    last_watered: Optional[datetime] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None

class PlantUpdate(BaseModel):
    name: Optional[str] = None
    plant_type: Optional[PlantType] = None
    watering_frequency_days: Optional[int] = None
    sunlight_requirement: Optional[SunlightReq] = None
    soil_type: Optional[SoilType] = None
    last_watered: Optional[datetime] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None

class PlantOut(BaseModel):
    id: str
    user_id: str
    name: str
    plant_type: str
    watering_frequency_days: int
    sunlight_requirement: str
    soil_type: str
    last_watered: Optional[datetime] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    water_status: WaterStatus
    created_at: datetime
    updated_at: datetime


# ─── Weather ────────────────────────────────────────────────────────────────

class WeatherData(BaseModel):
    city: str
    temperature: float
    feels_like: float
    humidity: int
    wind_speed: float
    description: str
    icon: str
    rain_probability: Optional[float] = 0.0
    timestamp: datetime


# ─── Recommendations ────────────────────────────────────────────────────────

class WateringRecommendation(BaseModel):
    plant_id: str
    plant_name: str
    action: str           # "water_now" | "skip" | "monitor"
    message: str
    urgency: str          # "high" | "medium" | "low"
    next_watering: Optional[datetime] = None
    reasons: List[str]


# ─── Notifications ──────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime


# ─── Admin ──────────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    total_plants: int
    total_notifications: int
    active_users_today: int

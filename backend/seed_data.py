#!/usr/bin/env python3
"""Seed MongoDB with demo data. Run: python seed_data.py"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "garden_assistant"
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # Clear existing data
    await db.users.drop()
    await db.plants.drop()
    await db.notifications.drop()

    # ── Users ──────────────────────────────────────────────────────────────
    admin_result = await db.users.insert_one({
        "name": "Admin User",
        "email": "admin@garden.com",
        "password": pwd_ctx.hash("Admin@123"),
        "location": "New Delhi",
        "role": "admin",
        "avatar_url": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    john_result = await db.users.insert_one({
        "name": "John Doe",
        "email": "john@garden.com",
        "password": pwd_ctx.hash("User@123"),
        "location": "Mumbai",
        "role": "user",
        "avatar_url": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    user_id = john_result.inserted_id

    # ── Plants ─────────────────────────────────────────────────────────────
    plants = [
        {
            "user_id": user_id,
            "name": "Monstera Deliciosa",
            "plant_type": "indoor",
            "watering_frequency_days": 7,
            "sunlight_requirement": "partial_shade",
            "soil_type": "loamy",
            "last_watered": datetime.utcnow() - timedelta(days=8),
            "notes": "Keep away from direct sunlight. Loves humidity.",
            "image_url": None,
            "created_at": datetime.utcnow() - timedelta(days=30),
            "updated_at": datetime.utcnow(),
        },
        {
            "user_id": user_id,
            "name": "Cherry Tomato",
            "plant_type": "vegetable",
            "watering_frequency_days": 2,
            "sunlight_requirement": "full_sun",
            "soil_type": "loamy",
            "last_watered": datetime.utcnow() - timedelta(days=1),
            "notes": "Fertilize every 2 weeks. Check for aphids.",
            "image_url": None,
            "created_at": datetime.utcnow() - timedelta(days=45),
            "updated_at": datetime.utcnow(),
        },
        {
            "user_id": user_id,
            "name": "Aloe Vera",
            "plant_type": "succulent",
            "watering_frequency_days": 14,
            "sunlight_requirement": "full_sun",
            "soil_type": "sandy",
            "last_watered": datetime.utcnow() - timedelta(days=5),
            "notes": "Drought-tolerant. Do not overwater.",
            "image_url": None,
            "created_at": datetime.utcnow() - timedelta(days=60),
            "updated_at": datetime.utcnow(),
        },
        {
            "user_id": user_id,
            "name": "Basil",
            "plant_type": "herb",
            "watering_frequency_days": 3,
            "sunlight_requirement": "full_sun",
            "soil_type": "loamy",
            "last_watered": datetime.utcnow() - timedelta(days=4),
            "notes": "Pinch off flower buds to encourage leaf growth.",
            "image_url": None,
            "created_at": datetime.utcnow() - timedelta(days=15),
            "updated_at": datetime.utcnow(),
        },
        {
            "user_id": user_id,
            "name": "Peace Lily",
            "plant_type": "indoor",
            "watering_frequency_days": 5,
            "sunlight_requirement": "full_shade",
            "soil_type": "peaty",
            "last_watered": datetime.utcnow() - timedelta(days=2),
            "notes": "Droops when thirsty — great indicator plant!",
            "image_url": None,
            "created_at": datetime.utcnow() - timedelta(days=20),
            "updated_at": datetime.utcnow(),
        },
    ]
    plant_results = await db.plants.insert_many(plants)

    # ── Notifications ──────────────────────────────────────────────────────
    notifications = [
        {
            "user_id": user_id,
            "title": "Watering Alert 🚿",
            "message": "Monstera Deliciosa needs water — it's been 8 days!",
            "type": "watering",
            "is_read": False,
            "created_at": datetime.utcnow() - timedelta(hours=2),
        },
        {
            "user_id": user_id,
            "title": "Weather Alert 🌧️",
            "message": "Rain expected tomorrow — skip watering your outdoor plants.",
            "type": "weather",
            "is_read": False,
            "created_at": datetime.utcnow() - timedelta(hours=5),
        },
        {
            "user_id": user_id,
            "title": "Welcome to Garden Assistant! 🌿",
            "message": "Start tracking your plants and get smart recommendations.",
            "type": "general",
            "is_read": True,
            "created_at": datetime.utcnow() - timedelta(days=1),
        },
    ]
    await db.notifications.insert_many(notifications)

    client.close()
    print("✅ Seed complete!")
    print("   Admin: admin@garden.com / Admin@123")
    print("   User:  john@garden.com  / User@123")


if __name__ == "__main__":
    asyncio.run(seed())

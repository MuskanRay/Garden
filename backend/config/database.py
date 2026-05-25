# config/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Connect to MongoDB."""
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.plants.create_index("user_id")
    await db.notifications.create_index("user_id")
    print(f"✅ Connected to MongoDB: {settings.database_name}")


async def disconnect_db():
    """Disconnect from MongoDB."""
    global client
    if client:
        client.close()
        print("🔌 Disconnected from MongoDB")


def get_db():
    return db

# config/settings.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "garden_assistant"
    jwt_secret: str = "change_this_secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    openweather_api_key: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()

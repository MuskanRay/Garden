# routers/auth.py
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId

from models.schemas import UserRegister, UserLogin, Token, UserOut
from services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from config.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


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


@router.post("/register", response_model=Token)
async def register(data: UserRegister):
    db = get_db()
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "location": data.location or "New Delhi",
        "role": "user",
        "avatar_url": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return Token(access_token=token, user=_user_out(user_doc))


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return Token(access_token=token, user=_user_out(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return _user_out(current_user)

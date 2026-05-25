# routers/plants.py
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
import aiofiles
import os
import uuid

from models.schemas import PlantCreate, PlantUpdate, PlantOut
from services.auth_service import get_current_user
from services.recommendation_service import get_water_status
from config.database import get_db

router = APIRouter(prefix="/plants", tags=["Plants"])

UPLOAD_DIR = "uploads/plants"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _plant_out(plant: dict) -> PlantOut:
    last_watered = plant.get("last_watered")
    freq = plant.get("watering_frequency_days", 3)
    return PlantOut(
        id=str(plant["_id"]),
        user_id=str(plant["user_id"]),
        name=plant["name"],
        plant_type=plant["plant_type"],
        watering_frequency_days=freq,
        sunlight_requirement=plant["sunlight_requirement"],
        soil_type=plant["soil_type"],
        last_watered=last_watered,
        notes=plant.get("notes"),
        image_url=plant.get("image_url"),
        water_status=get_water_status(last_watered, freq),
        created_at=plant["created_at"],
        updated_at=plant["updated_at"],
    )


@router.get("", response_model=List[PlantOut])
async def list_plants(
    search: Optional[str] = Query(None),
    plant_type: Optional[str] = Query(None),
    water_status: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
):
    db = get_db()
    query: dict = {"user_id": current_user["_id"]}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if plant_type:
        query["plant_type"] = plant_type

    cursor = db.plants.find(query).sort("created_at", -1)
    plants = await cursor.to_list(length=100)
    result = [_plant_out(p) for p in plants]

    if water_status:
        result = [p for p in result if p.water_status == water_status]
    return result


@router.post("", response_model=PlantOut)
async def create_plant(data: PlantCreate, current_user=Depends(get_current_user)):
    db = get_db()
    doc = {
        **data.model_dump(),
        "user_id": current_user["_id"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.plants.insert_one(doc)
    doc["_id"] = result.inserted_id

    # Create watering notification
    await db.notifications.insert_one({
        "user_id": current_user["_id"],
        "title": "Plant Added!",
        "message": f'"{data.name}" has been added to your garden.',
        "type": "general",
        "is_read": False,
        "created_at": datetime.utcnow(),
    })

    return _plant_out(doc)


@router.get("/{plant_id}", response_model=PlantOut)
async def get_plant(plant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    plant = await db.plants.find_one({
        "_id": ObjectId(plant_id),
        "user_id": current_user["_id"],
    })
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return _plant_out(plant)


@router.put("/{plant_id}", response_model=PlantOut)
async def update_plant(plant_id: str, data: PlantUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    result = await db.plants.find_one_and_update(
        {"_id": ObjectId(plant_id), "user_id": current_user["_id"]},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Plant not found")
    return _plant_out(result)


@router.delete("/{plant_id}")
async def delete_plant(plant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    result = await db.plants.delete_one({
        "_id": ObjectId(plant_id),
        "user_id": current_user["_id"],
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plant not found")
    return {"message": "Plant deleted successfully"}


@router.post("/{plant_id}/water", response_model=PlantOut)
async def log_watering(plant_id: str, current_user=Depends(get_current_user)):
    """Mark plant as watered now."""
    db = get_db()
    result = await db.plants.find_one_and_update(
        {"_id": ObjectId(plant_id), "user_id": current_user["_id"]},
        {"$set": {"last_watered": datetime.utcnow(), "updated_at": datetime.utcnow()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Plant not found")

    await db.notifications.insert_one({
        "user_id": current_user["_id"],
        "title": "Watering Logged",
        "message": f'"{result["name"]}" has been watered.',
        "type": "watering",
        "is_read": False,
        "created_at": datetime.utcnow(),
    })
    return _plant_out(result)


@router.post("/{plant_id}/upload-image")
async def upload_plant_image(
    plant_id: str,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Upload an image for a plant."""
    db = get_db()
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)

    image_url = f"/uploads/plants/{filename}"
    await db.plants.update_one(
        {"_id": ObjectId(plant_id), "user_id": current_user["_id"]},
        {"$set": {"image_url": image_url, "updated_at": datetime.utcnow()}},
    )
    return {"image_url": image_url}

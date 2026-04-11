from fastapi import APIRouter, HTTPException, Depends
from models.schemas import ChildCreate, ChildSummary, ChildDetail
from db.supabase_client import supabase
from routers.deps import get_current_user_id

router = APIRouter(prefix="/children", tags=["children"])


@router.post("", status_code=201)
async def create_child(data: ChildCreate, user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table("children").insert({
            "parent_id": user_id,
            "name": data.name,
            "age": data.age,
            "grade": data.grade,
            "native_language": data.native_language,
            "proficiency_level": data.proficiency_level,
        }).execute()
        row = result.data[0]
        return {
            "id": row["id"],
            "name": row["name"],
            "age": row["age"],
            "grade": row["grade"],
            "proficiency_level": row["proficiency_level"],
            "streak_current": 0,
            "total_sessions": 0,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
async def list_children(user_id: str = Depends(get_current_user_id)):
    result = (
        supabase.table("children")
        .select("id, name, age, proficiency_level, streak_current, total_sessions, total_speaking_minutes, total_vocab_count")
        .eq("parent_id", user_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


@router.get("/{child_id}")
async def get_child(child_id: str, user_id: str = Depends(get_current_user_id)):
    result = (
        supabase.table("children")
        .select("*")
        .eq("id", child_id)
        .eq("parent_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Child not found")
    row = result.data
    return {
        "id": row["id"],
        "name": row["name"],
        "age": row["age"],
        "grade": row["grade"],
        "proficiency_level": row["proficiency_level"],
        "interests": row.get("interests") or [],
        "weak_areas": row.get("weak_areas") or [],
        "strong_areas": row.get("strong_areas") or [],
        "streak_current": row.get("streak_current", 0),
        "total_sessions": row.get("total_sessions", 0),
        "total_speaking_minutes": row.get("total_speaking_minutes", 0),
        "total_vocab_count": row.get("total_vocab_count", 0),
    }

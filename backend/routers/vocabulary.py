from fastapi import APIRouter, HTTPException, Depends, Query
from db.supabase_client import supabase
from routers.deps import get_current_user_id

router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])


def _verify_child_access(child_id: str, user_id: str):
    result = (
        supabase.table("children")
        .select("id")
        .eq("id", child_id)
        .eq("parent_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/{child_id}")
async def get_vocabulary(
    child_id: str,
    sort: str = Query(default="date", pattern="^(date|alpha)$"),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    user_id: str = Depends(get_current_user_id),
):
    _verify_child_access(child_id, user_id)

    query = (
        supabase.table("vocabulary")
        .select("word, definition, example_sentence, introduced_at, times_used_later, retained")
        .eq("child_id", child_id)
    )
    if sort == "alpha":
        query = query.order("word")
    else:
        query = query.order("introduced_at", desc=True)

    # Get total count
    count_result = (
        supabase.table("vocabulary")
        .select("id", count="exact")
        .eq("child_id", child_id)
        .execute()
    )
    total = count_result.count or 0

    result = query.range(offset, offset + limit - 1).execute()

    words = [
        {
            "word": r["word"],
            "definition": r["definition"],
            "example_sentence": r["example_sentence"],
            "introduced_date": str(r["introduced_at"]),
            "times_used_later": r.get("times_used_later", 0),
            "retained": r.get("retained", False),
        }
        for r in (result.data or [])
    ]
    return {"total_count": total, "words": words}

from fastapi import APIRouter, HTTPException, Depends
from models.schemas import GoalCreate, GoalResponse
from db.supabase_client import supabase
from routers.deps import get_current_user_id
from datetime import date, timedelta

router = APIRouter(prefix="/goals", tags=["goals"])


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


def _get_period(goal_type: str):
    today = date.today()
    if goal_type == "sessions_per_week":
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
    else:  # words_per_month
        start = today.replace(day=1)
        if today.month == 12:
            end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
    return str(start), str(end)


@router.post("", status_code=201)
async def create_goal(data: GoalCreate, user_id: str = Depends(get_current_user_id)):
    _verify_child_access(data.child_id, user_id)
    period_start, period_end = _get_period(data.type)

    result = supabase.table("goals").insert({
        "child_id": data.child_id,
        "type": data.type,
        "target": data.target,
        "current": 0,
        "period_start": period_start,
        "period_end": period_end,
    }).execute()

    row = result.data[0]
    return {
        "id": row["id"],
        "type": row["type"],
        "target": row["target"],
        "current": row["current"],
        "period_start": row["period_start"],
        "period_end": row["period_end"],
    }


@router.get("/{child_id}")
async def get_goals(child_id: str, user_id: str = Depends(get_current_user_id)):
    _verify_child_access(child_id, user_id)

    today = str(date.today())
    result = (
        supabase.table("goals")
        .select("*")
        .eq("child_id", child_id)
        .gte("period_end", today)
        .order("created_at", desc=True)
        .execute()
    )

    goals = []
    for row in (result.data or []):
        # Compute current progress
        if row["type"] == "sessions_per_week":
            sessions = (
                supabase.table("sessions")
                .select("id", count="exact")
                .eq("child_id", child_id)
                .gte("started_at", row["period_start"])
                .lte("started_at", row["period_end"] + "T23:59:59")
                .not_.is_("ended_at", "null")
                .execute()
            )
            current = sessions.count or 0
        else:
            vocab = (
                supabase.table("vocabulary")
                .select("id", count="exact")
                .eq("child_id", child_id)
                .gte("introduced_at", row["period_start"])
                .lte("introduced_at", row["period_end"])
                .execute()
            )
            current = vocab.count or 0

        days_left = (date.fromisoformat(row["period_end"]) - date.today()).days
        on_track = current >= (row["target"] * (1 - days_left / 7)) if row["type"] == "sessions_per_week" else True

        goals.append({
            "id": row["id"],
            "type": row["type"],
            "target": row["target"],
            "current": current,
            "period_start": str(row["period_start"]),
            "period_end": str(row["period_end"]),
            "on_track": on_track,
            "achieved": current >= row["target"],
        })

    return goals

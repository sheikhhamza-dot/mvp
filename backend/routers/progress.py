from fastapi import APIRouter, HTTPException, Depends, Query
from db.supabase_client import supabase
from routers.deps import get_current_user_id
from services.report_generator import generate_weekly_summary

router = APIRouter(prefix="/progress", tags=["progress"])


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
async def get_progress(child_id: str, user_id: str = Depends(get_current_user_id)):
    _verify_child_access(child_id, user_id)

    child_result = supabase.table("children").select("*").eq("id", child_id).single().execute()
    if not child_result.data:
        raise HTTPException(status_code=404, detail="Child not found")
    child = child_result.data

    # Get level history from progress snapshots (approximate)
    snapshots = (
        supabase.table("progress_snapshots")
        .select("difficulty_level, week_start")
        .eq("child_id", child_id)
        .order("week_start")
        .execute()
    )
    level_history = []
    seen_levels = set()
    for snap in (snapshots.data or []):
        lvl = snap["difficulty_level"]
        if lvl not in seen_levels:
            seen_levels.add(lvl)
            level_history.append({"level": lvl, "reached_at": snap["week_start"]})

    # Weekly average
    total_sessions = child.get("total_sessions", 0) or 0
    # Estimate weeks active
    weeks_active = max(1, total_sessions // 3)
    weekly_avg = round(total_sessions / weeks_active, 1)

    return {
        "child_name": child["name"],
        "total_sessions": total_sessions,
        "total_speaking_minutes": child.get("total_speaking_minutes", 0) or 0,
        "total_vocabulary": child.get("total_vocab_count", 0) or 0,
        "current_level": child.get("proficiency_level", 1),
        "level_history": level_history or [{"level": child.get("proficiency_level", 1), "reached_at": str(child.get("created_at", "")[:10])}],
        "current_streak": child.get("streak_current", 0),
        "longest_streak": child.get("streak_longest", 0),
        "weekly_avg_sessions": weekly_avg,
    }


@router.get("/{child_id}/weekly")
async def get_weekly_progress(
    child_id: str,
    week: str = Query(default=None, description="Monday of the week (YYYY-MM-DD)"),
    user_id: str = Depends(get_current_user_id),
):
    _verify_child_access(child_id, user_id)

    from datetime import date, timedelta
    if week is None:
        today = date.today()
        week = str(today - timedelta(days=today.weekday()))

    # Check for existing snapshot
    snap_result = (
        supabase.table("progress_snapshots")
        .select("*")
        .eq("child_id", child_id)
        .eq("week_start", week)
        .execute()
    )

    if snap_result.data:
        snap = snap_result.data[0]
        return {
            "week_start": snap["week_start"],
            "sessions_count": snap["sessions_count"],
            "speaking_minutes": snap["speaking_minutes"],
            "new_vocab_count": snap["new_vocab_count"],
            "vocab_retained_from_past": snap.get("vocab_retained", 0),
            "quiz_avg_score": snap.get("quiz_avg_score"),
            "level_at_start": snap["difficulty_level"],
            "level_at_end": snap["difficulty_level"],
            "summary": snap.get("summary", ""),
        }

    # Compute on the fly from sessions
    from datetime import date as ddate
    week_date = ddate.fromisoformat(week)
    week_end = week_date + timedelta(days=6)

    sessions_result = (
        supabase.table("sessions")
        .select("id, duration_minutes, vocab_introduced, quiz_score, difficulty_level, started_at")
        .eq("child_id", child_id)
        .gte("started_at", week_date.isoformat())
        .lte("started_at", week_end.isoformat() + "T23:59:59")
        .not_.is_("ended_at", "null")
        .execute()
    )
    sessions = sessions_result.data or []

    sessions_count = len(sessions)
    speaking_minutes = sum(s.get("duration_minutes") or 0 for s in sessions)
    all_vocab = []
    for s in sessions:
        all_vocab.extend(s.get("vocab_introduced") or [])
    new_vocab_count = len(set(all_vocab))

    quiz_scores = [s["quiz_score"] for s in sessions if s.get("quiz_score") is not None]
    quiz_avg = round(sum(quiz_scores) / len(quiz_scores), 1) if quiz_scores else None

    difficulty = sessions[-1]["difficulty_level"] if sessions else 1

    # Get parent language
    child_result = supabase.table("children").select("parent_id, name").eq("id", child_id).single().execute()
    child = child_result.data or {}
    parent_result = supabase.table("parents").select("language").eq("id", child.get("parent_id", "")).execute()
    parent_language = parent_result.data[0]["language"] if parent_result.data else "en"

    week_data = {
        "week_start": week,
        "sessions_count": sessions_count,
        "speaking_minutes": round(speaking_minutes, 1),
        "new_vocab_count": new_vocab_count,
        "vocab_retained": 0,
        "quiz_avg_score": quiz_avg,
        "difficulty_level": difficulty,
    }

    summary = generate_weekly_summary(child.get("name", ""), week_data, parent_language)

    return {
        "week_start": week,
        "sessions_count": sessions_count,
        "speaking_minutes": round(speaking_minutes, 1),
        "new_vocab_count": new_vocab_count,
        "vocab_retained_from_past": 0,
        "quiz_avg_score": quiz_avg,
        "level_at_start": difficulty,
        "level_at_end": difficulty,
        "summary": summary,
    }

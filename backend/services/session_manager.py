import logging
from datetime import datetime, timezone
from db.supabase_client import supabase
from services.vocabulary_service import save_vocab_words
from services.learning_profile_service import update_profile_after_session, update_streak
from services.report_generator import generate_session_report

logger = logging.getLogger(__name__)

MAX_SESSION_MINUTES = 15


def create_session(child_id: str, topic: str, difficulty_level: int, session_plan: dict) -> str:
    """Create a new session record and return session ID."""
    result = supabase.table("sessions").insert({
        "child_id": child_id,
        "topic": topic,
        "difficulty_level": difficulty_level,
        "session_plan": session_plan,
        "message_count": 0,
    }).execute()
    return result.data[0]["id"]


def save_message(session_id: str, role: str, content: str):
    """Save a message to the database."""
    supabase.table("messages").insert({
        "session_id": session_id,
        "role": role,
        "content": content,
    }).execute()


def save_message_simple(session_id: str, role: str, content: str):
    """Save a message without RPC (simpler approach)."""
    supabase.table("messages").insert({
        "session_id": session_id,
        "role": role,
        "content": content,
    }).execute()


def get_message_count(session_id: str) -> int:
    result = (
        supabase.table("messages")
        .select("id", count="exact")
        .eq("session_id", session_id)
        .in_("role", ["child", "ai"])
        .execute()
    )
    return result.count or 0


def end_session(
    session_id: str,
    child_id: str,
    child: dict,
    reason: str = "completed",
) -> dict:
    """
    End a session:
    1. Calculate duration
    2. Save all vocab
    3. Generate report
    4. Update child profile
    5. Update streak
    6. Update session totals
    """
    # Get session data
    session_result = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
    session = session_result.data

    # Get all messages
    messages_result = (
        supabase.table("messages")
        .select("role, content, created_at")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    messages = messages_result.data or []

    # Calculate duration
    started_at = datetime.fromisoformat(session["started_at"].replace("Z", "+00:00"))
    ended_at = datetime.now(timezone.utc)
    duration_minutes = (ended_at - started_at).total_seconds() / 60

    # Get all vocab introduced in this session (collected during conversation)
    vocab_introduced = session.get("vocab_introduced") or []

    # Generate session report
    parent_result = supabase.table("parents").select("language").eq("id", child.get("parent_id", "")).execute()
    parent_language = (parent_result.data[0]["language"] if parent_result.data else "en")

    report = generate_session_report(
        session_id=session_id,
        child_name=child["name"],
        parent_language=parent_language,
        messages=messages,
    )
    summary = report.get("summary", "")

    # Update session record
    supabase.table("sessions").update({
        "ended_at": ended_at.isoformat(),
        "duration_minutes": round(duration_minutes, 2),
        "summary": summary,
        "end_reason": reason,
    }).eq("id", session_id).execute()

    # Update child totals
    supabase.table("children").update({
        "total_sessions": (child.get("total_sessions", 0) or 0) + 1,
        "total_speaking_minutes": (child.get("total_speaking_minutes", 0) or 0) + round(duration_minutes, 2),
    }).eq("id", child_id).execute()

    # Update streak
    new_streak = update_streak(child_id, child)

    # Update learning profile
    session_summary = update_profile_after_session(child_id, child, messages)

    # Save session summary for future context
    if session_summary:
        supabase.table("sessions").update({"summary": session_summary}).eq("id", session_id).execute()

    return {
        "session_id": session_id,
        "duration_minutes": round(duration_minutes, 2),
        "vocab_introduced": vocab_introduced,
        "quiz_score": session.get("quiz_score"),
        "summary": session_summary or summary,
        "report": report,
    }


def update_session_vocab(session_id: str, new_words: list[str], child_id: str, vocab_items: list[dict]):
    """Append newly introduced vocabulary to session record and save to vocab table."""
    session_result = supabase.table("sessions").select("vocab_introduced").eq("id", session_id).single().execute()
    current = session_result.data.get("vocab_introduced") or []
    updated = list(set(current + new_words))
    supabase.table("sessions").update({"vocab_introduced": updated}).eq("id", session_id).execute()

    # Save to vocabulary table
    if vocab_items:
        save_vocab_words(child_id, session_id, vocab_items)

    # Update child vocab count
    child_result = supabase.table("children").select("total_vocab_count").eq("id", child_id).single().execute()
    current_count = child_result.data.get("total_vocab_count", 0) or 0
    supabase.table("children").update({
        "total_vocab_count": current_count + len(new_words)
    }).eq("id", child_id).execute()

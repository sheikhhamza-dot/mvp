import logging
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import (
    SessionStart, SessionStartResponse, SessionPlan,
    MessageRequest, MessageResponse, MessageMetadata,
    SessionEndRequest, SessionEndResponse,
    TranscriptResponse, TranscriptMessage, SessionReport,
    VocabEntry, GrammarObservations, QuizResults, QuizDetail,
)
from db.supabase_client import supabase
from routers.deps import get_current_user_id
from services.conversation_engine import process_message, get_child
from services.learning_profile_service import generate_session_plan
from services.session_manager import (
    create_session, save_message_simple, get_message_count,
    end_session, update_session_vocab,
)
from services.llm_service import chat_completion
from prompts.system_prompt import assemble_system_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["sessions"])


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


@router.post("/start", status_code=201)
async def start_session(data: SessionStart, user_id: str = Depends(get_current_user_id)):
    _verify_child_access(data.child_id, user_id)

    child = get_child(data.child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    session_plan = generate_session_plan(child, data.topic)
    session_id = create_session(
        child_id=data.child_id,
        topic=data.topic,
        difficulty_level=child.get("proficiency_level", 1),
        session_plan=session_plan,
    )

    # Generate opening message
    from services.conversation_engine import get_recent_session_summaries
    summaries = get_recent_session_summaries(data.child_id)
    system_prompt = assemble_system_prompt(
        child=child,
        session_plan=session_plan,
        session_summaries=summaries,
        session_phase="opening",
    )
    opening = chat_completion(
        system_prompt=system_prompt,
        messages=[{"role": "user", "content": "[SESSION_START]"}],
        temperature=0.8,
        max_tokens=150,
    )

    save_message_simple(session_id, "ai", opening)

    return {
        "session_id": session_id,
        "opening_message": opening,
        "session_plan": session_plan,
    }


@router.post("/{session_id}/message")
async def send_message(
    session_id: str,
    data: MessageRequest,
    user_id: str = Depends(get_current_user_id),
):
    # Get session and verify access
    session_result = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_result.data
    _verify_child_access(session["child_id"], user_id)

    child_id = session["child_id"]
    session_plan = session.get("session_plan") or {}

    # Save child message
    save_message_simple(session_id, "child", data.content)

    # Get message count
    msg_count = get_message_count(session_id)

    # Process through conversation engine
    result = process_message(
        session_id=session_id,
        child_id=child_id,
        child_message=data.content,
        session_plan=session_plan,
        message_count=msg_count,
    )

    # Save AI response
    save_message_simple(session_id, "ai", result["response"])

    # Update vocab if new words introduced
    if result["vocab_words"]:
        update_session_vocab(
            session_id=session_id,
            new_words=result["vocab_words"],
            child_id=child_id,
            vocab_items=result["vocab_items"],
        )

    return {
        "response": result["response"],
        "metadata": {
            "vocab_introduced": result["vocab_words"],
            "corrections_made": result["corrections"],
            "session_phase": result["session_phase"],
            "message_count": msg_count + 1,
        },
    }


@router.post("/{session_id}/end")
async def end_session_route(
    session_id: str,
    data: SessionEndRequest,
    user_id: str = Depends(get_current_user_id),
):
    session_result = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_result.data

    _verify_child_access(session["child_id"], user_id)
    child = get_child(session["child_id"])

    result = end_session(
        session_id=session_id,
        child_id=session["child_id"],
        child=child,
        reason=data.reason,
    )
    return {
        "session_id": session_id,
        "duration_minutes": result["duration_minutes"],
        "vocab_introduced": result["vocab_introduced"],
        "quiz_score": result.get("quiz_score"),
        "summary": result["summary"],
        "report_url": f"/api/sessions/{session_id}/report",
    }


@router.get("/{child_id_param}/list")
async def list_sessions(child_id_param: str, user_id: str = Depends(get_current_user_id)):
    _verify_child_access(child_id_param, user_id)
    result = (
        supabase.table("sessions")
        .select("id, topic, started_at, ended_at, duration_minutes, vocab_introduced, quiz_score, summary")
        .eq("child_id", child_id_param)
        .order("started_at", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/{session_id}/transcript")
async def get_transcript(session_id: str, user_id: str = Depends(get_current_user_id)):
    session_result = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_result.data
    _verify_child_access(session["child_id"], user_id)

    child = get_child(session["child_id"])
    messages_result = (
        supabase.table("messages")
        .select("role, content, created_at")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )

    return {
        "session_id": session_id,
        "child_name": child.get("name", ""),
        "date": session["started_at"][:10],
        "duration_minutes": session.get("duration_minutes"),
        "messages": [
            {"role": m["role"], "content": m["content"], "timestamp": m["created_at"]}
            for m in (messages_result.data or [])
        ],
    }


@router.get("/{session_id}/report")
async def get_report(session_id: str, user_id: str = Depends(get_current_user_id)):
    session_result = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_result.data
    _verify_child_access(session["child_id"], user_id)

    child = get_child(session["child_id"])
    messages_result = (
        supabase.table("messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    messages = messages_result.data or []

    from services.report_generator import generate_session_report
    from db.supabase_client import supabase as sb
    parent_result = sb.table("parents").select("language").eq("id", child.get("parent_id", "")).execute()
    parent_language = parent_result.data[0]["language"] if parent_result.data else "en"

    report = generate_session_report(
        session_id=session_id,
        child_name=child["name"],
        parent_language=parent_language,
        messages=messages,
    )

    return {
        "session_id": session_id,
        "child_name": child["name"],
        "date": session["started_at"][:10],
        "duration_minutes": session.get("duration_minutes"),
        "topic": session.get("topic", ""),
        **report,
    }

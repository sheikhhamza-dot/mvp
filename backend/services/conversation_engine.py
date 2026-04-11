import json
import logging
from db.supabase_client import supabase
from services.llm_service import chat_completion
from services.safety_filter import safe_response
from services.vocabulary_service import extract_vocab_from_response
from prompts.system_prompt import assemble_system_prompt

logger = logging.getLogger(__name__)

SESSION_PHASES = ["opening", "core", "vocabulary", "closing", "quiz"]
PHASE_THRESHOLDS = {
    "opening": 3,    # first 3 messages
    "core": 18,      # messages 4-18
    "vocabulary": 22, # messages 19-22
    "closing": 26,   # messages 23-26
    "quiz": 99,      # messages 27+
}


def get_session_phase(message_count: int) -> str:
    for phase, threshold in PHASE_THRESHOLDS.items():
        if message_count <= threshold:
            return phase
    return "quiz"


def get_child(child_id: str) -> dict:
    result = supabase.table("children").select("*").eq("id", child_id).single().execute()
    return result.data or {}


def get_recent_session_summaries(child_id: str) -> list[str]:
    """Get summaries from last 3 sessions for context injection."""
    result = (
        supabase.table("sessions")
        .select("summary, started_at, topic")
        .eq("child_id", child_id)
        .not_.is_("summary", "null")
        .order("started_at", desc=True)
        .limit(3)
        .execute()
    )
    summaries = []
    for row in (result.data or []):
        if row.get("summary"):
            summaries.append(row["summary"])
    return summaries


def get_session_messages(session_id: str) -> list[dict]:
    result = (
        supabase.table("messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


def process_message(
    session_id: str,
    child_id: str,
    child_message: str,
    session_plan: dict,
    message_count: int,
) -> dict:
    """
    Core conversation processing:
    1. Load context
    2. Determine session phase
    3. Build system prompt
    4. Call LLM
    5. Safety check
    6. Extract vocabulary
    7. Return structured response
    """
    child = get_child(child_id)
    session_summaries = get_recent_session_summaries(child_id)
    session_messages = get_session_messages(session_id)

    phase = get_session_phase(message_count)

    system_prompt = assemble_system_prompt(
        child=child,
        session_plan=session_plan,
        session_summaries=session_summaries,
        session_phase=phase,
    )

    # Build conversation history for LLM (max last 20 messages to control tokens)
    history_messages = []
    for msg in session_messages[-20:]:
        role = "user" if msg["role"] == "child" else "assistant"
        history_messages.append({"role": role, "content": msg["content"]})

    # Add current child message
    history_messages.append({"role": "user", "content": child_message})

    # Get LLM response
    raw_response = chat_completion(
        system_prompt=system_prompt,
        messages=history_messages,
        temperature=0.75,
        max_tokens=300,
    )

    # Safety check
    ai_response = safe_response(raw_response)

    # Extract vocabulary introduced
    vocab_items = extract_vocab_from_response(ai_response)
    vocab_words = [v["word"] for v in vocab_items]

    # Detect grammar corrections (simple recast detection)
    corrections = _detect_corrections(child_message, ai_response)

    return {
        "response": ai_response,
        "vocab_items": vocab_items,
        "vocab_words": vocab_words,
        "corrections": corrections,
        "session_phase": phase,
    }


def _detect_corrections(child_msg: str, ai_response: str) -> list[str]:
    """Simple heuristic to detect recasting corrections."""
    corrections = []
    # Common patterns where LLM might have recast
    error_patterns = [
        ("goed", "went"), ("catched", "caught"), ("runned", "ran"),
        ("teached", "taught"), ("buyed", "bought"), ("taked", "took"),
        ("maked", "made"), ("drived", "drove"), ("eated", "ate"),
        ("i am agree", "i agree"), ("i am disagree", "i disagree"),
    ]
    child_lower = child_msg.lower()
    for error, correction in error_patterns:
        if error in child_lower:
            corrections.append(f"{error}→{correction} (recast)")
    return corrections

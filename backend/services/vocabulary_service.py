import json
import logging
from datetime import date
from db.supabase_client import supabase
from services.llm_service import json_completion

logger = logging.getLogger(__name__)

VOCAB_EXTRACTION_PROMPT = """You are helping an English tutoring app track vocabulary.

Given this AI tutor response, extract any new vocabulary words that were explicitly introduced or explained to the student.
Only extract words that were clearly introduced (with a definition or explanation), not all complex words.

Tutor response:
{response}

Return JSON in this exact format:
{{
  "vocab_introduced": [
    {{"word": "word", "definition": "simple child-friendly definition", "example": "example sentence from the response"}}
  ]
}}

If no new words were introduced, return: {{"vocab_introduced": []}}"""


def extract_vocab_from_response(response_text: str) -> list[dict]:
    """Extract newly introduced vocabulary from an AI tutor response."""
    try:
        result = json_completion(
            VOCAB_EXTRACTION_PROMPT.format(response=response_text),
            temperature=0.1,
            max_tokens=500,
        )
        return result.get("vocab_introduced", [])
    except Exception as e:
        logger.error(f"Vocab extraction failed: {e}")
        return []


def save_vocab_words(child_id: str, session_id: str, words: list[dict]) -> list[str]:
    """Save extracted vocabulary to the database. Returns list of saved words."""
    saved = []
    for entry in words:
        word = entry.get("word", "").lower().strip()
        if not word:
            continue
        try:
            supabase.table("vocabulary").upsert(
                {
                    "child_id": child_id,
                    "word": word,
                    "definition": entry.get("definition", ""),
                    "example_sentence": entry.get("example", ""),
                    "introduced_in_session": session_id,
                    "introduced_at": str(date.today()),
                },
                on_conflict="child_id,word",
            ).execute()
            saved.append(word)
        except Exception as e:
            logger.error(f"Failed to save vocab word '{word}': {e}")
    return saved


def get_review_words(child_id: str, limit: int = 3) -> list[str]:
    """Get past vocabulary words that need review (not yet retained)."""
    try:
        result = (
            supabase.table("vocabulary")
            .select("word")
            .eq("child_id", child_id)
            .eq("retained", False)
            .gt("times_used_later", 0)
            .order("last_used_at", desc=False)
            .limit(limit)
            .execute()
        )
        return [r["word"] for r in (result.data or [])]
    except Exception as e:
        logger.error(f"Failed to get review words: {e}")
        return []


def mark_word_used(child_id: str, word: str):
    """Increment usage count for a word used correctly in a new session."""
    try:
        existing = (
            supabase.table("vocabulary")
            .select("id, times_used_later")
            .eq("child_id", child_id)
            .eq("word", word.lower())
            .execute()
        )
        if existing.data:
            row = existing.data[0]
            new_count = row["times_used_later"] + 1
            updates = {"times_used_later": new_count}
            if new_count >= 3:
                updates["retained"] = True
            supabase.table("vocabulary").update(updates).eq("id", row["id"]).execute()
    except Exception as e:
        logger.error(f"Failed to mark word used: {e}")

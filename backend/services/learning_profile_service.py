import json
import logging
from db.supabase_client import supabase
from services.llm_service import json_completion

logger = logging.getLogger(__name__)

PROFILE_UPDATE_PROMPT = """Based on this English tutoring session transcript for a child, extract profile updates.

Child's current profile:
- Interests: {interests}
- Weak areas: {weak_areas}
- Strong areas: {strong_areas}
- Current level: {level}

Session transcript (last 10 exchanges):
{transcript}

Return JSON:
{{
  "new_interests": ["any new interests mentioned by the child"],
  "new_weak_areas": ["grammar/vocab patterns where errors were made"],
  "new_strong_areas": ["areas where the child performed well"],
  "level_adjustment": 0,
  "session_summary": "1-2 sentence summary of this session for future context"
}}

level_adjustment: -1 (too hard), 0 (appropriate), +1 (too easy and child was clearly fluent)
Only add genuinely new items. Keep lists short (max 5 each)."""


def generate_session_plan(child: dict, topic: str) -> dict:
    """Generate a session plan based on child profile and chosen topic."""
    weak_areas = child.get("weak_areas") or []
    interests = child.get("interests") or []
    level = child.get("proficiency_level", 1)

    # Build focus areas from weak areas
    focus_areas = weak_areas[:2] if weak_areas else ["general fluency", "vocabulary building"]

    # Target vocabulary based on level
    vocab_by_level = {
        1: ["happy", "tired", "because", "favorite", "usually"],
        2: ["excited", "surprised", "although", "explain", "remind"],
        3: ["exhausted", "fascinated", "however", "describe", "suggest"],
        4: ["enthusiastic", "determined", "consequently", "elaborate", "perspective"],
        5: ["exhilarating", "contemplating", "simultaneously", "distinction", "hypothesis"],
    }
    target_vocab = vocab_by_level.get(level, vocab_by_level[1])[:3]

    # Grammar targets by level
    grammar_by_level = {
        1: ["simple present", "basic questions"],
        2: ["past simple", "present continuous"],
        3: ["past continuous", "comparative adjectives"],
        4: ["present perfect", "conditionals (if + would)"],
        5: ["passive voice", "reported speech"],
    }
    target_grammar = grammar_by_level.get(level, grammar_by_level[1])

    # Difficulty notes
    difficulty_notes = f"Level {level}/5. " + (
        "Use simple vocabulary and short sentences." if level <= 2
        else "Use varied vocabulary and complex sentences." if level >= 4
        else "Balance simple and complex language."
    )

    return {
        "topic": topic,
        "target_vocabulary": target_vocab,
        "focus_areas": focus_areas,
        "target_grammar": target_grammar,
        "review_words": [],
        "difficulty_notes": difficulty_notes,
    }


def update_profile_after_session(child_id: str, child: dict, transcript_messages: list):
    """Update child's learning profile based on session transcript."""
    try:
        # Build transcript text (last 10 exchanges to save tokens)
        recent = transcript_messages[-20:] if len(transcript_messages) > 20 else transcript_messages
        transcript_text = "\n".join(
            f"{m['role'].upper()}: {m['content']}" for m in recent
        )

        result = json_completion(
            PROFILE_UPDATE_PROMPT.format(
                interests=", ".join(child.get("interests") or []) or "none",
                weak_areas=", ".join(child.get("weak_areas") or []) or "none",
                strong_areas=", ".join(child.get("strong_areas") or []) or "none",
                level=child.get("proficiency_level", 1),
                transcript=transcript_text,
            ),
            temperature=0.2,
            max_tokens=600,
        )

        # Merge new items with existing
        current_interests = set(child.get("interests") or [])
        current_weak = set(child.get("weak_areas") or [])
        current_strong = set(child.get("strong_areas") or [])

        new_interests = list(current_interests | set(result.get("new_interests", [])))[:6]
        new_weak = list(current_weak | set(result.get("new_weak_areas", [])))[:5]
        new_strong = list(current_strong | set(result.get("new_strong_areas", [])))[:5]

        new_level = child.get("proficiency_level", 1) + result.get("level_adjustment", 0)
        new_level = max(1, min(5, new_level))

        updates = {
            "interests": new_interests,
            "weak_areas": new_weak,
            "strong_areas": new_strong,
            "proficiency_level": new_level,
        }
        supabase.table("children").update(updates).eq("id", child_id).execute()

        return result.get("session_summary", "")
    except Exception as e:
        logger.error(f"Profile update failed: {e}")
        return ""


def update_streak(child_id: str, child: dict) -> int:
    """Update the child's daily streak. Returns new streak count."""
    from datetime import date, timedelta

    today = date.today()
    last_date = child.get("streak_last_date")
    current_streak = child.get("streak_current", 0)
    longest = child.get("streak_longest", 0)

    if last_date:
        last = date.fromisoformat(str(last_date))
        if last == today:
            return current_streak  # already practiced today
        elif last == today - timedelta(days=1):
            current_streak += 1
        else:
            current_streak = 1
    else:
        current_streak = 1

    longest = max(longest, current_streak)
    supabase.table("children").update({
        "streak_current": current_streak,
        "streak_last_date": str(today),
        "streak_longest": longest,
    }).eq("id", child_id).execute()
    return current_streak

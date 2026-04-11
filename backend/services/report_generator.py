import json
import logging
from db.supabase_client import supabase
from services.llm_service import json_completion
from prompts.system_prompt import REPORT_GENERATION_TEMPLATE

logger = logging.getLogger(__name__)


def generate_session_report(
    session_id: str,
    child_name: str,
    parent_language: str,
    messages: list[dict],
) -> dict:
    """Generate a structured session report from the transcript."""
    transcript = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in messages
        if m["role"] in ("child", "ai")
    )
    prompt = REPORT_GENERATION_TEMPLATE.format(
        child_name=child_name,
        transcript=transcript,
    )
    if parent_language != "en":
        prompt += f"\n\nIMPORTANT: Write the summary, highlight, and home_practice fields in {parent_language}. Keep vocabulary word fields in English."

    try:
        report = json_completion(prompt, temperature=0.3, max_tokens=1500)
        return report
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        return {
            "summary": f"{child_name} completed an English speaking session.",
            "vocabulary": [],
            "grammar_observations": {
                "did_well": "Completed the full session",
                "needs_practice": "Continue regular practice",
            },
            "highlight": f"{child_name} showed dedication by completing the session.",
            "home_practice": "Practice speaking English for a few minutes each day.",
        }


def generate_weekly_summary(
    child_name: str,
    week_data: dict,
    parent_language: str,
) -> str:
    """Generate a weekly progress summary."""
    prompt = f"""Generate a warm, encouraging weekly progress summary for a parent.

Student: {child_name}
Week: {week_data.get('week_start')}
Sessions completed: {week_data.get('sessions_count', 0)}
Total speaking time: {week_data.get('speaking_minutes', 0):.1f} minutes
New words learned: {week_data.get('new_vocab_count', 0)}
Words retained from past sessions: {week_data.get('vocab_retained', 0)}
Average quiz score: {week_data.get('quiz_avg_score', 'N/A')}/3
Level at start: {week_data.get('difficulty_level', 1)}/5

Write 2-3 sentences in {'English' if parent_language == 'en' else parent_language}.
Be specific about what the child achieved. End with what to focus on next week."""

    try:
        from services.llm_service import chat_completion
        return chat_completion(
            system_prompt="You write warm, encouraging progress reports for parents of English learners.",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=200,
        )
    except Exception as e:
        logger.error(f"Weekly summary generation failed: {e}")
        return f"{child_name} completed {week_data.get('sessions_count', 0)} sessions this week and learned {week_data.get('new_vocab_count', 0)} new words. Keep up the great work!"

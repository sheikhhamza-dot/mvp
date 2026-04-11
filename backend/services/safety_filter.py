import re
import logging
from services.llm_service import chat_completion

logger = logging.getLogger(__name__)

# Hard keyword blocklist — instant reject regardless of context
BLOCKED_KEYWORDS = [
    "sex", "sexual", "naked", "nude", "porn", "drugs", "cocaine", "heroin",
    "alcohol", "drunk", "suicide", "kill yourself", "self-harm", "cutting",
    "rape", "molest", "pedophile", "bomb", "terrorism", "weapon",
]

SAFETY_CHECK_PROMPT = """You are a content safety checker for an English tutoring app for children aged 8-14.

Review the following AI tutor response. Answer ONLY with "SAFE" or "UNSAFE".

A response is UNSAFE if it:
- Contains sexual, romantic, or adult content
- Contains violence or frightening content
- Encourages harmful behaviour
- Discusses drugs, alcohol, weapons, or self-harm
- Is inappropriate for a child aged 8-14 in any way

Response to check:
{response}

Answer (SAFE or UNSAFE):"""

FALLBACK_RESPONSE = (
    "That's interesting! Let's keep practicing your English. "
    "Tell me something fun about your day!"
)


def is_safe(response_text: str) -> bool:
    text_lower = response_text.lower()
    for keyword in BLOCKED_KEYWORDS:
        if keyword in text_lower:
            logger.warning(f"Safety: blocked keyword '{keyword}' found")
            return False

    # For borderline content, use LLM judgment
    if _contains_suspicious_patterns(text_lower):
        try:
            verdict = chat_completion(
                system_prompt="You are a content safety checker. Reply ONLY with SAFE or UNSAFE.",
                messages=[{
                    "role": "user",
                    "content": SAFETY_CHECK_PROMPT.format(response=response_text),
                }],
                temperature=0.0,
                max_tokens=10,
            )
            if "UNSAFE" in verdict.upper():
                logger.warning("Safety: LLM flagged response as unsafe")
                return False
        except Exception as e:
            logger.error(f"Safety LLM check failed: {e}")

    return True


def _contains_suspicious_patterns(text: str) -> bool:
    patterns = [
        r"\bkiss\b", r"\bdate\b.*\bgirl\b", r"\bdate\b.*\bboy\b",
        r"\bscary\b", r"\bhurt\b", r"\bfight\b", r"\bhate\b",
    ]
    return any(re.search(p, text) for p in patterns)


def safe_response(response_text: str) -> str:
    """Return response if safe, otherwise return a neutral fallback."""
    if is_safe(response_text):
        return response_text
    return FALLBACK_RESPONSE

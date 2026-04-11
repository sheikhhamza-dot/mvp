import os
import logging
from groq import Groq

logger = logging.getLogger(__name__)

GROQ_MODEL = "llama-3.3-70b-versatile"

_groq_client = None


def _get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _groq_client


def chat_completion(
    system_prompt: str,
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 500,
) -> str:
    """Call Groq and return the response text."""
    client = _get_groq_client()
    all_messages = [{"role": "system", "content": system_prompt}] + messages
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=all_messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content.strip()


def json_completion(
    prompt: str,
    temperature: float = 0.3,
    max_tokens: int = 1500,
) -> dict:
    """Request a JSON response from Groq. Returns parsed dict."""
    import json
    client = _get_groq_client()
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )
    text = completion.choices[0].message.content.strip()
    return json.loads(text)

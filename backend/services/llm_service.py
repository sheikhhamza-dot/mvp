import os
import json
import logging
from typing import Optional
from groq import Groq
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Primary: Groq Llama 3.3 70B (fast inference, generous free tier)
# Fallback: Google Gemini 2.0 Flash
GROQ_MODEL = "llama-3.3-70b-versatile"
GEMINI_MODEL = "gemini-2.0-flash"

_groq_client: Optional[Groq] = None
_gemini_configured = False


def _get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _groq_client


def _configure_gemini():
    global _gemini_configured
    if not _gemini_configured:
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        _gemini_configured = True


def chat_completion(
    system_prompt: str,
    messages: list[dict],
    temperature: float = 0.7,
    max_tokens: int = 500,
) -> str:
    """Call Groq with Gemini fallback. Returns the response text."""
    try:
        return _groq_chat(system_prompt, messages, temperature, max_tokens)
    except Exception as e:
        logger.warning(f"Groq failed ({e}), falling back to Gemini")
        return _gemini_chat(system_prompt, messages, temperature, max_tokens)


def _groq_chat(
    system_prompt: str,
    messages: list[dict],
    temperature: float,
    max_tokens: int,
) -> str:
    client = _get_groq_client()
    all_messages = [{"role": "system", "content": system_prompt}] + messages
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=all_messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content.strip()


def _gemini_chat(
    system_prompt: str,
    messages: list[dict],
    temperature: float,
    max_tokens: int,
) -> str:
    _configure_gemini()
    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=system_prompt,
        generation_config={
            "temperature": temperature,
            "max_output_tokens": max_tokens,
        },
    )
    # Convert OpenAI-style messages to Gemini format
    history = []
    for msg in messages[:-1]:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})

    chat = model.start_chat(history=history)
    last_message = messages[-1]["content"] if messages else "Hello"
    response = chat.send_message(last_message)
    return response.text.strip()


def json_completion(
    prompt: str,
    temperature: float = 0.3,
    max_tokens: int = 1500,
) -> dict:
    """Request a JSON response from the LLM. Returns parsed dict."""
    try:
        text = _groq_json(prompt, temperature, max_tokens)
    except Exception as e:
        logger.warning(f"Groq JSON failed ({e}), falling back to Gemini")
        text = _gemini_json(prompt, temperature, max_tokens)

    # Extract JSON from the response (handle markdown code blocks)
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])

    return json.loads(text)


def _groq_json(prompt: str, temperature: float, max_tokens: int) -> str:
    client = _get_groq_client()
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )
    return completion.choices[0].message.content


def _gemini_json(prompt: str, temperature: float, max_tokens: int) -> str:
    _configure_gemini()
    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        generation_config={
            "temperature": temperature,
            "max_output_tokens": max_tokens,
            "response_mime_type": "application/json",
        },
    )
    response = model.generate_content(prompt)
    return response.text

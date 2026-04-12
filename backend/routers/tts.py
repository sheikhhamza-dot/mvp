import logging
import edge_tts
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tts", tags=["tts"])

VOICE = "en-US-AriaNeural"  # most natural expressive female voice
RATE = "+5%"               # slightly brisk, natural conversational pace


@router.get("")
async def text_to_speech(text: str = Query(..., min_length=1, max_length=500)):
    if not text.strip():
        raise HTTPException(status_code=400, detail="text must not be blank")
    try:
        communicate = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE)

        async def audio_stream():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]

        return StreamingResponse(
            audio_stream(),
            media_type="audio/mpeg",
            headers={"Cache-Control": "no-cache"},
        )
    except Exception as e:
        logger.error("TTS error: %s", e)
        raise HTTPException(status_code=500, detail="TTS generation failed")

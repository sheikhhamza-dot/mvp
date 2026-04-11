from fastapi import Header, HTTPException
from db.supabase_client import supabase


async def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extract and verify Supabase JWT, return user ID."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        result = supabase.auth.get_user(token)
        if result.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return result.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

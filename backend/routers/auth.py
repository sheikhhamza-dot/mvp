import os
import bcrypt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from jose import jwt
from models.schemas import SignupRequest, LoginRequest, AuthResponse
from db.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.environ.get("JWT_SECRET", "changeme")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def _make_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/signup", status_code=201)
async def signup(data: SignupRequest):
    existing = supabase.table("parents").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = _hash_password(data.password)
    result = supabase.table("parents").insert({
        "email": data.email,
        "name": data.name,
        "password_hash": password_hash,
        "language": data.language,
    }).execute()

    row = result.data[0]
    token = _make_token(row["id"], row["email"])
    return {"id": row["id"], "email": row["email"], "name": row["name"], "token": token}


@router.post("/login")
async def login(data: LoginRequest):
    result = supabase.table("parents").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    row = result.data[0]
    if not _verify_password(data.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _make_token(row["id"], row["email"])
    return {"id": row["id"], "email": row["email"], "name": row["name"], "token": token}

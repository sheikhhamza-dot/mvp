from fastapi import APIRouter, HTTPException
from models.schemas import SignupRequest, LoginRequest, AuthResponse
from db.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(data: SignupRequest):
    try:
        result = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {"name": data.name, "language": data.language}
            },
        })
        if result.user is None:
            raise HTTPException(status_code=400, detail="Signup failed")
        return AuthResponse(
            id=result.user.id,
            email=result.user.email,
            name=data.name,
            token=result.session.access_token if result.session else "",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })
        if result.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Fetch parent name
        parent = supabase.table("parents").select("name").eq("id", result.user.id).execute()
        name = parent.data[0]["name"] if parent.data else result.user.email

        return AuthResponse(
            id=result.user.id,
            email=result.user.email,
            name=name,
            token=result.session.access_token,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

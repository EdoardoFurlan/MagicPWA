from fastapi import APIRouter, HTTPException
from app.auth.schemas import LoginRequest, TokenResponse
from app.auth.service import verify_credentials, create_access_token


router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    if not verify_credentials(req.username, req.password):
        raise HTTPException(status_code=401, detail="Credenziali errate")

    token = create_access_token(req.username)
    return TokenResponse(access_token=token)

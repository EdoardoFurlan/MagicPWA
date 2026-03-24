from typing import Optional
from fastapi import Header, HTTPException


async def verify_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token mancante o non valido")
    return authorization.replace("Bearer ", "")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import ALLOWED_ORIGINS
from app.logs.service import app_logger
from app.auth.router import router as auth_router
from app.receipts.router import router as receipts_router
from app.logs.router import router as logs_router


app = FastAPI(
    title="Receipt Scanner API",
    description="Backend per l'estrazione dati scontrini tramite OCR",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(receipts_router)
app.include_router(logs_router)


@app.get("/", tags=["General"])
async def root():
    return {"message": "Il server degli scontrini è attivo! :) :)"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

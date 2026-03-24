from fastapi import APIRouter
from pydantic import BaseModel
from app.logs.service import app_logger


class LogEntry(BaseModel):
    level: str = "INFO"
    message: str
    context: dict = {}
    userAgent: str = "Unknown"


router = APIRouter(prefix="/api", tags=["logging"])


@router.post("/logs")
async def receive_logs(entry: LogEntry):
    level = entry.level.upper()
    log_msg = f"[{entry.userAgent}] {entry.message} | Context: {entry.context}"

    if level == "DEBUG":
        app_logger.debug(log_msg)
    elif level == "INFO":
        app_logger.info(log_msg)
    elif level == "WARN":
        app_logger.warning(log_msg)
    elif level == "ERROR":
        app_logger.error(log_msg)

    return {"status": "logged"}

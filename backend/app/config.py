import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
LOG_DIR = DATA_DIR / "logs"
UPLOAD_DIR = DATA_DIR / "uploads"

LOG_FILE = LOG_DIR / "app_logs.log"
LOG_MAX_BYTES = 5 * 1024 * 1024
LOG_BACKUP_COUNT = 5

DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


SECRET_KEY = os.getenv("SECRET_KEY", "chiave-di-emergenza-non-sicura")
ALLOWED_USER = os.getenv("ADMIN_USERNAME", "dev_secret")
ALLOWED_PASS = os.getenv("ADMIN_PASSWORD", "dev_password")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://localhost:5173",
    "http://127.0.0.1:5173",
    "http://100.80.129.104:5173",
    "https://100.80.129.104:5173",
    "https://100.77.104.42:5173",
    "https://100.69.84.23:5173",
    "https://pi-235.tail8036f8.ts.net",
    "http://home.dock.receipt-app",
    "https://home.dock.receipt-app",
]

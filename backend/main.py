from fastapi import FastAPI, File, UploadFile, HTTPException, Header
from fastapi.responses import JSONResponse
import uvicorn
import shutil
import os
from datetime import datetime
import logging
from logging.handlers import RotatingFileHandler
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Receipt Scanner API",
    description="Backend per l'estrazione dati scontrini tramite OCR",
    version="1.0.0"
)

# Configura le origini permesse
origins = [
    "http://localhost:5173",          # Frontend in sviluppo su PC
    "https://localhost:5173",
    "http://127.0.0.1:5173",
    "http://100.80.129.104:5173",          # Sostituisci con l'IP Tailscale del tuo PC
    "https://100.80.129.104:5173",          # Sostituisci con l'IP Tailscale del tuo PC
    "https://100.77.104.42:5173",          
    "https://100.69.84.23:5173",  
            

]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Permette queste origini
    allow_credentials=True,
    allow_methods=["*"],               # Permette tutti i metodi (POST, GET, OPTIONS, ecc.)
    allow_headers=["*"],               # Permette tutti gli header (Authorization, Content-Type, ecc.)
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = os.path.join(BASE_DIR, "data", "logs")
LOG_FILE = os.path.join(LOG_DIR, "app_logs.log")

# 2. Creiamo la cartella se non esiste (makedirs con exist_ok=True è perfetto)
os.makedirs(LOG_DIR, exist_ok=True)

# Configurazione Rolling Logs (Max 5MB per file, tiene gli ultimi 5 file)
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
log_handler = RotatingFileHandler(
    LOG_FILE, 
    maxBytes=5*1024*1024, 
    backupCount=5
)
log_handler.setFormatter(log_formatter)

# Handler console
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)

logger_api = logging.getLogger("AppLogger")
logger_api.setLevel(logging.DEBUG)
logger_api.addHandler(log_handler)
logger_api.addHandler(console_handler)

# Cartella temporanea per salvare le foto caricate
UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/", tags=["General"])
async def root():
    return {"message": "Il server degli scontrini è attivo! :) :)"}

@app.post("/upload-receipt/", tags=["Core"])
async def upload_receipt(file: UploadFile = File(...)):
    """
    Carica una foto, salva il file e simula l'estrazione OCR.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Il file deve essere un'immagine")

    file_path = os.path.join(UPLOAD_DIR, f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
    
    # Salva il file su disco
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Qui in futuro chiameremo la funzione OCR
    # Per ora simuliamo un risultato
    mock_data = {
        "filename": file.filename,
        "saved_at": file_path,
        "extracted_data": {
            "data": "2024-05-20",
            "totale": 15.50,
            "valuta": "EUR"
        },
        "status": "success"
    }
    
    return JSONResponse(content=mock_data)

@app.post("/api/logs", tags=["Logging"])
async def receive_logs(entry: dict, authorization: str = Header(None)):
    # Qui potresti validare il JWT prima di scrivere

    level = entry.get("level", "INFO").upper()
    message = entry.get("message")
    ctx = entry.get("context", {})
    ua = entry.get("userAgent", "Unknown")

    log_msg = f"[{ua}] {message} | Context: {ctx}"

    if level == "DEBUG": logger_api.debug(log_msg)
    elif level == "INFO": logger_api.info(log_msg)
    elif level == "WARN": logger_api.warning(log_msg)
    elif level == "ERROR": logger_api.error(log_msg)

    return {"status": "logged"}



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

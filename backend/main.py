from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
import shutil
import os
from datetime import datetime

app = FastAPI(
    title="Receipt Scanner API",
    description="Backend per l'estrazione dati scontrini tramite OCR",
    version="1.0.0"
)

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

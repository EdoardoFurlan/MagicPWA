import os
import shutil
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.config import UPLOAD_DIR
from app.receipts.schemas import ExtractedData, ReceiptResponse


def validate_file(file: UploadFile) -> None:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Il file deve essere un'immagine")


def save_file(file: UploadFile) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    original_filename = file.filename or "unknown"
    filename = f"{timestamp}_{original_filename}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return str(file_path)


def get_pasto(ora: int) -> str:
    if 5 <= ora < 11:
        return "Colazione"
    elif 11 <= ora < 16:
        return "Pranzo"
    else:
        return "Cena"


def extract_data_from_receipt(file_path: str) -> ExtractedData:
    now = datetime.now()
    data_formatted = now.strftime("%d/%m/%Y %H:%M")
    ora = now.hour
    pasto = get_pasto(ora)

    return ExtractedData(
        data=data_formatted,
        totale=15.50,
        valuta="EUR",
        pasto=pasto
    )


def process_receipt(file: UploadFile) -> ReceiptResponse:
    validate_file(file)
    saved_path = save_file(file)
    extracted = extract_data_from_receipt(saved_path)

    return ReceiptResponse(
        filename=file.filename or "unknown",
        saved_at=saved_path,
        extracted_data=extracted,
        status="success"
    )

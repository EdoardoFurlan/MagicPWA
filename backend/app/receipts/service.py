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
    filename = f"{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return str(file_path)


def extract_data_from_receipt(file_path: str) -> ExtractedData:
    return ExtractedData(
        data="2024-05-20",
        totale=15.50,
        valuta="EUR"
    )


def process_receipt(file: UploadFile) -> ReceiptResponse:
    validate_file(file)
    saved_path = save_file(file)
    extracted = extract_data_from_receipt(saved_path)

    return ReceiptResponse(
        filename=file.filename,
        saved_at=saved_path,
        extracted_data=extracted,
        status="success"
    )

import os
import shutil
import logging
from datetime import datetime
from fastapi import UploadFile, HTTPException
from PIL import Image
import pytesseract

from app.config import UPLOAD_DIR
from app.receipts.schemas import ExtractedData, ReceiptResponse
from app.llm.client import call_ollama

logger = logging.getLogger(__name__)


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


def delete_file(file_path: str) -> None:
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File eliminato: {file_path}")
    except Exception as e:
        logger.warn(f"Errore eliminazione file {file_path}: {e}")


def ocr_image(image_path: str) -> str:
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, lang='ita+eng')
        logger.info(f"OCR completato, caratteri estratti: {len(text)}")
        return text
    except Exception as e:
        logger.error(f"Errore OCR: {e}")
        raise RuntimeError(f"Errore nell'elaborazione dell'immagine: {e}")


def parse_date(date_str: str, ora_str: str | None = None) -> tuple[str, int]:
    now = datetime.now()
    ora = now.hour
    minuti = now.minute
    
    if ora_str:
        try:
            ora, minuti = map(int, ora_str.split(':'))
        except (ValueError, AttributeError):
            logger.warn(f"Impossibile parsare l'ora '{ora_str}', uso ora corrente")
    
    try:
        date_str = date_str.strip()
        
        for fmt in ["%d/%m/%Y", "%Y-%m-%d"]:
            try:
                parsed = datetime.strptime(date_str, fmt)
                parsed = parsed.replace(hour=ora, minute=minuti)
                return parsed.strftime("%d/%m/%Y %H:%M"), parsed.hour
            except ValueError:
                continue
        
        if '/' in date_str:
            day, month, year = map(int, date_str.split('/'))
            parsed = datetime(year, month, day, ora, minuti)
            return parsed.strftime("%d/%m/%Y %H:%M"), parsed.hour
        
        raise ValueError("Formato data non riconosciuto")
        
    except Exception:
        logger.warn(f"Impossibile parsare la data '{date_str}', uso data corrente")
        return now.strftime("%d/%m/%Y %H:%M"), now.hour


def get_pasto(ora: int) -> str:
    if 5 <= ora < 11:
        return "Colazione"
    elif 11 <= ora < 16:
        return "Pranzo"
    else:
        return "Cena"


async def extract_data_from_receipt(file_path: str) -> ExtractedData:
    try:
        ocr_text = ocr_image(file_path)
        
        if not ocr_text.strip():
            raise ValueError("Nessun testo estratto dall'immagine")
        
        llm_result = await call_ollama(ocr_text)
        
        data_str = llm_result.get("data", "")
        ora_str = llm_result.get("ora")
        data_formatted, ora = parse_date(data_str, ora_str)
        
        totale = float(llm_result.get("totale", 0.0))
        valuta = llm_result.get("valuta", "EUR")
        pasto = get_pasto(ora)
        
        logger.info(f"Dati estratti: data={data_formatted}, totale={totale}, valuta={valuta}, pasto={pasto}")
        
        return ExtractedData(
            data=data_formatted,
            totale=round(totale, 2),
            valuta=valuta,
            pasto=pasto
        )
        
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Errore estrazione dati: {e}")
        raise HTTPException(status_code=500, detail=f"Errore nell'elaborazione: {str(e)}")


async def process_receipt(file: UploadFile) -> ReceiptResponse:
    validate_file(file)
    saved_path = save_file(file)
    
    try:
        extracted = await extract_data_from_receipt(saved_path)
        
        return ReceiptResponse(
            filename=file.filename or "unknown",
            saved_at=saved_path,
            extracted_data=extracted,
            status="success"
        )
    finally:
        delete_file(saved_path)

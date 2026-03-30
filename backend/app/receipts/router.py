from fastapi import APIRouter, File, UploadFile
from app.receipts.schemas import ReceiptResponse
from app.receipts.service import process_receipt


router = APIRouter(prefix="/api", tags=["receipts"])


@router.post("/upload-receipt/", response_model=ReceiptResponse)
async def upload_receipt(file: UploadFile = File(...)):
    return process_receipt(file)

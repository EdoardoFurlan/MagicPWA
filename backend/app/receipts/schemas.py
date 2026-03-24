from pydantic import BaseModel


class ExtractedData(BaseModel):
    data: str
    totale: float
    valuta: str = "EUR"


class ReceiptResponse(BaseModel):
    filename: str
    saved_at: str
    extracted_data: ExtractedData
    status: str

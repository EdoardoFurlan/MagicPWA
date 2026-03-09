# Usa un'immagine Python leggera
FROM python:3.11-slim

# Crea un utente con lo stesso UID/GID di pi
RUN groupadd -g 1000 pi && \
    useradd -m -u 1000 -g 1000 pi

# Cambia utente
USER pi

# Installa dipendenze di sistema per l'OCR (Tesseract/OpenCV)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Avvia FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

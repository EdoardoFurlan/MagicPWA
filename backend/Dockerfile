# Usa un'immagine Python leggera
FROM python:3.11-slim

# Installa dipendenze di sistema per l'OCR (Tesseract/OpenCV)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN mkdir -p /app/data && chown -R 1000:1000 /app/data

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Cambiamo il proprietario di tutto il contenuto di /app per sicurezza
RUN chown -R 1000:1000 /app

# Switchiamo all'utente 1000 così il container non gira come root
USER 1000
# Avvia FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


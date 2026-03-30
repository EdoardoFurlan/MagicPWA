import httpx
import json
import logging

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://ollama:11434"
DEFAULT_MODEL = "llama3.2:1b"


def build_prompt(ocr_text: str) -> str:
    return f"""Sei un assistente che estrae dati da scontrini fiscali italiani.
Dal testo seguente, estrai:
- data (formato DD/MM/YYYY oppure YYYY-MM-DD se presente sullo scontrino)
- ora (formato HH:MM se presente sullo scontrino, altrimenti usa l'ora attuale)
- totale (il numero più grande che rappresenta il totale, con 2 decimali)
- valuta (EUR, USD, GBP, ecc. - Default EUR se non specificato)

Istruzioni importanti:
1. La data sullo scontrino potrebbe essere nel formato GG/MM/AAAA o AAAA-MM-GG
2. L'ora potrebbe essere nel formato HH:MM
3. Il totale è solitamente l'ultimo numero più grande, spesso seguito da "€" o "EUR"
4. Se non trovi la data o l'ora, usa la data e ora odierne

Rispondi SOLO con JSON valido, nessun altro testo:
{{"data": "DD/MM/YYYY", "ora": "HH:MM", "totale": 0.00, "valuta": "EUR"}}

Testo scontrino:
{ocr_text}"""


def parse_llm_response(response_text: str) -> dict:
    try:
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"Errore parsing JSON risposta LLM: {e}. Risposta: {response_text}")
        raise ValueError(f"Risposta LLM non valida: {response_text}")


async def call_ollama(ocr_text: str, model: str = DEFAULT_MODEL) -> dict:
    prompt = build_prompt(ocr_text)
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            
            if "response" not in result:
                raise ValueError(f"Risposta Ollama non valida: {result}")
            
            return parse_llm_response(result["response"])
            
    except httpx.ConnectError:
        logger.error("Ollama non disponibile - container probabilmente spento")
        raise ConnectionError("Servizio OCR temporaneamente non disponibile. Riprova più tardi.")
    except httpx.TimeoutException:
        logger.error("Timeout chiamata Ollama")
        raise TimeoutError("Timeout del servizio OCR. Riprova.")
    except Exception as e:
        logger.error(f"Errore chiamata Ollama: {e}")
        raise RuntimeError(f"Errore del servizio OCR: {str(e)}")

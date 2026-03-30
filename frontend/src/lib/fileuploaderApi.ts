import { apiFetch } from './authenticatedApi';

interface ExtractedData {
  data: string;
  totale: number;
  valuta: string;
  pasto: string;
}

export interface ReceiptResponse {
  filename: string;
  saved_at: string;
  extracted_data: ExtractedData;
  status: string;
}

export async function uploadReceipt(file: File): Promise<ReceiptResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch('/api/upload-receipt/', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Errore sconosciuto' }));
    throw new Error(errorData.detail || 'Upload fallito');
  }

  return response.json();
}

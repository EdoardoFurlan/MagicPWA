import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Camera, Loader2, CheckCircle, XCircle } from "lucide-react";
import { uploadReceipt, type ReceiptResponse } from '@/lib/fileuploaderApi';
import { logger } from '@/services/logger';

export function ScanPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      const newUrl = URL.createObjectURL(file);
      setImageUrl(newUrl);
      setReceiptData(null);
      setError(null);

      setIsUploading(true);
      try {
        logger.info("Caricamento scontrino avviato");
        const response = await uploadReceipt(file);
        setReceiptData(response);
        logger.info("Scontrino caricato con successo", { data: response.extracted_data });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
        setError(errorMessage);
        logger.error("Errore caricamento scontrino", { error: errorMessage });
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Acquisizione Scontrino
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-10">
          <div className="text-center space-y-4">
            <Camera className="h-20 w-20 mx-auto text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground">
              Scatta una foto dello scontrino o selezionala dalla galleria
            </p>
            <Button onClick={handleCapture} className="w-full bg-white text-black dark:bg-gray-800 dark:text-white border">
              <Camera className="h-4 w-4 mr-2" />
              Acquisisci Immagine
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {imageUrl && (
            <div className="mt-4 space-y-2 w-full">
              <p className="text-xs font-bold uppercase text-muted-foreground">Anteprima:</p>
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt="Scontrino acquisito"
                  className="max-h-64 rounded-lg border shadow-md object-contain bg-white"
                />
              </div>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Upload in corso...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive w-full">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {receiptData && !isUploading && !error && (
            <div className="mt-4 w-full">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Dati Estratti:</p>
              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">{receiptData.extracted_data.data}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pasto:</span>
                  <span className="font-medium">{receiptData.extracted_data.pasto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Totale:</span>
                  <span className="font-medium">
                    {receiptData.extracted_data.valuta === 'EUR' ? '€' : ''}{receiptData.extracted_data.totale.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-green-600 pt-2 border-t">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Elaborato con successo</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

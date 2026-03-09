import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logger } from "@/services/logger";
import { Nfc, Loader2, Smartphone } from "lucide-react";

export function NfcPage() {
  const [isReading, setIsReading] = useState(false);
  const [nfcData, setNfcData] = useState<string | null>(null);

  const startNfcScan = async () => {
    if (!('NDEFReader' in window)) {
      logger.error("NFC non supportato su questo browser/dispositivo");
      alert("NFC non supportato. Usa Chrome su Android.");
      return;
    }

    try {
      setIsReading(true);
      // @ts-ignore - NDEFReader potrebbe non essere ancora nei tipi standard TS
      const ndef = new NDEFReader();
      await ndef.scan();

      logger.info("Scansione NFC avviata");

      ndef.addEventListener("readingerror", () => {
        logger.warn("Errore di lettura NFC. Tag non valido?");
      });

      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        console.log("Tag rilevato!", serialNumber);

        // Se non ci sono record, mostriamo almeno il numero di serie
        if (message.records.length === 0) {
          setNfcData(`Tag rilevato ma VUOTO. Serial: ${serialNumber}`);
          logger.info("Tag letto (vuoto)", { serialNumber });
          return;
        }

        // Iteriamo su tutti i record per trovare quello di testo
        for (const record of message.records) {
          console.log("Tipo record:", record.recordType);

          if (record.recordType === "text") {
            const textDecoder = new TextDecoder();
            const decodedData = textDecoder.decode(record.data);
            setNfcData(`Dato: ${decodedData} (ID: ${serialNumber})`);
            logger.info("Testo letto", { decodedData });
          } else {
            setNfcData(`Tipo record non supportato: ${record.recordType}. Serial: ${serialNumber}`);
          }
        }
        setIsReading(false);
      });

    } catch (error) {
      logger.error("Errore inizializzazione NFC", { error });
      setIsReading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Nfc className="h-6 w-6" />
            Lettura NFC
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-10">
          {!isReading ? (
            <div className="text-center space-y-4">
              <Smartphone className="h-20 w-20 mx-auto text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">
                Clicca il pulsante e avvicina la card al retro del telefono
              </p>
              <Button onClick={startNfcScan} className="w-full bg-white text-black dark:bg-gray-800 dark:text-white border">
                Attiva Lettore
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Loader2 className="h-20 w-20 mx-auto animate-spin text-primary" />
              <p className="font-medium animate-pulse">In attesa del tag...</p>
              <Button variant="outline" onClick={() => window.location.reload()} className='bg-white text-black dark:bg-gray-800 dark:text-white border'>
                Annulla
              </Button>
            </div>
          )}

          {nfcData && (
            <div className="mt-4 p-4 bg-secondary rounded-lg w-full break-all">
              <p className="text-xs font-bold uppercase text-muted-foreground">Risultato:</p>
              <code className="text-sm">{nfcData}</code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";

export function ScanPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

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
        </CardContent>
      </Card>
    </div>
  );
}

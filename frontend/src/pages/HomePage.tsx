import { Button } from  "@/components/ui/button";
import { Camera, FileSpreadsheet } from "lucide-react"; //LogOut

export function HomePage() {



  //todo gestire caricamento scontrino con fotocamera, e chiamata api trmite apiFetch() appena creata, con gestione token e errori (es. token scaduto)





  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">I miei Scontrini</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pulsantoni ottimizzati per il pollice su smartphone */}
        <Button className="h-32 text-lg flex flex-col gap-2 bg-white dark:bg-gray-800 text-black dark:text-white">
          <Camera className="h-8 w-8" />
          Scansiona Scontrino
        </Button>
        
        <Button variant="outline" className="h-32 text-lg flex flex-col gap-2 border-gray-300 dark:border-gray-600 text-black dark:text-white">
          <FileSpreadsheet className="h-8 w-8" />
          Esporta Excel
        </Button>
      </div>
    </div>
  );
}
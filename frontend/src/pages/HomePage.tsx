import { useAuthStore } from '../store/authStore';
import { Button } from  "@/components/ui/button";
import { LogOut, Camera, FileSpreadsheet } from "lucide-react";

export function HomePage() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">I miei Scontrini</h1>
        <Button variant="ghost" size="icon" onClick={() => logout()}>
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pulsantoni ottimizzati per il pollice su smartphone */}
        <Button className="h-32 text-lg flex flex-col gap-2">
          <Camera className="h-8 w-8" />
          Scansiona Scontrino
        </Button>
        
        <Button variant="outline" className="h-32 text-lg flex flex-col gap-2">
          <FileSpreadsheet className="h-8 w-8" />
          Esporta Excel
        </Button>
      </div>
    </div>
  );
}
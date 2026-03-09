import { Link } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Camera, Home, SmartphoneNfc, FileSpreadsheet, LogOut, ReceiptText } from 'lucide-react';

export function Navbar() {
    const logout = useAuthStore((state) => state.logout);
    const token = useAuthStore((state) => state.token);

    // Se non siamo loggati, non mostriamo la navbar
    if (!token) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="max-w-2xl mx-auto flex h-16 items-center justify-between px-4">
                {/* Brand / Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-primary">
                    <ReceiptText className="h-6 w-6" />
                    <span className="hidden sm:inline">SmartReceipt</span>
                </Link>

                {/* Links di navigazione */}
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip >
                            <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" asChild>
                                <Link
                                    to="/"
                                    activeProps={{ className: 'text-primary bg-secondary' }}
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    <span className="hidden xs:inline">Home</span>
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-black dark:bg-gray-800 dark:text-white border">
                            Home
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip >
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" asChild>
                                <Link
                                    to="/nfc"
                                    activeProps={{ className: 'text-primary bg-secondary' }}
                                    className="flex items-center gap-2"
                                >
                                    <SmartphoneNfc className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-black dark:bg-gray-800 dark:text-white border">
                            NFC
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>




                <Button variant="ghost" size="sm" onClick={() => logout()}>
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
        </nav >
    );
}

export function BottomNav() {
    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around py-3 px-2 z-50">
            <Link to="/" className="flex flex-col items-center gap-1 text-muted-foreground" activeProps={{ className: 'text-primary' }}>
                <Home className="h-6 w-6" />
                <span className="text-[10px]">Home</span>
            </Link>
            {/* <Link to="/scan" className="flex flex-col items-center gap-1 text-muted-foreground" activeProps={{ className: 'text-primary' }}>
        <Camera className="h-6 w-6" />
        <span className="text-[10px]">Scansiona</span>
      </Link>
      <Link to="/export" className="flex flex-col items-center gap-1 text-muted-foreground" activeProps={{ className: 'text-primary' }}>
        <FileSpreadsheet className="h-6 w-6" />
        <span className="text-[10px]">Export</span>
      </Link> */}
        </div>
    );
}
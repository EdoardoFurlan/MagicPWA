import { Link } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Home, SmartphoneNfc, LogOut, ReceiptText } from 'lucide-react';//Camera,FileSpreadsheet

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


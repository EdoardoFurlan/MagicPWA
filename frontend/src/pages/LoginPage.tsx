import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { loginSchema } from '../schemas/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logger } from '@/services/logger';

export function LoginPage() {
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    // Validazione Zod
    const result = loginSchema.safeParse(data);
    
    if (!result.success) {
      setError(result.error.issues.map(issue => issue.message).join(', '));
      return;
    }

    // Qui chiameresti il backend. Per ora dummy login:
    setToken("token-jwt-finto-dal-backend");
    logger.info("Utente loggato con successo", { username: data.username });
    navigate({ to: '/' });
  };

  return (
    <div className="flex items-center justify-center h-screen -mt-32">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Accesso App Scontrini</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="username" placeholder="Username" />
            <Input name="password" type="password" placeholder="Password" />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-white dark:bg-gray-800 text-black dark:text-white">Accedi</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
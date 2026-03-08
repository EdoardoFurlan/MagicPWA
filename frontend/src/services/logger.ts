import { useAuthStore } from "@/store/authStore";
import { logSchema, type LogEntry, logLevels } from "@/schemas/log";

type LogLevel = (typeof logLevels)[number];

class Logger {
  private async sendToBackend(level: LogLevel, message: string, context?: Record<string, any>) {
    const token = useAuthStore.getState().token;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      context: context || {}
    };

    // Validazione locale prima dell'invio
    const validation = logSchema.safeParse(entry);
    if (!validation.success) {
      console.error("Schema log non valido:", validation.error);
      return;
    }

    // Console mirror per lo sviluppo locale
    this.consoleMirror(level, message, entry.context);

    try {
      // Nota: Usiamo l'URL completo del Raspberry o un proxy di Vite
      await fetch('http://localhost:8000/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entry),
      });
    } catch (e) {
      // Se il backend è offline (es. niente rete), salviamo in localStorage?
      // Per ora ci accontentiamo del fail silenzioso
      console.warn("Invio log al backend fallito (Offline?)");
    }
  }

  private consoleMirror(level: LogLevel, msg: string, ctx: any) {
    const styles = {
      DEBUG: "color: gray",
      INFO: "color: blue",
      WARN: "color: orange",
      ERROR: "color: red; font-weight: bold"
    };
    console.log(`%c[${level}] %s`, styles[level], msg, ctx);
  }

  debug(msg: string, ctx?: any) { this.sendToBackend('DEBUG', msg, ctx); }
  info(msg: string, ctx?: any) { this.sendToBackend('INFO', msg, ctx); }
  warn(msg: string, ctx?: any) { this.sendToBackend('WARN', msg, ctx); }
  error(msg: string, ctx?: any) { this.sendToBackend('ERROR', msg, ctx); }
}

export const logger = new Logger();
type LogLevel = 'debug' |'info' | 'error' | 'warn';

class Logger {
  private async sendToBackend(level: LogLevel, message: string) {
    try {
      // Chiamata all'API dummy che implementeremo nel backend
      await fetch('/api/logs', {
        method: 'POST',
        body: JSON.stringify({ level, message, timestamp: new Date().toISOString() }),
      });
    } catch (e) {
      console.error("Logging fallito", e);
    }
  }

  debug(msg: string) { this.sendToBackend('debug', msg); console.error(msg); }
  info(msg: string) { this.sendToBackend('info', msg); console.log(msg); }
  error(msg: string) { this.sendToBackend('error', msg); console.error(msg); }
  warn(msg: string) { this.sendToBackend('warn', msg); console.error(msg); }

}

export const logger = new Logger();
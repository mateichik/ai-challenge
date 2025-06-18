export class Logger {
  static info(message: string): void {
    console.log(`[INFO] ${message}`);
  }
  
  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`);
    if (error) {
      console.error(error);
    }
  }
  
  static debug(message: string): void {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`);
    }
  }
} 
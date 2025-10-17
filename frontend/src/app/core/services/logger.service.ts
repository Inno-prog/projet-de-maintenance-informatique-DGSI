import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = LogLevel.INFO; // Default to INFO level

  constructor() {
    // In production, you might want to set this based on environment
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      this.logLevel = LogLevel.WARN; // Only show warnings and errors in production
    }
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
  }

  // Method to log HTTP requests
  logRequest(method: string, url: string, status?: number): void {
    const statusText = status ? ` - Status: ${status}` : '';
    this.info(`HTTP ${method} ${url}${statusText}`);
  }

  // Method to log user actions
  logUserAction(action: string, details?: any): void {
    this.info(`User Action: ${action}`, details);
  }

  // Method to log errors with context
  logErrorWithContext(context: string, error: any, additionalInfo?: any): void {
    this.error(`Error in ${context}:`, error, additionalInfo);
  }
}

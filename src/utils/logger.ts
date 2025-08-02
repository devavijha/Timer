/**
 * Performance-optimized logging utility
 * Only logs in development mode to improve production performance
 */

class Logger {
  private isDev = __DEV__;

  log(...args: any[]) {
    if (this.isDev) {
      console.log(...args);
    }
  }

  info(...args: any[]) {
    if (this.isDev) {
      console.info(...args);
    }
  }

  warn(...args: any[]) {
    if (this.isDev) {
      console.warn(...args);
    }
  }

  error(...args: any[]) {
    // Always log errors, even in production
    console.error(...args);
  }

  // Performance-sensitive operations
  debug(...args: any[]) {
    if (this.isDev) {
      console.log('🐛', ...args);
    }
  }

  auth(...args: any[]) {
    if (this.isDev) {
      console.log('🔐', ...args);
    }
  }

  audio(...args: any[]) {
    if (this.isDev) {
      console.log('🎵', ...args);
    }
  }

  performance(...args: any[]) {
    if (this.isDev) {
      console.log('⚡', ...args);
    }
  }
}

export const logger = new Logger();

// For quick migration from console.log
export const devLog = (...args: any[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

/**
 * Enhanced Error Handling System
 * Provides structured error types and recovery strategies
 */

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FILE_PROCESSING_ERROR = 'FILE_PROCESSING_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CIRCUIT_BREAKER_ERROR = 'CIRCUIT_BREAKER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  timestamp: number;
  userAgent: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
  };
  operationId?: string;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly userMessage: string;

  constructor(
    message: string,
    type: ErrorType,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    recoverable: boolean = true,
    userMessage?: string,
    context?: Partial<ErrorContext>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.recoverable = recoverable;
    this.userMessage = userMessage || this.getDefaultUserMessage();
    this.context = {
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      ...context
    };
  }

  private getDefaultUserMessage(): string {
    switch (this.type) {
      case ErrorType.VALIDATION_ERROR:
        return 'The data format is invalid. Please check your file and try again.';
      case ErrorType.FILE_PROCESSING_ERROR:
        return 'Unable to process the file. Please try a different file or format.';
      case ErrorType.PARSE_ERROR:
        return 'Failed to read the file contents. The file may be corrupted.';
      case ErrorType.CIRCUIT_BREAKER_ERROR:
        return 'Service is temporarily unavailable. Please try again in a few moments.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      recoverable: this.recoverable,
      userMessage: this.userMessage,
      context: this.context,
      stack: this.stack
    };
  }
}

export class ErrorHandler {
  private static errors: AppError[] = [];
  private static maxErrors = 100;
  private static listeners: ((error: AppError) => void)[] = [];

  static handle(error: unknown, context?: Partial<ErrorContext>): AppError {
    const appError = this.normalizeError(error, context);
    this.logError(appError);
    this.notifyListeners(appError);
    return appError;
  }

  static normalizeError(error: unknown, context?: Partial<ErrorContext>): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      // Try to categorize the error based on message content
      const message = error.message.toLowerCase();
      
      if (message.includes('validation') || message.includes('invalid')) {
        return new AppError(
          error.message,
          ErrorType.VALIDATION_ERROR,
          ErrorSeverity.MEDIUM,
          true,
          undefined,
          context
        );
      }
      
      if (message.includes('parse') || message.includes('syntax')) {
        return new AppError(
          error.message,
          ErrorType.PARSE_ERROR,
          ErrorSeverity.HIGH,
          true,
          undefined,
          context
        );
      }
      
      if (message.includes('network') || message.includes('fetch')) {
        return new AppError(
          error.message,
          ErrorType.NETWORK_ERROR,
          ErrorSeverity.MEDIUM,
          true,
          undefined,
          context
        );
      }
    }

    return new AppError(
      error instanceof Error ? error.message : String(error),
      ErrorType.UNKNOWN_ERROR,
      ErrorSeverity.MEDIUM,
      true,
      undefined,
      context
    );
  }

  static logError(error: AppError): void {
    this.errors.push(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', error.toJSON());
    }
  }

  static getRecentErrors(): AppError[] {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(error: AppError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
}

// Retry utility with exponential backoff
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, baseDelay, maxDelay, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config
  };

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
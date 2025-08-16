/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascade failures and provides graceful degradation
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerMetrics {
  totalRequests: number;
  totalFailures: number;
  successRate: number;
  state: CircuitState;
  lastFailureTime: number | null;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number | null = null;
  private successCount: number = 0;
  private totalRequests: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN - operation rejected');
      }
    }

    try {
      this.totalRequests++;
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    if (this.state === CircuitState.HALF_OPEN) {
      this.reset();
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeout;
  }

  private reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      totalRequests: this.totalRequests,
      totalFailures: this.failureCount,
      successRate: this.totalRequests > 0 ? (this.successCount / this.totalRequests) * 100 : 0,
      state: this.state,
      lastFailureTime: this.lastFailureTime
    };
  }

  getState(): CircuitState {
    return this.state;
  }

  isOperational(): boolean {
    return this.state === CircuitState.CLOSED || this.state === CircuitState.HALF_OPEN;
  }
}
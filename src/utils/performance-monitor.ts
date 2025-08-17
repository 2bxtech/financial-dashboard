/**
 * Performance Monitoring Utility for Zustand Store
 * Tracks store performance and provides debugging information
 */

import { useAppStore } from '../store';

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  stateSize?: number;
  changedProperties?: string[];
}

export interface StorePerformanceData {
  totalOperations: number;
  averageDuration: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
  recentOperations: PerformanceMetric[];
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Performance Monitor Class
 */
class StorePerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = false;
  private maxMetrics: number = 100;
  private subscriberCount = 0;

  /**
   * Enable performance monitoring
   */
  enable(): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    console.log('Store performance monitoring enabled');
    
    // Subscribe to store changes
    this.subscriberCount++;
    useAppStore.subscribe(
      (state: any) => state,
      (current: any, previous: any) => {
        if (this.isEnabled) {
          this.recordStateChange(current, previous);
        }
      }
    );
  }

  /**
   * Disable performance monitoring
   */
  disable(): void {
    this.isEnabled = false;
    console.log('Store performance monitoring disabled');
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    console.log('Performance metrics cleared');
  }

  /**
   * Record a manual operation
   */
  recordOperation(operation: string, duration: number, changedProperties?: string[]): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      changedProperties,
      stateSize: this.getStateSize(),
    };

    this.addMetric(metric);
  }

  /**
   * Record state change automatically
   */
  private recordStateChange(current: any, previous: any): void {
    const startTime = performance.now();
    
    try {
      const changedProperties = this.getChangedProperties(current, previous);
      const duration = performance.now() - startTime;
      
      if (changedProperties.length > 0) {
        this.recordOperation('state_change', duration, changedProperties);
      }
    } catch (error) {
      console.warn('Error recording state change:', error);
    }
  }

  /**
   * Get changed properties between two states
   */
  private getChangedProperties(current: any, previous: any): string[] {
    const changed: string[] = [];
    
    const allKeys = new Set([
      ...Object.keys(current || {}),
      ...Object.keys(previous || {})
    ]);

    for (const key of allKeys) {
      if (current[key] !== previous[key]) {
        changed.push(key);
      }
    }

    return changed;
  }

  /**
   * Estimate state size
   */
  private getStateSize(): number {
    try {
      const state = useAppStore.getState();
      return JSON.stringify(state).length;
    } catch {
      return 0;
    }
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get performance data summary
   */
  getPerformanceData(): StorePerformanceData {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        recentOperations: [],
      };
    }

    const durations = this.metrics.map(m => m.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    
    const sortedByDuration = [...this.metrics].sort((a, b) => b.duration - a.duration);
    
    return {
      totalOperations: this.metrics.length,
      averageDuration: totalDuration / this.metrics.length,
      slowestOperation: sortedByDuration[0] || null,
      fastestOperation: sortedByDuration[sortedByDuration.length - 1] || null,
      recentOperations: this.metrics.slice(-10),
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Get memory usage information
   */
  private getMemoryUsage(): StorePerformanceData['memoryUsage'] {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return undefined;
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const data = this.getPerformanceData();
    
    console.group('🎯 Store Performance Summary');
    console.log(`Total Operations: ${data.totalOperations}`);
    console.log(`Average Duration: ${data.averageDuration.toFixed(2)}ms`);
    
    if (data.slowestOperation) {
      console.log(`Slowest Operation: ${data.slowestOperation.operation} (${data.slowestOperation.duration.toFixed(2)}ms)`);
    }
    
    if (data.fastestOperation) {
      console.log(`Fastest Operation: ${data.fastestOperation.operation} (${data.fastestOperation.duration.toFixed(2)}ms)`);
    }
    
    if (data.memoryUsage) {
      const usedMB = (data.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (data.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2);
      console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB`);
    }
    
    if (data.recentOperations.length > 0) {
      console.table(data.recentOperations.map(op => ({
        operation: op.operation,
        duration: `${op.duration.toFixed(2)}ms`,
        changedProperties: op.changedProperties?.join(', ') || 'N/A',
        stateSize: op.stateSize ? `${(op.stateSize / 1024).toFixed(1)}KB` : 'N/A'
      })));
    }
    
    console.groupEnd();
  }

  /**
   * Get metrics for specific operation type
   */
  getMetricsForOperation(operation: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.operation === operation);
  }

  /**
   * Get slow operations (above threshold)
   */
  getSlowOperations(thresholdMs: number = 10): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.duration > thresholdMs);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.getPerformanceData(),
    }, null, 2);
  }

  /**
   * Import metrics from exported data
   */
  importMetrics(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.metrics && Array.isArray(parsed.metrics)) {
        this.metrics = parsed.metrics;
        console.log(`Imported ${this.metrics.length} performance metrics`);
      }
    } catch (error) {
      console.error('Failed to import metrics:', error);
    }
  }
}

// Create singleton instance
export const storePerformanceMonitor = new StorePerformanceMonitor();

/**
 * Hook to access performance monitoring
 */
export const useStorePerformance = () => {
  return {
    enable: () => storePerformanceMonitor.enable(),
    disable: () => storePerformanceMonitor.disable(),
    clear: () => storePerformanceMonitor.clear(),
    getData: () => storePerformanceMonitor.getPerformanceData(),
    logSummary: () => storePerformanceMonitor.logSummary(),
    exportMetrics: () => storePerformanceMonitor.exportMetrics(),
    importMetrics: (data: string) => storePerformanceMonitor.importMetrics(data),
    recordOperation: (operation: string, duration: number, changedProperties?: string[]) =>
      storePerformanceMonitor.recordOperation(operation, duration, changedProperties),
  };
};

/**
 * Performance measurement decorator for store actions
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  operation: string,
  fn: T
): T => {
  return ((...args: any[]) => {
    const startTime = performance.now();
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const duration = performance.now() - startTime;
          storePerformanceMonitor.recordOperation(operation, duration);
        });
      } else {
        const duration = performance.now() - startTime;
        storePerformanceMonitor.recordOperation(operation, duration);
        return result;
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      storePerformanceMonitor.recordOperation(`${operation}_error`, duration);
      throw error;
    }
  }) as T;
};

/**
 * Auto-enable performance monitoring in development
 */
if (
  (
    process.env.NODE_ENV === 'development' ||
    process.env.VITE_ENV === 'development' ||
    (!process.env.NODE_ENV && process.env.ENABLE_STORE_PERFORMANCE_MONITOR === 'true')
  ) &&
  process.env.DISABLE_STORE_PERFORMANCE_MONITOR !== 'true'
) {
  // Enable monitoring automatically in development
  storePerformanceMonitor.enable();
  
  // Add global access for debugging
  (window as any).__storePerformance = {
    monitor: storePerformanceMonitor,
    summary: () => storePerformanceMonitor.logSummary(),
    clear: () => storePerformanceMonitor.clear(),
  };
  
  console.log('🎯 Store performance monitoring enabled (development mode)');
  console.log('Access via window.__storePerformance in dev tools');
}
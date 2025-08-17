/**
 * Enhanced File Processing Service with Service Layer Architecture
 * Now uses dependency injection and clean separation of concerns
 */

import { CircuitBreaker, CircuitBreakerConfig, CircuitState } from '../utils/circuit-breaker';
import { AppError, ErrorType, ErrorSeverity, ErrorHandler, withRetry } from '../utils/error-handling';
import { validateData, validateHeaders, validateFile } from '../utils/validation-utils';
import { FinancialData, ChartDataPoint } from '../types';
import { fileParserFactory } from './parsers/file-parser-factory';
import { dataProcessingService } from './data-processing.service';
import { IFileParser } from './interfaces/IFileParser';

export interface ProcessedFileResult {
  data: FinancialData;
  chartData: ChartDataPoint[];
  processingTime: number;
  warnings: string[];
}

export interface FileProcessingMetrics {
  totalFilesProcessed: number;
  successfulProcessing: number;
  failedProcessing: number;
  averageProcessingTime: number;
  circuitBreakerMetrics: any;
}

class FileProcessingService {
  private circuitBreaker: CircuitBreaker;
  private parser: IFileParser | null = null;
  private metrics: FileProcessingMetrics = {
    totalFilesProcessed: 0,
    successfulProcessing: 0,
    failedProcessing: 0,
    averageProcessingTime: 0,
    circuitBreakerMetrics: null
  };

  constructor() {
    const circuitBreakerConfig: CircuitBreakerConfig = {
      failureThreshold: 3,
      recoveryTimeout: 30000, // 30 seconds
      monitoringPeriod: 60000  // 1 minute
    };
    
    this.circuitBreaker = new CircuitBreaker(circuitBreakerConfig);
  }

  async processFile(file: File): Promise<ProcessedFileResult> {
    const startTime = Date.now();
    
    try {
      // Validate file before processing
      const fileValidation = validateFile(file);
      if (!fileValidation.isValid) {
        throw new AppError(
          fileValidation.error || 'File validation failed',
          ErrorType.VALIDATION_ERROR,
          ErrorSeverity.MEDIUM,
          true,
          fileValidation.error,
          { fileInfo: { name: file.name, size: file.size, type: file.type } }
        );
      }

      // Process file with circuit breaker protection
      const result = await this.circuitBreaker.execute(async () => {
        return await this.processFileInternal(file);
      });

      const processingTime = Date.now() - startTime;
      this.updateMetrics(true, processingTime);
      
      // Mark successful processing in data service
      dataProcessingService.markProcessingSuccess();
      
      dataProcessingService.markProcessingSuccess();
      return {
        ...result,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateMetrics(false, processingTime);
      
      const appError = ErrorHandler.handle(error, {
        fileInfo: { name: file.name, size: file.size, type: file.type },
        operationId: `file-processing-${Date.now()}`
      });
      
      throw appError;
    }
  }

  private async processFileInternal(file: File): Promise<Omit<ProcessedFileResult, 'processingTime'>> {
    const warnings: string[] = [];

    try {
      // Get appropriate parser using factory pattern
      this.parser = fileParserFactory.getParser(file);
      
      // Parse file using the selected parser
      const parseResult = await withRetry(
        () => this.parser!.parse(file),
        { maxAttempts: 2, baseDelay: 500 }
      );

      // Collect parsing warnings
      if (parseResult.errors.length > 0) {
        const criticalErrors = parseResult.errors.filter(e => e.type === 'Delimiter');
        if (criticalErrors.length > 0) {
          throw new AppError(
            `Critical parsing errors: ${criticalErrors.map(e => e.message).join(', ')}`,
            ErrorType.PARSE_ERROR,
            ErrorSeverity.HIGH
          );
        }
        
        // Add non-critical errors as warnings
        warnings.push(...parseResult.errors.map(e => e.message));
      }

      // Validate and process data using data processing service
      return this.validateAndProcessData(parseResult, warnings);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `File processing failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorType.FILE_PROCESSING_ERROR,
        ErrorSeverity.HIGH,
        true,
        'Unable to process the file. Please check the file format and try again.'
      );
    }
  }

  private validateAndProcessData(
    parseResult: any, 
    warnings: string[]
  ): Omit<ProcessedFileResult, 'processingTime'> {
    // Validate headers using existing validation
    const headerValidation = validateHeaders(parseResult.meta.fields || []);
    if (!headerValidation.isValid) {
      throw new AppError(
        headerValidation.error || 'Invalid headers',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.HIGH,
        true,
        headerValidation.error
      );
    }

    // Validate data using data processing service
    const dataValidation = dataProcessingService.validateData(parseResult.data);
    if (!dataValidation.isValid) {
      throw new AppError(
        dataValidation.error || 'Invalid data',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.HIGH,
        true,
        dataValidation.error
      );
    }

    // Process data into required formats using data processing service
    const processedData: FinancialData = {
      headers: parseResult.meta.fields || [],
      rows: parseResult.data.slice(0, 5),
      totalRows: parseResult.data.length
    };

    try {
      const chartPoints = dataProcessingService.transformToChartData(parseResult.data);

      return {
        data: processedData,
        chartData: chartPoints,
        warnings
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Data transformation failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.HIGH,
        true,
        'Failed to transform data into chart format'
      );
    }
  }

  private updateMetrics(success: boolean, processingTime: number): void {
    this.metrics.totalFilesProcessed++;
    
    if (success) {
      this.metrics.successfulProcessing++;
    } else {
      this.metrics.failedProcessing++;
    }

    // Update average processing time
    const totalTime = this.metrics.averageProcessingTime * (this.metrics.totalFilesProcessed - 1) + processingTime;
    this.metrics.averageProcessingTime = totalTime / this.metrics.totalFilesProcessed;
    
    // Update circuit breaker metrics
    this.metrics.circuitBreakerMetrics = this.circuitBreaker.getMetrics();
  }

  getMetrics(): FileProcessingMetrics {
    return {
      ...this.metrics,
      circuitBreakerMetrics: this.circuitBreaker.getMetrics()
    };
  }

  getCircuitBreakerState(): {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
    state: CircuitState;
  } {
    const state = this.circuitBreaker.getState();
    const metrics = this.circuitBreaker.getMetrics();
    return {
      isOpen: state !== CircuitState.CLOSED,
      failureCount: metrics.totalFailures,
      lastFailureTime: metrics.lastFailureTime,
      state: state,
    };
  }

  isServiceOperational(): boolean {
    return this.circuitBreaker.isOperational();
  }
}

// Export singleton instance
export const fileProcessingService = new FileProcessingService();
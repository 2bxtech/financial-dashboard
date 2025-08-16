/**
 * Enhanced File Processing Service with Circuit Breaker and Error Handling
 */

import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { CircuitBreaker, CircuitBreakerConfig } from '../utils/circuit-breaker';
import { AppError, ErrorType, ErrorSeverity, ErrorHandler, withRetry } from '../utils/error-handling';
import { validateData, validateHeaders, validateFile } from '../utils/validation-utils';
import { FinancialData, ChartDataPoint } from '../types';

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
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    const warnings: string[] = [];

    try {
      if (fileType === 'csv') {
        return await this.processCSVFile(file, warnings);
      } else if (['xlsx', 'xls'].includes(fileType)) {
        return await this.processExcelFile(file, warnings);
      } else {
        throw new AppError(
          `Unsupported file type: ${fileType}`,
          ErrorType.VALIDATION_ERROR,
          ErrorSeverity.MEDIUM,
          true,
          `File type "${fileType}" is not supported. Please use CSV, XLSX, or XLS files.`
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Failed to process ${fileType.toUpperCase()} file: ${error instanceof Error ? error.message : String(error)}`,
        ErrorType.FILE_PROCESSING_ERROR,
        ErrorSeverity.HIGH,
        true
      );
    }
  }

  private async processCSVFile(file: File, warnings: string[]): Promise<Omit<ProcessedFileResult, 'processingTime'>> {
    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, any>>(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              const errorMessages = results.errors.map(e => e.message);
              warnings.push(...errorMessages);
              
              // If there are critical errors, reject
              const criticalErrors = results.errors.filter(e => e.type === 'Delimiter');
              if (criticalErrors.length > 0) {
                throw new AppError(
                  `CSV parsing failed: ${criticalErrors.map(e => e.message).join(', ')}`,
                  ErrorType.PARSE_ERROR,
                  ErrorSeverity.HIGH
                );
              }
            }

            const processed = this.validateAndProcessData(results, warnings);
            resolve(processed);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new AppError(
            `CSV parsing error: ${error.message}`,
            ErrorType.PARSE_ERROR,
            ErrorSeverity.HIGH
          ));
        }
      });
    });
  }

  private async processExcelFile(file: File, warnings: string[]): Promise<Omit<ProcessedFileResult, 'processingTime'>> {
    return await withRetry(async () => {
      try {
        const workbook = new ExcelJS.Workbook();
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          throw new AppError(
            'Excel file contains no worksheets',
            ErrorType.PARSE_ERROR,
            ErrorSeverity.HIGH,
            true,
            'The Excel file appears to be empty or corrupted.'
          );
        }

        const headers: string[] = [];
        const rows: Record<string, any>[] = [];

        // Extract headers
        worksheet.getRow(1).eachCell((cell) => {
          headers.push(cell.text || String(cell.value || ''));
        });

        if (headers.length === 0) {
          throw new AppError(
            'Excel file has no headers',
            ErrorType.VALIDATION_ERROR,
            ErrorSeverity.HIGH,
            true,
            'The Excel file must contain headers in the first row.'
          );
        }

        // Extract data rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row
          
          const rowData: Record<string, any> = {};
          let hasData = false;

          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value;
              if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
                hasData = true;
              }
            }
          });

          if (hasData) {
            rows.push(rowData);
          }
        });

        const mockResults = {
          data: rows,
          errors: [],
          meta: { 
            fields: headers, 
            delimiter: ",", 
            linebreak: "\n", 
            aborted: false, 
            truncated: false, 
            cursor: 0 
          }
        };

        return this.validateAndProcessData(mockResults, warnings);

      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        throw new AppError(
          `Excel processing failed: ${error instanceof Error ? error.message : String(error)}`,
          ErrorType.FILE_PROCESSING_ERROR,
          ErrorSeverity.HIGH,
          true,
          'Unable to read the Excel file. Please ensure it\'s not corrupted and try again.'
        );
      }
    }, { maxAttempts: 2, baseDelay: 500 });
  }

  private validateAndProcessData(
    results: Papa.ParseResult<Record<string, any>>, 
    warnings: string[]
  ): Omit<ProcessedFileResult, 'processingTime'> {
    // Validate headers
    const headerValidation = validateHeaders(results.meta.fields || []);
    if (!headerValidation.isValid) {
      throw new AppError(
        headerValidation.error || 'Invalid headers',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.HIGH,
        true,
        headerValidation.error
      );
    }

    // Validate data
    const dataValidation = validateData(results.data);
    if (!dataValidation.isValid) {
      throw new AppError(
        dataValidation.error || 'Invalid data',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.HIGH,
        true,
        dataValidation.error
      );
    }

    // Process data into required formats
    const processedData: FinancialData = {
      headers: results.meta.fields || [],
      rows: results.data.slice(0, 5),
      totalRows: results.data.length
    };

    const chartPoints: ChartDataPoint[] = results.data.map((row, index) => {
      try {
        const revenue = Number(row.Revenue || row.revenue || 0);
        const expenses = Number(row.Expenses || row.expenses || 0);
        const profit = revenue - expenses;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        let date = row.Date || row.date || 'N/A';

        // Handle different date formats
        if (typeof date === 'string') {
          date = date.includes('-') ? date : `${date.slice(0, 4)}-${date.slice(4)}`;
        } else if (typeof date === 'number') {
          const excelDate = new Date(Date.UTC(0, 0, date - 1));
          date = excelDate.toISOString().slice(0, 7);
        } else if (date instanceof Date) {
          date = date.toISOString().slice(0, 7);
        } else {
          date = 'Invalid Date';
          warnings.push(`Invalid date format in row ${index + 1}`);
        }

        return {
          Date: date,
          Revenue: revenue,
          Expenses: expenses,
          profitMargin: Number(profitMargin.toFixed(2))
        };
      } catch (error) {
        warnings.push(`Error processing row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
        return {
          Date: 'Error',
          Revenue: 0,
          Expenses: 0,
          profitMargin: 0
        };
      }
    });

    return {
      data: processedData,
      chartData: chartPoints,
      warnings
    };
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

  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  isServiceOperational(): boolean {
    return this.circuitBreaker.isOperational();
  }
}

// Export singleton instance
export const fileProcessingService = new FileProcessingService();
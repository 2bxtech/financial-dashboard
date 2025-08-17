/**
 * Tests for Error Handling and Circuit Breaker Implementation
 */

import { CircuitBreaker, CircuitState } from '../../utils/circuit-breaker';
import { AppError, ErrorType, ErrorSeverity, ErrorHandler } from '../../utils/error-handling';
import { fileProcessingService } from '../../services/file-processing.service';

describe('Circuit Breaker', () => {
  it('should start in CLOSED state', () => {
    const cb = new CircuitBreaker({
      failureThreshold: 3,
      recoveryTimeout: 1000,
      monitoringPeriod: 1000
    });
    
    expect(cb.getState()).toBe(CircuitState.CLOSED);
    expect(cb.isOperational()).toBe(true);
  });

  it('should transition to OPEN state after threshold failures', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 2,
      recoveryTimeout: 1000,
      monitoringPeriod: 1000
    });

    const failingOperation = () => Promise.reject(new Error('Test failure'));

    // First failure
    await expect(cb.execute(failingOperation)).rejects.toThrow();
    expect(cb.getState()).toBe(CircuitState.CLOSED);

    // Second failure - should open circuit
    await expect(cb.execute(failingOperation)).rejects.toThrow();
    expect(cb.getState()).toBe(CircuitState.OPEN);
  });

  it('should reject operations when OPEN', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      recoveryTimeout: 1000,
      monitoringPeriod: 1000
    });

    const failingOperation = () => Promise.reject(new Error('Test failure'));
    const successOperation = () => Promise.resolve('success');

    // Cause circuit to open
    await expect(cb.execute(failingOperation)).rejects.toThrow();
    expect(cb.getState()).toBe(CircuitState.OPEN);

    // Should reject even successful operations
    await expect(cb.execute(successOperation)).rejects.toThrow('Circuit breaker is OPEN');
  });

  it('should transition to HALF_OPEN after recovery timeout', async () => {
    jest.useFakeTimers();
    
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      recoveryTimeout: 1000,
      monitoringPeriod: 1000
    });

    const failingOperation = () => Promise.reject(new Error('Test failure'));
    const successOperation = () => Promise.resolve('success');

    // Open circuit
    await expect(cb.execute(failingOperation)).rejects.toThrow();
    expect(cb.getState()).toBe(CircuitState.OPEN);

    // Fast forward past recovery timeout
    jest.advanceTimersByTime(1001);

    // Next operation should transition to HALF_OPEN
    const result = await cb.execute(successOperation);
    expect(result).toBe('success');
    expect(cb.getState()).toBe(CircuitState.CLOSED);

    jest.useRealTimers();
  });
});

describe('AppError', () => {
  it('should create error with correct properties', () => {
    const error = new AppError(
      'Test error',
      ErrorType.VALIDATION_ERROR,
      ErrorSeverity.HIGH,
      true,
      'User friendly message'
    );

    expect(error.message).toBe('Test error');
    expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.recoverable).toBe(true);
    expect(error.userMessage).toBe('User friendly message');
    expect(error.context.timestamp).toBeGreaterThan(0);
  });

  it('should generate default user message when not provided', () => {
    const error = new AppError(
      'Technical error',
      ErrorType.FILE_PROCESSING_ERROR
    );

    expect(error.userMessage).toBe('Unable to process the file. Please try a different file or format.');
  });

  it('should serialize to JSON correctly', () => {
    const error = new AppError(
      'Test error',
      ErrorType.PARSE_ERROR,
      ErrorSeverity.MEDIUM
    );

    const json = error.toJSON();
    expect(json.name).toBe('AppError');
    expect(json.type).toBe(ErrorType.PARSE_ERROR);
    expect(json.severity).toBe(ErrorSeverity.MEDIUM);
  });
});

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.clearErrors();
  });

  it('should normalize regular Error to AppError', () => {
    const regularError = new Error('Regular error');
    const appError = ErrorHandler.normalizeError(regularError);

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.message).toBe('Regular error');
    expect(appError.type).toBe(ErrorType.UNKNOWN_ERROR);
  });

  it('should categorize validation errors correctly', () => {
    const validationError = new Error('Invalid data format');
    const appError = ErrorHandler.normalizeError(validationError);

    expect(appError.type).toBe(ErrorType.VALIDATION_ERROR);
  });

  it('should categorize parse errors correctly', () => {
    const parseError = new Error('Parse error in CSV');
    const appError = ErrorHandler.normalizeError(parseError);

    expect(appError.type).toBe(ErrorType.PARSE_ERROR);
  });

  it('should store and retrieve recent errors', () => {
    const error1 = new AppError('Error 1', ErrorType.VALIDATION_ERROR);
    const error2 = new AppError('Error 2', ErrorType.PARSE_ERROR);

    ErrorHandler.handle(error1);
    ErrorHandler.handle(error2);

    const recentErrors = ErrorHandler.getRecentErrors();
    expect(recentErrors).toHaveLength(2);
    expect(recentErrors[0]).toBe(error1);
    expect(recentErrors[1]).toBe(error2);
  });

  it('should notify subscribers of new errors', () => {
    const listener = jest.fn();
    const unsubscribe = ErrorHandler.subscribe(listener);

    const error = new AppError('Test error', ErrorType.UNKNOWN_ERROR);
    ErrorHandler.handle(error);

    expect(listener).toHaveBeenCalledWith(error);
    
    unsubscribe();
  });
});

describe('File Processing Service', () => {
  it('should process valid CSV file successfully', async () => {
    const csvContent = 'Date,Revenue,Expenses\n2024-01,10000,8000\n2024-02,12000,9000';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    const result = await fileProcessingService.processFile(file);

    expect(result.data.headers).toEqual(['Date', 'Revenue', 'Expenses']);
    expect(result.data.totalRows).toBe(2);
    expect(result.chartData).toHaveLength(2);
    expect(result.chartData[0].Revenue).toBe(10000);
    expect(result.processingTime).toBeGreaterThan(0);
  });

  it('should reject file with invalid headers', async () => {
    const csvContent = 'InvalidHeader1,InvalidHeader2\n2024-01,10000';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    await expect(fileProcessingService.processFile(file)).rejects.toThrow(AppError);
  });

  it('should reject oversized files', async () => {
    // Create a file larger than 5MB
    const largeContent = 'x'.repeat(6 * 1024 * 1024);
    const file = new File([largeContent], 'large.csv', { type: 'text/csv' });

    await expect(fileProcessingService.processFile(file)).rejects.toThrow(AppError);
  });

  it('should update metrics after processing', async () => {
    const csvContent = 'Date,Revenue,Expenses\n2024-01,10000,8000';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    const initialMetrics = fileProcessingService.getMetrics();
    
    await fileProcessingService.processFile(file);
    
    const updatedMetrics = fileProcessingService.getMetrics();
    expect(updatedMetrics.totalFilesProcessed).toBe(initialMetrics.totalFilesProcessed + 1);
    expect(updatedMetrics.successfulProcessing).toBe(initialMetrics.successfulProcessing + 1);
  });

  it('should provide circuit breaker status', () => {
    const state = fileProcessingService.getCircuitBreakerState();
    expect(typeof state).toBe('object');
    expect(state).toHaveProperty('isOpen');
    expect(state).toHaveProperty('failureCount');
    expect(state).toHaveProperty('lastFailureTime');
    expect(state).toHaveProperty('state');
    
    const isOperational = fileProcessingService.isServiceOperational();
    expect(typeof isOperational).toBe('boolean');
  });
});
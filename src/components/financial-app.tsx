import React, { useEffect } from 'react';
import { FinancialData, TrendMetricsData, ChartDataPoint } from '../types';
import FileUploader from './file-uploader';
import DataPreview from './data-preview';
import TrendMetrics from './trend-metrics';
import RevenueChart from './revenue-chart';
import ProfitChart from './profit-chart';
import ErrorDisplay from './error-display';
import LoadingState from './loading-state';
import { UndoRedoControls } from './undo-redo-controls';
import { fileProcessingService } from '../services/file-processing.service';
import { dataProcessingService } from '../services/data-processing.service';
import { AppError, ErrorHandler } from '../utils/error-handling';
import { CircuitState } from '../utils/circuit-breaker';
import { 
  useFinancialData, 
  useUIState, 
  useErrorState, 
  useProcessingMetrics 
} from '../store/store';
import { CommandHelpers } from '../store/commands';

// Helper function to check if value is a valid CircuitState
function isCircuitState(value: any): value is CircuitState {
  return Object.values(CircuitState).includes(value);
}

const FinancialApp: React.FC = () => {
  // Use Zustand store hooks instead of local state
  const {
    fileData,
    chartData,
    trends,
    warnings,
    processingTime,
    lastFileInfo,
    setWarnings,
    clearFinancialData,
  } = useFinancialData();

  const {
    loading,
    setLoading,
  } = useUIState();

  const {
    error,
    circuitBreakerState,
    setError,
    clearError,
    setCircuitBreakerState,
  } = useErrorState();

  const {
    recordProcessingMetrics,
  } = useProcessingMetrics();

  // Subscribe to error events
  useEffect(() => {
    const unsubscribe = ErrorHandler.subscribe((appError: AppError) => {
      setError(appError);
    });

    return unsubscribe;
  }, [setError]);

  // Update circuit breaker state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const state = fileProcessingService.getCircuitBreakerState();
      if (isCircuitState(state)) {
        setCircuitBreakerState(state);
      } else {
        // Optionally handle invalid state, e.g. set to CLOSED or log an error
        setCircuitBreakerState(CircuitState.CLOSED);
        console.warn('Invalid circuit breaker state:', state);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [setCircuitBreakerState]);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    clearFinancialData();
    setWarnings([]);

    const startTime = Date.now();

    try {
      const result = await fileProcessingService.processFile(file);
      
      // Use the data processing service for enhanced calculations
      const chartMetrics = dataProcessingService.calculateMetrics(result.chartData);
      
      // Use the processed metrics instead of our simple calculations
      const calculatedTrends = {
        revenueGrowth: chartMetrics.trends.revenueGrowth,
        profitGrowth: chartMetrics.trends.profitGrowth,
        marginGrowth: chartMetrics.trends.marginGrowth
      };

      const processingTime = Date.now() - startTime;
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };

      // Use command pattern for undo/redo support
      CommandHelpers.handleFileUpload(
        result.data,
        result.chartData,
        calculatedTrends,
        result.warnings,
        processingTime,
        fileInfo
      );

      // Record processing metrics
      recordProcessingMetrics({
        fileSize: file.size,
        processingTime,
        success: true,
      });

      // Log success metrics
      console.log('File processed successfully:', {
        processingTime: result.processingTime,
        warnings: result.warnings.length,
        rows: result.data.totalRows,
        totalRevenue: chartMetrics.summaryStats.totalRevenue,
        averageMargin: chartMetrics.summaryStats.averageMargin
      });

    } catch (err) {
      const processingTime = Date.now() - startTime;
      
      // Record failed processing metrics
      recordProcessingMetrics({
        fileSize: file.size,
        processingTime,
        success: false,
      });

      if (err instanceof AppError) {
        setError(err);
      } else {
        const appError = ErrorHandler.handle(err);
        setError(appError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    clearError();
  };

  const handleDismissError = () => {
    clearError();
  };

  const handleFileUploaderError = (errorMessage: string) => {
    const appError = ErrorHandler.handle(new Error(errorMessage));
    setError(appError);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Financial Dashboard</h1>
        <UndoRedoControls />
      </div>
      
      <FileUploader 
        onFileUpload={processFile} 
        onError={handleFileUploaderError}
        loading={loading} 
        error={error?.userMessage || ''} 
      />
      
      <LoadingState 
        loading={loading}
        message="Processing your financial data..."
        circuitBreakerState={circuitBreakerState}
        showCircuitStatus={true}
      />

      <ErrorDisplay 
        error={error}
        onRetry={error?.recoverable ? handleRetry : undefined}
        onDismiss={handleDismissError}
        showDetails={process.env.NODE_ENV === 'development'}
      />

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h4 className="font-medium text-yellow-800">Processing Warnings:</h4>
          <ul className="mt-2 text-sm text-yellow-700">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      <DataPreview data={fileData} />
      
      {chartData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={chartData} />
            <ProfitChart data={chartData} />
          </div>
          {trends && <TrendMetrics trends={trends} />}
        </>
      )}
    </div>
  );
};

export default FinancialApp;

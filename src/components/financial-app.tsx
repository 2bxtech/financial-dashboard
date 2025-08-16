import React, { useState, useEffect } from 'react';
import { FinancialData, TrendMetricsData, ChartDataPoint } from '../types';
import FileUploader from './file-uploader';
import DataPreview from './data-preview';
import TrendMetrics from './trend-metrics';
import RevenueChart from './revenue-chart';
import ProfitChart from './profit-chart';
import ErrorDisplay from './error-display';
import LoadingState from './loading-state';
import { fileProcessingService } from '../services/file-processing.service';
import { dataProcessingService } from '../services/data-processing.service';
import { AppError, ErrorHandler } from '../utils/error-handling';
import { CircuitState } from '../utils/circuit-breaker';

const FinancialApp: React.FC = () => {
  const [fileData, setFileData] = useState<FinancialData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [trends, setTrends] = useState<TrendMetricsData | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [circuitBreakerState, setCircuitBreakerState] = useState<CircuitState>(CircuitState.CLOSED);

  // Subscribe to error events
  useEffect(() => {
    const unsubscribe = ErrorHandler.subscribe((appError: AppError) => {
      setError(appError);
    });

    return unsubscribe;
  }, []);

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
  }, []);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setFileData(null);
    setChartData(null);
    setTrends(null);
    setWarnings([]);

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

      setFileData(result.data);
      setChartData(result.chartData);
      setTrends(calculatedTrends);
      setWarnings(result.warnings);

      // Log success metrics
      console.log('File processed successfully:', {
        processingTime: result.processingTime,
        warnings: result.warnings.length,
        rows: result.data.totalRows,
        totalRevenue: chartMetrics.summaryStats.totalRevenue,
        averageMargin: chartMetrics.summaryStats.averageMargin
      });

    } catch (err) {
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
    setError(null);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleFileUploaderError = (errorMessage: string) => {
    const appError = ErrorHandler.handle(new Error(errorMessage));
    setError(appError);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
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

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
      setCircuitBreakerState(fileProcessingService.getCircuitBreakerState() as CircuitState);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateGrowthMetrics = (data: ChartDataPoint[]): TrendMetricsData => {
    if (data.length < 2) return { revenueGrowth: 0, profitGrowth: 0, marginGrowth: 0 };

    const latest = data[data.length - 1] ?? {};
    const previous = data[data.length - 2] ?? {};

    const latestRevenue = latest.Revenue ?? 0;
    const previousRevenue = previous.Revenue ?? 0;
    const latestExpenses = latest.Expenses ?? 0;
    const previousExpenses = previous.Expenses ?? 0;
    const latestMargin = latest.profitMargin ?? 0;
    const previousMargin = previous.profitMargin ?? 0;

    const revenueGrowth = previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const profitGrowth = previousRevenue - previousExpenses > 0 ? ((latestRevenue - latestExpenses) - (previousRevenue - previousExpenses)) / (previousRevenue - previousExpenses) * 100 : 0;
    const marginGrowth = Number((latestMargin - previousMargin).toFixed(2));

    return {
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      profitGrowth: Number(profitGrowth.toFixed(2)),
      marginGrowth: Number(marginGrowth.toFixed(2))
    };
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setFileData(null);
    setChartData(null);
    setTrends(null);
    setWarnings([]);

    try {
      const result = await fileProcessingService.processFile(file);
      
      const calculatedTrends = calculateGrowthMetrics(result.chartData);

      setFileData(result.data);
      setChartData(result.chartData);
      setTrends(calculatedTrends);
      setWarnings(result.warnings);

      // Log success metrics
      console.log('File processed successfully:', {
        processingTime: result.processingTime,
        warnings: result.warnings.length,
        rows: result.data.totalRows
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
    // You could store the last file and retry it here
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

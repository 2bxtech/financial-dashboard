/**
 * Data Processing Service Interface
 * Defines the contract for financial data processing operations
 */

import { FinancialData, ChartDataPoint, TrendMetricsData } from '../../types';
import { ValidationResult } from '../../utils/validation-utils';

export interface FinancialMetrics {
  trends: TrendMetricsData;
  summaryStats: {
    totalRevenue: number;
    totalExpenses: number;
    averageMargin: number;
    dataPoints: number;
  };
  healthIndicators: {
    revenueConsistency: number;
    expenseVolatility: number;
    profitabilityTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface IDataProcessingService {
  /**
   * Validate raw data array
   */
  validateData(data: unknown[]): ValidationResult;
  
  /**
   * Calculate financial metrics from chart data
   */
  calculateMetrics(data: ChartDataPoint[]): FinancialMetrics;
  
  /**
   * Transform raw data into chart-ready format
   */
  transformToChartData(rawData: Record<string, any>[]): ChartDataPoint[];
  
  /**
   * Get processing statistics
   */
  getProcessingStats(): {
    totalFilesProcessed: number;
    averageProcessingTime: number;
    successRate: number;
  };
}
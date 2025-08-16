/**
 * Data Processing Service Implementation
 * Handles all financial data processing operations with clean separation of concerns
 */

import { 
  IDataProcessingService, 
  FinancialMetrics 
} from './interfaces/IDataProcessingService';
import { FinancialData, ChartDataPoint, TrendMetricsData } from '../types';
import { ValidationResult, validateData } from '../utils/validation-utils';
import { AppError, ErrorType, ErrorSeverity } from '../utils/error-handling';

export class DataProcessingService implements IDataProcessingService {
  private processingStats = {
    totalFilesProcessed: 0,
    totalProcessingTime: 0,
    successfulProcessing: 0
  };

  validateData(data: unknown[]): ValidationResult {
    try {
      return validateData(data);
    } catch (error) {
      return {
        isValid: false,
        error: `Validation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  calculateMetrics(data: ChartDataPoint[]): FinancialMetrics {
    if (!data || data.length === 0) {
      return this.getEmptyMetrics();
    }

    try {
      const trends = this.calculateTrends(data);
      const summaryStats = this.calculateSummaryStats(data);
      const healthIndicators = this.calculateHealthIndicators(data);

      return {
        trends,
        summaryStats,
        healthIndicators
      };
    } catch (error) {
      throw new AppError(
        `Metrics calculation failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.MEDIUM,
        true,
        'Unable to calculate financial metrics from the provided data'
      );
    }
  }

  transformToChartData(rawData: Record<string, any>[]): ChartDataPoint[] {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }

    return rawData.map((row, index) => {
      try {
        const revenue = this.parseNumber(row.Revenue || row.revenue, 'Revenue', index);
        const expenses = this.parseNumber(row.Expenses || row.expenses, 'Expenses', index);
        const profit = revenue - expenses;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        const date = this.parseDate(row.Date || row.date, index);

        return {
          Date: date,
          Revenue: revenue,
          Expenses: expenses,
          profitMargin: Number(profitMargin.toFixed(2))
        };
      } catch (error) {
        throw new AppError(
          `Data transformation failed at row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
          ErrorType.VALIDATION_ERROR,
          ErrorSeverity.HIGH,
          true,
          `Error processing data in row ${index + 1}. Please check the data format.`
        );
      }
    });
  }

  getProcessingStats() {
    const { totalFilesProcessed, totalProcessingTime, successfulProcessing } = this.processingStats;
    
    return {
      totalFilesProcessed,
      averageProcessingTime: totalFilesProcessed > 0 ? totalProcessingTime / totalFilesProcessed : 0,
      successRate: totalFilesProcessed > 0 ? (successfulProcessing / totalFilesProcessed) * 100 : 0
    };
  }

  // Private helper methods for clean separation of concerns

  private calculateTrends(data: ChartDataPoint[]): TrendMetricsData {
    if (data.length < 2) {
      return { revenueGrowth: 0, profitGrowth: 0, marginGrowth: 0 };
    }

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];

    const revenueGrowth = this.calculateGrowthRate(
      previous.Revenue || 0,
      latest.Revenue || 0
    );

    const previousProfit = (previous.Revenue || 0) - (previous.Expenses || 0);
    const latestProfit = (latest.Revenue || 0) - (latest.Expenses || 0);
    const profitGrowth = this.calculateGrowthRate(previousProfit, latestProfit);

    const marginGrowth = (latest.profitMargin || 0) - (previous.profitMargin || 0);

    return {
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      profitGrowth: Number(profitGrowth.toFixed(2)),
      marginGrowth: Number(marginGrowth.toFixed(2))
    };
  }

  private calculateSummaryStats(data: ChartDataPoint[]) {
    const totalRevenue = data.reduce((sum, item) => sum + (item.Revenue || 0), 0);
    const totalExpenses = data.reduce((sum, item) => sum + (item.Expenses || 0), 0);
    const averageMargin = data.reduce((sum, item) => sum + (item.profitMargin || 0), 0) / data.length;

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      averageMargin: Number(averageMargin.toFixed(2)),
      dataPoints: data.length
    };
  }

  private calculateHealthIndicators(data: ChartDataPoint[]) {
    const revenues = data.map(item => item.Revenue || 0);
    const expenses = data.map(item => item.Expenses || 0);
    const margins = data.map(item => item.profitMargin || 0);

    const revenueConsistency = this.calculateConsistency(revenues);
    const expenseVolatility = this.calculateVolatility(expenses);
    const profitabilityTrend = this.determineProfitabilityTrend(margins);

    return {
      revenueConsistency: Number(revenueConsistency.toFixed(2)),
      expenseVolatility: Number(expenseVolatility.toFixed(2)),
      profitabilityTrend
    };
  }

  private calculateGrowthRate(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private calculateConsistency(values: number[]): number {
    if (values.length < 2) return 100;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    return mean > 0 ? Math.max(0, 100 - (standardDeviation / mean * 100)) : 0;
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    return mean > 0 ? (standardDeviation / mean * 100) : 0;
  }

  private determineProfitabilityTrend(margins: number[]): 'improving' | 'declining' | 'stable' {
    if (margins.length < 3) return 'stable';
    
    const recentMargins = margins.slice(-3);
    const trend = recentMargins[2] - recentMargins[0];
    
    if (trend > 1) return 'improving';
    if (trend < -1) return 'declining';
    return 'stable';
  }

  private parseNumber(value: any, fieldName: string, rowIndex: number): number {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      throw new Error(`Invalid ${fieldName} value "${value}" in row ${rowIndex + 1}`);
    }
    return num;
  }

  private parseDate(value: any, rowIndex: number): string {
    if (!value) {
      throw new Error(`Missing date value in row ${rowIndex + 1}`);
    }

    if (typeof value === 'string') {
      // Handle YYYY-MM format
      if (/^\d{4}-\d{2}$/.test(value)) {
        return value;
      }
      // Handle YYYYMM format
      if (/^\d{6}$/.test(value)) {
        return `${value.slice(0, 4)}-${value.slice(4)}`;
      }
    } else if (typeof value === 'number') {
      // Handle Excel date numbers
      const excelDate = new Date(Date.UTC(0, 0, value - 1));
      return excelDate.toISOString().slice(0, 7);
    } else if (value instanceof Date) {
      return value.toISOString().slice(0, 7);
    }

    throw new Error(`Invalid date format "${value}" in row ${rowIndex + 1}`);
  }

  private getEmptyMetrics(): FinancialMetrics {
    return {
      trends: { revenueGrowth: 0, profitGrowth: 0, marginGrowth: 0 },
      summaryStats: {
        totalRevenue: 0,
        totalExpenses: 0,
        averageMargin: 0,
        dataPoints: 0
      },
      healthIndicators: {
        revenueConsistency: 0,
        expenseVolatility: 0,
        profitabilityTrend: 'stable'
      }
    };
  }

  // Method to record successful processing for stats
  markProcessingSuccess(): void {
    this.processingStats.successfulProcessing++;
  }
}

// Export singleton instance
export const dataProcessingService = new DataProcessingService();
export interface FinancialData {
    headers: string[];
    rows: Record<string, any>[]; // Preview rows (first 5)
    fullRows?: Record<string, any>[]; // Complete dataset for exports (optional for backward compatibility)
    totalRows: number;
  }
  
  export interface HealthMetricsData {
    currentRatio: number;
    quickRatio: number;
    debtToEquity: number;
  }
  
  export interface TrendMetricsData {
    revenueGrowth: number;
    profitGrowth: number;
    marginGrowth: number;
  }
  
  export interface ChartDataPoint {
    Date: string;
    Revenue?: number;
    Expenses?: number;
    profitMargin?: number;
  }
  
  export interface IndicatorProps {
    value: number;
    threshold: number;
    title: string;
    description: string;
    format?: 'number' | 'ratio' | 'percentage';
  }

  export interface ChartDataPoint {
    Date: string;
    Revenue?: number;
    Expenses?: number;
    profitMargin?: number;
    [key: string]: any;
  }
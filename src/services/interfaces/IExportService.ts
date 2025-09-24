/**
 * Export Service Interface
 * Defines the contract for data and chart export operations
 */

import { ChartDataPoint } from '../../types';

export type ExportFormat = 'png' | 'svg' | 'pdf' | 'csv' | 'xlsx';
export type ChartType = 'revenue' | 'profit' | 'combined';
export type ReportTemplate = 'executive-summary' | 'detailed-analysis' | 'custom';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number; // For PNG/JPG exports (0-1)
  width?: number;
  height?: number;
  background?: string;
  filename?: string;
  includeTitle?: boolean;
  includeLegend?: boolean;
  includeGrid?: boolean;
}

export interface ChartExportOptions extends ExportOptions {
  chartType: ChartType;
  element?: HTMLElement;
}

export interface DataExportOptions extends ExportOptions {
  includeHeaders?: boolean;
  dateFormat?: string;
  numberFormat?: 'decimal' | 'currency';
  includeCalculatedFields?: boolean;
}

export interface ReportExportOptions {
  template: ReportTemplate;
  filename?: string;
  includeCharts?: boolean;
  includeRawData?: boolean;
  companyInfo?: {
    name?: string;
    logo?: string;
    address?: string;
  };
  reportPeriod?: {
    start: string;
    end: string;
  };
}

export interface ExportResult {
  success: boolean;
  filename: string;
  size?: number;
  format: ExportFormat;
  timestamp: Date;
  error?: string;
}

export interface IExportService {
  /**
   * Export chart as image or vector format
   */
  exportChart(options: ChartExportOptions): Promise<ExportResult>;
  
  /**
   * Export data as CSV or Excel
   */
  exportData(data: Record<string, any>[], options: DataExportOptions): Promise<ExportResult>;
  
  /**
   * Batch export multiple charts
   */
  batchExportCharts(charts: ChartExportOptions[]): Promise<ExportResult[]>;
  
  /**
   * Get export history
   */
  getExportHistory(): ExportResult[];
  
  /**
   * Clear export history
   */
  clearExportHistory(): void;
}
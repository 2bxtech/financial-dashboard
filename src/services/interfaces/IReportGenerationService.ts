/**
 * Report Generation Service Interface
 * Defines the contract for PDF report generation
 */

import { ChartDataPoint } from '../../types';
import { FinancialMetrics } from './IDataProcessingService';
import { ReportTemplate as ReportTemplateType, ReportExportOptions, ExportResult } from './IExportService';

export interface ReportData {
  financialData: Record<string, any>[];
  metrics: FinancialMetrics;
  chartImages?: {
    revenueChart?: string; // Base64 encoded image
    profitChart?: string;
    combinedChart?: string;
  };
  generatedAt: Date;
  reportPeriod?: {
    start: string;
    end: string;
  };
}

export interface ReportSection {
  title: string;
  content: string;
  charts?: string[]; // Base64 encoded charts
  data?: any; // Structured data for tables
  order: number;
}

export interface PDFReportTemplate {
  name: string;
  sections: ReportSection[];
  styling?: {
    headerColor?: string;
    accentColor?: string;
    font?: string;
  };
}

export interface IReportGenerationService {
  /**
   * Generate PDF report from financial data
   */
  generatePDFReport(
    data: ReportData,
    options: ReportExportOptions
  ): Promise<ExportResult>;
  
  /**
   * Get available report templates
   */
  getAvailableTemplates(): PDFReportTemplate[];
  
  /**
   * Preview report content before generation
   */
  previewReport(
    data: ReportData,
    template: PDFReportTemplate
  ): Promise<{
    pageCount: number;
    sections: string[];
    estimatedSize: number;
  }>;
  
  /**
   * Generate report sections
   */
  generateReportSections(
    data: ReportData,
    template: PDFReportTemplate
  ): ReportSection[];
}
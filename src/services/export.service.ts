/**
 * Export Service Implementation
 * Handles chart and data export functionality
 */

import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { 
  IExportService, 
  ChartExportOptions, 
  DataExportOptions,
  ExportResult 
} from './interfaces/IExportService';
import { ChartDataPoint } from '../types';
import { AppError, ErrorType, ErrorSeverity } from '../utils/error-handling';

export class ExportService implements IExportService {
  private exportHistory: ExportResult[] = [];

  async exportChart(options: ChartExportOptions): Promise<ExportResult> {
    try {
      if (!options.element) {
        throw new AppError(
          'Chart element not provided',
          ErrorType.VALIDATION_ERROR,
          ErrorSeverity.MEDIUM,
          true,
          'Please ensure the chart element is available for export.'
        );
      }

      const filename = options.filename || `${options.chartType}-chart-${Date.now()}`;
      
      let blob: Blob;
      let actualFilename: string;

      switch (options.format) {
        case 'png':
          blob = await this.exportAsPNG(options.element, options);
          actualFilename = `${filename}.png`;
          break;
        case 'svg':
          blob = await this.exportAsSVG(options.element, options);
          actualFilename = `${filename}.svg`;
          break;
        default:
          throw new AppError(
            `Unsupported chart export format: ${options.format}`,
            ErrorType.VALIDATION_ERROR,
            ErrorSeverity.MEDIUM,
            true,
            'Please choose PNG or SVG format for chart export.'
          );
      }

      saveAs(blob, actualFilename);

      const result: ExportResult = {
        success: true,
        filename: actualFilename,
        size: blob.size,
        format: options.format,
        timestamp: new Date()
      };

      this.exportHistory.push(result);
      return result;

    } catch (error) {
      const errorResult: ExportResult = {
        success: false,
        filename: options.filename || 'export-failed',
        format: options.format,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown export error'
      };

      this.exportHistory.push(errorResult);
      throw error;
    }
  }

  async exportData(data: Record<string, any>[], options: DataExportOptions): Promise<ExportResult> {
    try {
      const filename = options.filename || `financial-data-${Date.now()}`;
      
      let blob: Blob;
      let actualFilename: string;

      switch (options.format) {
        case 'csv':
          blob = await this.exportAsCSV(data, options);
          actualFilename = `${filename}.csv`;
          break;
        case 'xlsx':
          blob = await this.exportAsXLSX(data, options);
          actualFilename = `${filename}.xlsx`;
          break;
        default:
          throw new AppError(
            `Unsupported data export format: ${options.format}`,
            ErrorType.VALIDATION_ERROR,
            ErrorSeverity.MEDIUM,
            true,
            'Please choose CSV or XLSX format for data export.'
          );
      }

      saveAs(blob, actualFilename);

      const result: ExportResult = {
        success: true,
        filename: actualFilename,
        size: blob.size,
        format: options.format,
        timestamp: new Date()
      };

      this.exportHistory.push(result);
      return result;

    } catch (error) {
      const errorResult: ExportResult = {
        success: false,
        filename: options.filename || 'export-failed',
        format: options.format,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown export error'
      };

      this.exportHistory.push(errorResult);
      throw error;
    }
  }

  async batchExportCharts(charts: ChartExportOptions[]): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    
    for (const chartOptions of charts) {
      try {
        const result = await this.exportChart(chartOptions);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          filename: chartOptions.filename || 'batch-export-failed',
          format: chartOptions.format,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown export error'
        });
      }
    }

    return results;
  }

  getExportHistory(): ExportResult[] {
    return [...this.exportHistory];
  }

  clearExportHistory(): void {
    this.exportHistory = [];
  }

  private async exportAsPNG(element: HTMLElement, options: ChartExportOptions): Promise<Blob> {
    const canvas = await html2canvas(element, {
      width: options.width || element.offsetWidth,
      height: options.height || element.offsetHeight,
      useCORS: true,
      logging: false
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', options.quality || 0.95);
    });
  }

  private async exportAsSVG(element: HTMLElement, options: ChartExportOptions): Promise<Blob> {
    // For SVG export, we'll need to handle this differently based on the chart library
    // For now, we'll convert to PNG and then create an SVG wrapper
    // In a real implementation, you'd want to use the chart library's native SVG export
    
    const canvas = await html2canvas(element, {
      width: options.width || element.offsetWidth,
      height: options.height || element.offsetHeight,
      useCORS: true,
      logging: false
    });

    const dataURL = canvas.toDataURL('image/png');
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           xmlns:xlink="http://www.w3.org/1999/xlink"
           width="${canvas.width}" 
           height="${canvas.height}">
        <image xlink:href="${dataURL}" width="${canvas.width}" height="${canvas.height}"/>
      </svg>
    `;

    return new Blob([svgContent], { type: 'image/svg+xml' });
  }

  private async exportAsCSV(data: Record<string, any>[], options: DataExportOptions): Promise<Blob> {
    if (!data || data.length === 0) {
      throw new AppError(
        'No data provided for CSV export',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.MEDIUM
      );
    }

    // Get all unique column headers from the data
    const headers = Array.from(new Set(
      data.flatMap(row => Object.keys(row))
    )).sort(); // Sort for consistent order

    let csvContent = '';
    
    if (options.includeHeaders !== false) {
      csvContent += headers.join(',') + '\n';
    }
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        
        if (value === null || value === undefined) {
          return '';
        }
        
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        
        return String(value);
      });

      csvContent += values.join(',') + '\n';
    });

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private async exportAsXLSX(data: Record<string, any>[], options: DataExportOptions): Promise<Blob> {
    if (!data || data.length === 0) {
      throw new AppError(
        'No data provided for XLSX export',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.MEDIUM
      );
    }

    const headers = Array.from(new Set(
      data.flatMap(row => Object.keys(row))
    )).sort();

    const worksheetData = [];
    if (options.includeHeaders !== false) {
      worksheetData.push(headers);
    }

    data.forEach(row => {
      const rowData = headers.map(header => {
        const value = row[header];
        
        if (value === null || value === undefined) {
          return '';
        }
        
        return value;
      });
      
      worksheetData.push(rowData);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Data');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  private formatDate(date: string, format?: string): string {
    if (!format) return date;
    
    const d = new Date(date);
    switch (format) {
      case 'MM/DD/YYYY':
        return d.toLocaleDateString('en-US');
      case 'DD/MM/YYYY':
        return d.toLocaleDateString('en-GB');
      case 'YYYY-MM-DD':
        return d.toISOString().split('T')[0];
      default:
        return date;
    }
  }

  private formatNumber(value: number, format?: string): string {
    if (!format) return value.toString();
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'decimal':
        return value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      default:
        return value.toString();
    }
  }
}
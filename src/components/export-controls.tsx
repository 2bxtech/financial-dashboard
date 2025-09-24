/**
 * Export Controls Component
 * Provides UI for all export functionality
 */

import React, { useState, useRef } from 'react';
import { Card } from './ui/card';
import { 
  Download, 
  FileImage, 
  FileText, 
  File,
  Play
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { useExport, useErrorState } from '../store/store';
import { useFileData, useChartData, useTrends } from '../store';
import { ExportService } from '../services/export.service';
import { ReportGenerationService } from '../services/report-generation.service';
import { ExportFormat, ChartType } from '../services/interfaces/IExportService';
import { ReportData } from '../services/interfaces/IReportGenerationService';
import { ErrorHandler } from '../utils/error-handling';

interface ExportControlsProps {
  revenueChartRef?: React.RefObject<HTMLDivElement>;
  profitChartRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  revenueChartRef,
  profitChartRef,
  className
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    exportPreferences,
    addToExportHistory,
    setLastExportSettings
  } = useExport();
  
  const chartData = useChartData();
  const trends = useTrends();
  const fileData = useFileData();
  const { setError } = useErrorState();
  
  const exportService = useRef(new ExportService());
  const reportService = useRef(new ReportGenerationService());

  const hasChartData = chartData && Array.isArray(chartData) && chartData.length > 0;
  const hasFullFileData = fileData && fileData.fullRows && Array.isArray(fileData.fullRows) && fileData.fullRows.length > 0;
  const hasPreviewFileData = fileData && fileData.rows && Array.isArray(fileData.rows) && fileData.rows.length > 0;
  const hasTrends = trends !== null && trends !== undefined;
  
  const exportData = hasFullFileData ? fileData.fullRows : 
                    hasChartData ? chartData : 
                    hasPreviewFileData ? fileData.rows : null;
  const rawDataForExport = hasFullFileData ? fileData.fullRows : exportData;
  const hasExportableData = exportData && exportData.length > 0;

  const handleChartExport = async (format: ExportFormat, chartType: ChartType) => {
    if (!hasExportableData) {
      setError(ErrorHandler.normalizeError(new Error('No chart data available for export')));
      return;
    }

    let chartElement: HTMLElement | null = null;
    
    switch (chartType) {
      case 'revenue':
        chartElement = revenueChartRef?.current || null;
        break;
      case 'profit':
        chartElement = profitChartRef?.current || null;
        break;
      default:
        chartElement = revenueChartRef?.current || null;
        break;
    }

    if (!chartElement) {
      setError(ErrorHandler.normalizeError(new Error('Chart element not found')));
      return;
    }

    try {
      setIsExporting(true);

      const result = await exportService.current.exportChart({
        format,
        chartType,
        element: chartElement,
        quality: exportPreferences.quality,
        includeTitle: true,
        includeLegend: true,
        includeGrid: true,
        filename: `${chartType}-chart-${new Date().toISOString().split('T')[0]}`
      });

      addToExportHistory(result);
      setLastExportSettings({ format, options: { chartType } });

    } catch (error) {
      setError(ErrorHandler.handle(error));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataExport = async (format: ExportFormat) => {
    if (!hasExportableData) {
      setError(ErrorHandler.normalizeError(new Error('No data available for export')));
      return;
    }

    try {
      setIsExporting(true);

      // Use raw fileData for data exports to preserve all original columns
      const dataToExport = rawDataForExport || exportData;

      const result = await exportService.current.exportData(dataToExport, {
        format,
        includeHeaders: exportPreferences.includeHeaders,
        dateFormat: exportPreferences.dateFormat,
        numberFormat: exportPreferences.numberFormat,
        includeCalculatedFields: true,
        filename: `financial-data-${new Date().toISOString().split('T')[0]}`
      });

      addToExportHistory(result);
      setLastExportSettings({ format, options: { dataExport: true } });

    } catch (error) {
      setError(ErrorHandler.handle(error));
    } finally {
      setIsExporting(false);
    }
  };

  const handlePDFReport = async (template: 'executive-summary' | 'detailed-analysis') => {
    if (!hasExportableData || !hasTrends || !(hasFullFileData || hasPreviewFileData)) {
      setError(ErrorHandler.normalizeError(new Error('Insufficient data for PDF report')));
      return;
    }

    try {
      setIsExporting(true);

      const chartImages: any = {};
      
      if (revenueChartRef?.current) {
        try {
          const canvas = await html2canvas(revenueChartRef.current, {
            useCORS: true,
            logging: false
          });
          chartImages.revenueChart = canvas.toDataURL('image/png');
        } catch (error) {
          console.warn('Failed to capture revenue chart:', error);
        }
      }

      if (profitChartRef?.current) {
        try {
          const canvas = await html2canvas(profitChartRef.current, {
            useCORS: true,
            logging: false
          });
          chartImages.profitChart = canvas.toDataURL('image/png');
        } catch (error) {
          console.warn('Failed to capture profit chart:', error);
        }
      }

      const reportData: ReportData = {
        financialData: exportData,
        metrics: {
          trends,
          summaryStats: {
            totalRevenue: exportData.reduce((sum, item) => sum + (item.Revenue || 0), 0),
            totalExpenses: exportData.reduce((sum, item) => sum + (item.Expenses || 0), 0),
            averageMargin: exportData.reduce((sum, item) => sum + (((item.Revenue || 0) - (item.Expenses || 0)) / (item.Revenue || 1) * 100), 0) / exportData.length,
            dataPoints: exportData.length
          },
          healthIndicators: {
            revenueConsistency: 85,
            expenseVolatility: 0.3,
            profitabilityTrend: 'improving' as const
          }
        },
        chartImages,
        generatedAt: new Date(),
        reportPeriod: {
          start: exportData[0]?.Date || '',
          end: exportData[exportData.length - 1]?.Date || ''
        }
      };

      const result = await reportService.current.generatePDFReport(reportData, {
        template,
        includeCharts: exportPreferences.includeCharts,
        includeRawData: exportPreferences.includeRawData,
        companyInfo: exportPreferences.companyInfo.name ? exportPreferences.companyInfo : undefined,
        filename: `${template}-report-${new Date().toISOString().split('T')[0]}.pdf`
      });

      addToExportHistory(result);
      setLastExportSettings({ format: 'pdf', options: { template } });

    } catch (error) {
      setError(ErrorHandler.handle(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Export & Reports</h3>
          {isExporting && <span className="text-sm text-gray-500">Exporting...</span>}
        </div>
        {!hasExportableData ? (
          <div className="text-center py-8 text-gray-500">
            <p>Upload financial data to enable export features</p>
            <p className="text-xs mt-2">Charts visible but no exportable data detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <FileImage className="h-4 w-4 mr-2" />
                Charts
              </h4>
              <div className="space-y-2">
                <button
                  className="w-full text-left p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleChartExport('png', 'revenue')}
                  disabled={isExporting}
                >
                  Revenue Chart (PNG)
                </button>
                <button
                  className="w-full text-left p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleChartExport('png', 'profit')}
                  disabled={isExporting}
                >
                  Profit Chart (PNG)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <File className="h-4 w-4 mr-2" />
                Data
              </h4>
              <div className="space-y-2">
                <button
                  className="w-full text-left p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDataExport('csv')}
                  disabled={isExporting}
                >
                  Export as CSV
                </button>
                <button
                  className="w-full text-left p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDataExport('xlsx')}
                  disabled={isExporting}
                >
                  Export as Excel
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </h4>
              <div className="space-y-2">
                <button
                  className="w-full text-left p-2 border rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  onClick={() => handlePDFReport('executive-summary')}
                  disabled={isExporting}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Executive Summary
                </button>
                <button
                  className="w-full text-left p-2 border rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  onClick={() => handlePDFReport('detailed-analysis')}
                  disabled={isExporting}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Detailed Analysis
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
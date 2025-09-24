/**
 * Report Generation Service Tests
 */

import { ReportGenerationService } from '../report-generation.service';
import { ReportData } from '../interfaces/IReportGenerationService';
import { ChartDataPoint } from '../../types';

// Mock React-PDF to avoid browser dependency issues
jest.mock('@react-pdf/renderer', () => ({
  pdf: jest.fn(() => ({
    toBlob: jest.fn(() => Promise.resolve(new Blob(['mock pdf data'], { type: 'application/pdf' })))
  })),
  Document: 'div',
  Page: 'div',
  Text: 'div',
  View: 'div',
  Image: 'div',
  StyleSheet: {
    create: jest.fn((styles) => styles)
  }
}));

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

// Setup global Blob if not available in test environment
if (typeof global.Blob === 'undefined') {
  global.Blob = class MockBlob {
    constructor(content: any[], options: any = {}) {
      this.size = content.reduce((size, item) => size + (typeof item === 'string' ? item.length : 0), 0);
      this.type = options.type || '';
    }
    size: number;
    type: string;
  } as any;
}

describe('ReportGenerationService', () => {
  let reportService: ReportGenerationService;
  let mockReportData: ReportData;

  beforeEach(() => {
    reportService = new ReportGenerationService();
    
    const mockChartData: ChartDataPoint[] = [
      { Date: '2024-01', Revenue: 10000, Expenses: 7000 },
      { Date: '2024-02', Revenue: 12000, Expenses: 8000 },
      { Date: '2024-03', Revenue: 11000, Expenses: 7500 }
    ];

    mockReportData = {
      financialData: mockChartData,
      metrics: {
        trends: { revenueGrowth: 10, profitGrowth: 15, marginGrowth: 5 },
        summaryStats: {
          totalRevenue: 33000,
          totalExpenses: 22500,
          averageMargin: 31.82,
          dataPoints: 3
        },
        healthIndicators: {
          revenueConsistency: 85,
          expenseVolatility: 0.3,
          profitabilityTrend: 'improving' as const
        }
      },
      chartImages: {
        revenueChart: 'data:image/png;base64,mockdata'
      },
      generatedAt: new Date('2024-01-01'),
      reportPeriod: {
        start: '2024-01',
        end: '2024-03'
      }
    };

    jest.clearAllMocks();
  });

  describe('Template Management', () => {
    test('should return available report templates', () => {
      const templates = reportService.getAvailableTemplates();
      
      expect(templates).toHaveLength(2);
      expect(templates[0].name).toBe('executive-summary');
      expect(templates[1].name).toBe('detailed-analysis');
    });
  });

  describe('PDF Generation', () => {
    test('should generate executive summary PDF report', async () => {
      const result = await reportService.generatePDFReport(mockReportData, {
        template: 'executive-summary',
        includeCharts: true,
        includeRawData: false,
        filename: 'test-report.pdf'
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('pdf');
      expect(result.filename).toBe('test-report.pdf');
    });

    test('should generate detailed analysis PDF report', async () => {
      const result = await reportService.generatePDFReport(mockReportData, {
        template: 'detailed-analysis',
        includeCharts: true,
        includeRawData: true,
        companyInfo: {
          name: 'Test Company',
          address: '123 Test St'
        },
        filename: 'detailed-report.pdf'
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('pdf');
      expect(result.filename).toBe('detailed-report.pdf');
    });

    test('should handle PDF generation errors gracefully', async () => {
      // Mock pdf function to throw an error
      const { pdf } = require('@react-pdf/renderer');
      pdf.mockImplementation(() => ({
        toBlob: jest.fn(() => Promise.reject(new Error('PDF generation failed')))
      }));

      await expect(reportService.generatePDFReport(mockReportData, {
        template: 'executive-summary',
        filename: 'error-test.pdf'
      })).rejects.toThrow('Failed to generate PDF report');
    });
  });

  describe('Report Preview', () => {
    test('should generate report preview information', async () => {
      const template = reportService.getAvailableTemplates()[0];
      const preview = await reportService.previewReport(mockReportData, template);

      expect(preview.pageCount).toBeGreaterThan(0);
      expect(preview.sections).toContain('Executive Summary');
      expect(preview.estimatedSize).toBeGreaterThan(0);
    });
  });

  describe('Section Generation', () => {
    test('should generate report sections', () => {
      const template = reportService.getAvailableTemplates()[0];
      const sections = reportService.generateReportSections(mockReportData, template);

      expect(sections).toHaveLength(template.sections.length);
      expect(sections[0].title).toBe('Executive Summary');
      expect(sections[0].content).toContain('Total Revenue');
    });

    test('should sort sections by order', () => {
      const template = reportService.getAvailableTemplates()[1]; // detailed-analysis
      const sections = reportService.generateReportSections(mockReportData, template);

      expect(sections[0].order).toBe(1);
      expect(sections[1].order).toBe(2);
      expect(sections[2].order).toBe(3);
    });
  });
});
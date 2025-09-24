/**
 * Export Service Tests
 */

import { ExportService } from '../export.service';
import { ChartDataPoint } from '../../types';

// Mock file-saver to avoid browser API dependencies in tests
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

// Mock html2canvas for chart export tests
jest.mock('html2canvas', () => {
  return jest.fn(() => {
    const mockCanvas = {
      toBlob: jest.fn((callback) => {
        const mockBlob = new Blob(['mock image data'], { type: 'image/png' });
        callback(mockBlob);
      }),
      toDataURL: jest.fn(() => 'data:image/png;base64,mockedImageData'),
      width: 800,
      height: 600
    };
    return Promise.resolve(mockCanvas);
  });
});

// Mock XLSX for Excel export tests
jest.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn()
  },
  write: jest.fn(() => new ArrayBuffer(8))
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

describe('ExportService', () => {
  let exportService: ExportService;
  let mockChartData: ChartDataPoint[];

  beforeEach(() => {
    exportService = new ExportService();
    mockChartData = [
      { Date: '2024-01', Revenue: 10000, Expenses: 7000 },
      { Date: '2024-02', Revenue: 12000, Expenses: 8000 },
      { Date: '2024-03', Revenue: 11000, Expenses: 7500 }
    ];
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Data Export', () => {
    test('should export data as CSV with default options', async () => {
      const result = await exportService.exportData(mockChartData, {
        format: 'csv',
        filename: 'test-export'
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('csv');
      expect(result.filename).toBe('test-export.csv');
    });

    test('should export data as Excel with calculated fields', async () => {
      const result = await exportService.exportData(mockChartData, {
        format: 'xlsx',
        includeCalculatedFields: true,
        filename: 'test-export'
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('xlsx');
      expect(result.filename).toBe('test-export.xlsx');
    });

    test('should handle empty data export', async () => {
      // Should throw an error for empty data
      await expect(exportService.exportData([], {
        format: 'csv',
        filename: 'empty-test'
      })).rejects.toThrow('No data provided for CSV export');
    });
  });

  describe('Chart Export', () => {
    test('should require chart element for export', async () => {
      await expect(exportService.exportChart({
        format: 'png',
        chartType: 'revenue',
        filename: 'test-chart'
      })).rejects.toThrow('Chart element not provided');
    });

    test('should validate export format', async () => {
      const mockElement = document.createElement('div');
      
      await expect(exportService.exportChart({
        format: 'invalid' as any,
        chartType: 'revenue',
        element: mockElement,
        filename: 'test-chart'
      })).rejects.toThrow('Unsupported chart export format');
    });

    test('should successfully export chart as PNG', async () => {
      const mockElement = document.createElement('div');
      
      const result = await exportService.exportChart({
        format: 'png',
        chartType: 'revenue',
        element: mockElement,
        filename: 'test-chart'
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('png');
      expect(result.filename).toBe('test-chart.png');
    });
  });

  describe('Batch Export', () => {
    test('should handle batch export with mixed success/failure', async () => {
      const mockElement = document.createElement('div');
      
      const chartOptions = [
        {
          format: 'png' as const,
          chartType: 'revenue' as const,
          element: mockElement,
          filename: 'chart1'
        },
        {
          format: 'png' as const,
          chartType: 'profit' as const,
          // Missing element - should fail
          filename: 'chart2'
        }
      ];

      const results = await exportService.batchExportCharts(chartOptions);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('Export History', () => {
    test('should maintain export history', async () => {
      const result = await exportService.exportData(mockChartData, {
        format: 'csv',
        filename: 'history-test'
      });

      const history = exportService.getExportHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(result);
    });

    test('should clear export history', () => {
      exportService.clearExportHistory();
      const history = exportService.getExportHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Data Formatting', () => {
    test('should format numbers as currency when specified', async () => {
      const result = await exportService.exportData(mockChartData, {
        format: 'csv',
        numberFormat: 'currency',
        filename: 'currency-test'
      });

      expect(result.success).toBe(true);
    });

    test('should format dates according to specified format', async () => {
      const result = await exportService.exportData(mockChartData, {
        format: 'csv',
        dateFormat: 'MM/DD/YYYY',
        filename: 'date-test'
      });

      expect(result.success).toBe(true);
    });
  });
});
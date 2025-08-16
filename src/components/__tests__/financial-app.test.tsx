import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FinancialApp from '../financial-app';
import { fileProcessingService } from '../../services/file-processing.service';
import { AppError, ErrorType } from '../../utils/error-handling';

// Mock the file processing service
jest.mock('../../services/file-processing.service', () => ({
  fileProcessingService: {
    processFile: jest.fn(),
    getCircuitBreakerState: jest.fn(() => 'CLOSED'),
    getMetrics: jest.fn(() => ({
      totalFilesProcessed: 0,
      successfulProcessing: 0,
      failedProcessing: 0,
      averageProcessingTime: 0,
      circuitBreakerMetrics: null
    }))
  }
}));

const mockFileProcessingService = fileProcessingService as jest.Mocked<typeof fileProcessingService>;

describe('FinancialApp (CSV flow only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileProcessingService.getCircuitBreakerState.mockReturnValue('CLOSED');
  });

  // Mock container size to fix chart rendering issue
  const mockContainerSize = (container: HTMLElement) => {
    Object.defineProperty(container, 'offsetWidth', { configurable: true, value: 800 });
    Object.defineProperty(container, 'offsetHeight', { configurable: true, value: 600 });
  };

  test('uploads and parses CSV file', async () => {
    const mockResult = {
      data: {
        headers: ['Date', 'Revenue', 'Expenses', 'Profit'],
        rows: [
          {
            Date: '2024-01',
            Revenue: '125000.5',
            Expenses: '98500.25',
            Profit: '26500.25',
          },
        ],
        totalRows: 1
      },
      chartData: [
        {
          Date: '2024-01',
          Revenue: 125000.5,
          Expenses: 98500.25,
          profitMargin: 21.2
        }
      ],
      processingTime: 100,
      warnings: []
    };

    mockFileProcessingService.processFile.mockResolvedValue(mockResult);

    render(
      <div data-testid="chart-container" className="chartContainer">
        <FinancialApp />
      </div>
    );

    const container = screen.getByTestId('chart-container');
    mockContainerSize(container);

    const label = screen
      .getByText(/drag and drop a csv or excel file/i)
      .closest('label');
    const fileInput = label?.querySelector('input');

    const file = new File(['fake,data'], 'mock-financial-data.csv', {
      type: 'text/csv',
    });

    fireEvent.change(fileInput!, { target: { files: [file] } });

    // Wait for the data to appear
    await waitFor(() => {
      expect(screen.getByText('2024-01')).toBeInTheDocument();
    }, { timeout: 4000 });

    // Verify all data is displayed
    expect(screen.getByText('125000.5')).toBeInTheDocument();
    expect(screen.getByText('98500.25')).toBeInTheDocument();
    expect(screen.getByText('26500.25')).toBeInTheDocument();
  });

  test('shows CSV parse error', async () => {
    const parseError = new AppError(
      'CSV parsing failed: Fake CSV parse error',
      ErrorType.PARSE_ERROR
    );

    mockFileProcessingService.processFile.mockRejectedValue(parseError);

    render(
      <div data-testid="chart-container" className="chartContainer">
        <FinancialApp />
      </div>
    );

    const container = screen.getByTestId('chart-container');
    mockContainerSize(container);

    const label = screen
      .getByText(/drag and drop a csv or excel file/i)
      .closest('label');
    const fileInput = label?.querySelector('input');

    const file = new File([''], 'mock-error.csv', { type: 'text/csv' });
    fireEvent.change(fileInput!, { target: { files: [file] } });

    // Updated to match new error display format
    expect(await screen.findByText(/Parse Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to read the file contents/i)).toBeInTheDocument();
  });
});

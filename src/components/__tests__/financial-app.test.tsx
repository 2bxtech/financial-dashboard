import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FinancialApp from '../financial-app';
import Papa, { ParseLocalConfig, ParseResult } from 'papaparse';

// Mock 'papaparse' to avoid real parsing
jest.mock('papaparse', () => ({
  parse: jest.fn(),
}));

const parseMock = Papa.parse as unknown as jest.MockedFunction<
  (input: File, config: ParseLocalConfig<Record<string, any>, File>) => void
>;

describe('FinancialApp (CSV flow only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock container size to fix chart rendering issue
  const mockContainerSize = (container: HTMLElement) => {
    Object.defineProperty(container, 'offsetWidth', { configurable: true, value: 800 });
    Object.defineProperty(container, 'offsetHeight', { configurable: true, value: 600 });
  };

  test('uploads and parses CSV file', async () => {
    parseMock.mockImplementation((file, config) => {
      const mockResults: ParseResult<Record<string, any>> = {
        data: [
          {
            Date: '2024-01',
            Revenue: '125000.5',
            Expenses: '98500.25',
            Profit: '26500.25',
          },
        ],
        errors: [],
        meta: {
          fields: ['Date', 'Revenue', 'Expenses', 'Profit'],
          delimiter: ',',
          linebreak: '\n',
          aborted: false,
          truncated: false,
          cursor: 0,
        },
      };
      config.complete?.(mockResults, file);
    });

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

    // Wait for the data to appear without checking for loading state
    await waitFor(() => {
      expect(screen.getByText('2024-01')).toBeInTheDocument();
    }, { timeout: 4000 });

    // Verify all data is displayed
    expect(screen.getByText('125000.5')).toBeInTheDocument();
    expect(screen.getByText('98500.25')).toBeInTheDocument();
    expect(screen.getByText('26500.25')).toBeInTheDocument();
  });

  test('shows CSV parse error', async () => {
    parseMock.mockImplementation((file, config) => {
      const mockResults: ParseResult<Record<string, any>> = {
        data: [],
        errors: [
          {
            type: 'Delimiter',
            code: 'TooManyFields',
            message: 'Fake CSV parse error',
            row: 0,
          },
        ],
        meta: {
          fields: [],
          delimiter: ',',
          linebreak: '\n',
          aborted: false,
          truncated: false,
          cursor: 0,
        },
      };
      config.complete?.(mockResults, file);
    });

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

    expect(await screen.findByText(/parse errors:/i)).toBeInTheDocument();
    expect(screen.getByText(/fake csv parse error/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import FinancialApp from '../financial-app';

// Mock all dependencies
jest.mock('../file-uploader', () => ({
  __esModule: true,
  default: ({ onFileUpload, loading, error }: any) => (
    <div data-testid="file-uploader">
      <button 
        onClick={() => onFileUpload(new File(['test'], 'test.csv', { type: 'text/csv' }))}
        disabled={loading}
      >
        Upload File
      </button>
      {error && <div data-testid="file-error">{error}</div>}
      {loading && <div data-testid="file-loading">Loading...</div>}
    </div>
  ),
}));

jest.mock('../data-preview', () => ({
  __esModule: true,
  default: ({ data }: any) => data ? <div data-testid="data-preview">Data Preview</div> : null,
}));

jest.mock('../revenue-chart', () => ({
  __esModule: true,
  default: ({ data }: any) => data ? <div data-testid="revenue-chart">Revenue Chart</div> : null,
}));

jest.mock('../profit-chart', () => ({
  __esModule: true,
  default: ({ data }: any) => data ? <div data-testid="profit-chart">Profit Chart</div> : null,
}));

jest.mock('../trend-metrics', () => ({
  __esModule: true,
  default: ({ trends }: any) => trends ? <div data-testid="trend-metrics">Trend Metrics</div> : null,
}));

jest.mock('../error-display', () => ({
  __esModule: true,
  default: ({ error }: any) => error ? <div data-testid="error-display">{error}</div> : null,
}));

jest.mock('../loading-state', () => ({
  __esModule: true,
  default: ({ loading }: any) => loading ? <div data-testid="loading-state">Loading</div> : null,
}));

jest.mock('../undo-redo-controls', () => ({
  UndoRedoControls: () => <div data-testid="undo-redo-controls">Undo/Redo</div>,
}));

jest.mock('../store-demo', () => ({
  StoreDemo: () => <div data-testid="store-demo">Store Demo</div>,
}));

jest.mock('../../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
}));

jest.mock('../../services/file-processing.service', () => ({
  fileProcessingService: {
    processFile: jest.fn(),
  },
}));

jest.mock('../../services/data-processing.service', () => ({
  dataProcessingService: {
    processFinancialData: jest.fn(),
  },
}));

jest.mock('../../utils/error-handling', () => ({
  AppError: class AppError extends Error {
    constructor(message: string, public code: string) {
      super(message);
    }
  },
  ErrorHandler: {
    handleError: jest.fn(),
  },
}));

// Mock the store
jest.mock('../../store', () => {
  const mockStore = {
    fileData: null,
    chartData: null,
    trends: null,
    warnings: [],
    processingTime: null,
    lastFileInfo: null,
    loading: false,
    error: null,
    preferences: {
      theme: 'light',
      currency: 'USD',
      autoSave: true,
      notifications: true,
    },
    dashboardLayout: {
      showDataPreview: true,
      showTrendMetrics: true,
      chartOrder: ['revenue', 'profit'],
    },
  };

  return {
    useFileData: jest.fn(() => mockStore.fileData),
    useChartData: jest.fn(() => mockStore.chartData),
    useTrends: jest.fn(() => mockStore.trends),
    useWarnings: jest.fn(() => mockStore.warnings),
    useProcessingTime: jest.fn(() => mockStore.processingTime),
    useLastFileInfo: jest.fn(() => mockStore.lastFileInfo),
    useSetWarnings: jest.fn(),
    useLoading: jest.fn(() => mockStore.loading),
    useSetLoading: jest.fn(),
    useError: jest.fn(() => mockStore.error),
    useSetError: jest.fn(),
    useClearError: jest.fn(),
    useSetCircuitBreakerState: jest.fn(),
    useRecordProcessingMetrics: jest.fn(),
    useDashboardLayout: jest.fn(() => mockStore.dashboardLayout),
    usePreferences: jest.fn(() => mockStore.preferences),
    useClearFinancialData: jest.fn(),
    CommandHelpers: {
      handleClearData: jest.fn(),
    },
    mockStore, // Export for test access
  };
});

describe('Enhanced Financial App Integration', () => {
  let mockStore: any;
  let mockServices: any;
  let mockKeyboardShortcuts: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    mockStore = require('../../store').mockStore;
    mockServices = {
      fileProcessing: require('../../services/file-processing.service').fileProcessingService,
      dataProcessing: require('../../services/data-processing.service').dataProcessingService,
    };
    mockKeyboardShortcuts = require('../../hooks/useKeyboardShortcuts').useKeyboardShortcuts;

    // Reset store state
    mockStore.fileData = null;
    mockStore.chartData = null;
    mockStore.trends = null;
    mockStore.warnings = [];
    mockStore.processingTime = null;
    mockStore.lastFileInfo = null;
    mockStore.loading = false;
    mockStore.error = null;
    mockStore.preferences = {
      theme: 'light',
      currency: 'USD',
      autoSave: true,
      notifications: true,
    };
    mockStore.dashboardLayout = {
      showDataPreview: true,
      showTrendMetrics: true,
      chartOrder: ['revenue', 'profit'],
    };

    // Update mocked functions
    Object.keys(require('../../store')).forEach(key => {
      if (key.startsWith('use') && key !== 'useKeyboardShortcuts') {
        const mockFn = require('../../store')[key];
        if (jest.isMockFunction(mockFn)) {
          const storeKey = key.replace('use', '').replace(/^./, str => str.toLowerCase());
          const value = mockStore[storeKey] !== undefined ? mockStore[storeKey] : jest.fn();
          mockFn.mockReturnValue(value);
        }
      }
    });

    // Mock DOM methods
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false),
      },
      writable: true,
    });
  });

  describe('Component Rendering', () => {
    it('should render main application structure', () => {
      render(<FinancialApp />);

      expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
      expect(screen.getByTestId('undo-redo-controls')).toBeInTheDocument();
      expect(screen.getByText('Show Settings')).toBeInTheDocument();
    });

    it('should initialize keyboard shortcuts on mount', () => {
      render(<FinancialApp />);

      expect(mockKeyboardShortcuts).toHaveBeenCalledWith({
        enableUndoRedo: true,
        enableSave: true,
        customShortcuts: expect.arrayContaining([
          expect.objectContaining({
            key: 'Delete',
            ctrlKey: true,
            description: 'Clear all data',
          }),
          expect.objectContaining({
            key: 'd',
            ctrlKey: true,
            shiftKey: true,
            description: 'Toggle store demo',
          }),
        ]),
      });
    });

    it('should apply theme to document on mount', () => {
      mockStore.preferences.theme = 'dark';
      require('../../store').usePreferences.mockReturnValue(mockStore.preferences);

      render(<FinancialApp />);

      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should remove dark class when theme is light', () => {
      mockStore.preferences.theme = 'light';
      require('../../store').usePreferences.mockReturnValue(mockStore.preferences);

      render(<FinancialApp />);

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    });
  });

  describe('Settings Panel Toggle', () => {
    it('should show settings button by default', () => {
      render(<FinancialApp />);

      expect(screen.getByText('Show Settings')).toBeInTheDocument();
      expect(screen.queryByTestId('store-demo')).not.toBeInTheDocument();
    });

    it('should toggle settings panel when button is clicked', async () => {
      render(<FinancialApp />);

      const toggleButton = screen.getByText('Show Settings');

      await act(async () => {
        fireEvent.click(toggleButton);
      });

      expect(screen.getByText('Hide Settings')).toBeInTheDocument();
      expect(screen.getByTestId('store-demo')).toBeInTheDocument();
    });

    it('should hide settings panel when hide button is clicked', async () => {
      render(<FinancialApp />);

      const toggleButton = screen.getByText('Show Settings');

      // Show panel
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      expect(screen.getByTestId('store-demo')).toBeInTheDocument();

      // Hide panel
      const hideButton = screen.getByText('Hide Settings');
      await act(async () => {
        fireEvent.click(hideButton);
      });

      expect(screen.getByText('Show Settings')).toBeInTheDocument();
      expect(screen.queryByTestId('store-demo')).not.toBeInTheDocument();
    });
  });

  describe('Clear Data Functionality', () => {
    it('should show clear data button when file data exists', () => {
      mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };
      require('../../store').useFileData.mockReturnValue(mockStore.fileData);

      render(<FinancialApp />);

      expect(screen.getByText('Clear Data')).toBeInTheDocument();
    });

    it('should not show clear data button when no file data exists', () => {
      mockStore.fileData = null;
      require('../../store').useFileData.mockReturnValue(null);

      render(<FinancialApp />);

      expect(screen.queryByText('Clear Data')).not.toBeInTheDocument();
    });

    it('should call clear data command when button is clicked', async () => {
      mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };
      require('../../store').useFileData.mockReturnValue(mockStore.fileData);

      render(<FinancialApp />);

      const clearButton = screen.getByText('Clear Data');

      await act(async () => {
        fireEvent.click(clearButton);
      });

      expect(require('../../store').CommandHelpers.handleClearData).toHaveBeenCalledTimes(1);
    });
  });

  describe('File Processing Integration', () => {
    it('should process file upload correctly', async () => {
      const mockFileData = {
        headers: ['Date', 'Revenue'],
        rows: [{ Date: '2024-01-01', Revenue: '10000' }],
        totalRows: 1,
      };
      const mockChartData = [{ Date: '2024-01-01', Revenue: 10000 }];
      const mockTrends = { revenueGrowth: 15.5, profitGrowth: 10.2, marginGrowth: 5.1 };

      mockServices.fileProcessing.processFile.mockResolvedValue({
        data: mockFileData,
        metadata: { name: 'test.csv', size: 1024, type: 'text/csv', lastModified: Date.now() },
      });

      mockServices.dataProcessing.processFinancialData.mockReturnValue({
        chartData: mockChartData,
        trends: mockTrends,
        warnings: [],
      });

      render(<FinancialApp />);

      const uploadButton = screen.getByText('Upload File');

      await act(async () => {
        fireEvent.click(uploadButton);
      });

      expect(mockServices.fileProcessing.processFile).toHaveBeenCalled();
      expect(mockServices.dataProcessing.processFinancialData).toHaveBeenCalledWith(mockFileData);
    });

    it('should handle file processing errors', async () => {
      const error = new Error('File processing failed');
      mockServices.fileProcessing.processFile.mockRejectedValue(error);

      const mockSetError = jest.fn();
      require('../../store').useSetError.mockReturnValue(mockSetError);

      render(<FinancialApp />);

      const uploadButton = screen.getByText('Upload File');

      await act(async () => {
        fireEvent.click(uploadButton);
      });

      expect(mockSetError).toHaveBeenCalledWith('File processing failed');
    });

    it('should clear existing data before processing new file', async () => {
      mockStore.fileData = { headers: ['Old'], rows: [], totalRows: 0 };
      require('../../store').useFileData.mockReturnValue(mockStore.fileData);

      const mockClearFinancialData = jest.fn();
      require('../../store').useClearFinancialData.mockReturnValue(mockClearFinancialData);

      mockServices.fileProcessing.processFile.mockResolvedValue({
        data: { headers: ['New'], rows: [], totalRows: 0 },
        metadata: { name: 'test.csv', size: 1024, type: 'text/csv', lastModified: Date.now() },
      });

      render(<FinancialApp />);

      const uploadButton = screen.getByText('Upload File');

      await act(async () => {
        fireEvent.click(uploadButton);
      });

      expect(mockClearFinancialData).toHaveBeenCalled();
    });
  });

  describe('Data Display Conditional Rendering', () => {
    it('should show data preview when enabled in dashboard layout', () => {
      mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };
      mockStore.dashboardLayout.showDataPreview = true;
      
      require('../../store').useFileData.mockReturnValue(mockStore.fileData);
      require('../../store').useDashboardLayout.mockReturnValue(mockStore.dashboardLayout);

      render(<FinancialApp />);

      expect(screen.getByTestId('data-preview')).toBeInTheDocument();
    });

    it('should hide data preview when disabled in dashboard layout', () => {
      mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };
      mockStore.dashboardLayout.showDataPreview = false;
      
      require('../../store').useFileData.mockReturnValue(mockStore.fileData);
      require('../../store').useDashboardLayout.mockReturnValue(mockStore.dashboardLayout);

      render(<FinancialApp />);

      expect(screen.queryByTestId('data-preview')).not.toBeInTheDocument();
    });

    it('should show trend metrics when enabled and data exists', () => {
      mockStore.chartData = [{ Date: '2024-01-01', Revenue: 10000 }];
      mockStore.trends = { revenueGrowth: 15.5, profitGrowth: 10.2, marginGrowth: 5.1 };
      mockStore.dashboardLayout.showTrendMetrics = true;
      
      require('../../store').useChartData.mockReturnValue(mockStore.chartData);
      require('../../store').useTrends.mockReturnValue(mockStore.trends);
      require('../../store').useDashboardLayout.mockReturnValue(mockStore.dashboardLayout);

      render(<FinancialApp />);

      expect(screen.getByTestId('trend-metrics')).toBeInTheDocument();
    });

    it('should hide trend metrics when disabled in dashboard layout', () => {
      mockStore.chartData = [{ Date: '2024-01-01', Revenue: 10000 }];
      mockStore.trends = { revenueGrowth: 15.5, profitGrowth: 10.2, marginGrowth: 5.1 };
      mockStore.dashboardLayout.showTrendMetrics = false;
      
      require('../../store').useChartData.mockReturnValue(mockStore.chartData);
      require('../../store').useTrends.mockReturnValue(mockStore.trends);
      require('../../store').useDashboardLayout.mockReturnValue(mockStore.dashboardLayout);

      render(<FinancialApp />);

      expect(screen.queryByTestId('trend-metrics')).not.toBeInTheDocument();
    });

    it('should show charts when chart data exists', () => {
      mockStore.chartData = [{ Date: '2024-01-01', Revenue: 10000 }];
      require('../../store').useChartData.mockReturnValue(mockStore.chartData);

      render(<FinancialApp />);

      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
      expect(screen.getByTestId('profit-chart')).toBeInTheDocument();
    });
  });

  describe('Warning Display', () => {
    it('should display warnings when present', () => {
      mockStore.warnings = ['Warning 1', 'Warning 2'];
      require('../../store').useWarnings.mockReturnValue(mockStore.warnings);

      render(<FinancialApp />);

      expect(screen.getByText('Processing Warnings:')).toBeInTheDocument();
      expect(screen.getByText('• Warning 1')).toBeInTheDocument();
      expect(screen.getByText('• Warning 2')).toBeInTheDocument();
    });

    it('should not display warning section when no warnings', () => {
      mockStore.warnings = [];
      require('../../store').useWarnings.mockReturnValue([]);

      render(<FinancialApp />);

      expect(screen.queryByText('Processing Warnings:')).not.toBeInTheDocument();
    });

    it('should use proper dark mode classes for warnings', () => {
      mockStore.warnings = ['Test warning'];
      require('../../store').useWarnings.mockReturnValue(mockStore.warnings);

      render(<FinancialApp />);

      const warningContainer = screen.getByText('Processing Warnings:').closest('div');
      expect(warningContainer).toHaveClass(
        'bg-yellow-50',
        'dark:bg-yellow-900/20',
        'border-yellow-200',
        'dark:border-yellow-800'
      );
    });
  });

  describe('Loading and Error States', () => {
    it('should display loading state when loading', () => {
      mockStore.loading = true;
      require('../../store').useLoading.mockReturnValue(true);

      render(<FinancialApp />);

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('should display error when error exists', () => {
      mockStore.error = 'Test error message';
      require('../../store').useError.mockReturnValue('Test error message');

      render(<FinancialApp />);

      expect(screen.getByTestId('error-display')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should update document class when theme changes', async () => {
      const { rerender } = render(<FinancialApp />);

      // Initially light theme
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');

      // Change to dark theme
      mockStore.preferences.theme = 'dark';
      require('../../store').usePreferences.mockReturnValue(mockStore.preferences);

      rerender(<FinancialApp />);

      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should have transition classes for smooth theme switching', () => {
      render(<FinancialApp />);

      const container = screen.getByText('Financial Dashboard').closest('div');
      expect(container).toHaveClass('transition-colors');
    });
  });

  describe('Keyboard Shortcuts Integration', () => {
    it('should register keyboard shortcuts with proper callbacks', () => {
      render(<FinancialApp />);

      const shortcutsCall = mockKeyboardShortcuts.mock.calls[0][0];
      
      expect(shortcutsCall.enableUndoRedo).toBe(true);
      expect(shortcutsCall.enableSave).toBe(true);
      expect(shortcutsCall.customShortcuts).toHaveLength(2);
      
      // Test clear data shortcut
      const clearShortcut = shortcutsCall.customShortcuts.find((s: any) => s.key === 'Delete');
      expect(clearShortcut.ctrlKey).toBe(true);
      expect(clearShortcut.description).toBe('Clear all data');

      // Test toggle demo shortcut
      const toggleShortcut = shortcutsCall.customShortcuts.find((s: any) => s.key === 'd');
      expect(toggleShortcut.ctrlKey).toBe(true);
      expect(toggleShortcut.shiftKey).toBe(true);
      expect(toggleShortcut.description).toBe('Toggle store demo');
    });

    it('should execute clear data command when shortcut is triggered', () => {
      mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };
      require('../../store').useFileData.mockReturnValue(mockStore.fileData);

      render(<FinancialApp />);

      const shortcutsCall = mockKeyboardShortcuts.mock.calls[0][0];
      const clearShortcut = shortcutsCall.customShortcuts.find((s: any) => s.key === 'Delete');
      
      // Execute the shortcut action
      clearShortcut.action();

      expect(require('../../store').CommandHelpers.handleClearData).toHaveBeenCalledTimes(1);
    });
  });

  describe('Application Layout', () => {
    it('should have proper container styling', () => {
      render(<FinancialApp />);

      const container = screen.getByText('Financial Dashboard').closest('div');
      expect(container).toHaveClass(
        'container',
        'mx-auto', 
        'p-4',
        'space-y-6',
        'min-h-screen',
        'transition-colors'
      );
    });

    it('should have proper header layout', () => {
      render(<FinancialApp />);

      const header = screen.getByText('Financial Dashboard').closest('div');
      expect(header).toHaveClass('flex', 'justify-between', 'items-center', 'mb-4');
    });

    it('should arrange controls in header properly', () => {
      mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };
      require('../../store').useFileData.mockReturnValue(mockStore.fileData);

      render(<FinancialApp />);

      const controlsContainer = screen.getByTestId('undo-redo-controls').closest('div');
      expect(controlsContainer).toHaveClass('flex', 'items-center', 'space-x-2');
    });
  });
});
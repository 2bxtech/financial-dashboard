import { FinancialData, TrendMetricsData, ChartDataPoint } from '../types';
import { AppError } from '../utils/error-handling';
import { CircuitState } from '../utils/circuit-breaker';
import { ExportResult, ExportFormat } from '../services/interfaces/IExportService';

// Command pattern for undo/redo functionality
export interface Command {
  id: string;
  type: string;
  execute: () => void;
  undo: () => void;
  timestamp: number;
  description: string;
}

// Financial data store slice
export interface FinancialDataSlice {
  fileData: FinancialData | null;
  chartData: ChartDataPoint[] | null;
  trends: TrendMetricsData | null;
  warnings: string[];
  processingTime: number | null;
  lastFileInfo: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  } | null;
  
  // Actions
  setFileData: (data: FinancialData) => void;
  setChartData: (data: ChartDataPoint[]) => void;
  setTrends: (trends: TrendMetricsData) => void;
  setWarnings: (warnings: string[]) => void;
  setProcessingTime: (time: number) => void;
  setLastFileInfo: (info: FinancialDataSlice['lastFileInfo']) => void;
  clearFinancialData: () => void;
}

// UI state store slice
export interface UIStateSlice {
  loading: boolean;
  activeTab: string;
  sidebarCollapsed: boolean;
  chartSettings: {
    showGrid: boolean;
    showLegend: boolean;
    theme: 'light' | 'dark';
    chartType: 'line' | 'bar' | 'area';
  };
  dashboardLayout: {
    showDataPreview: boolean;
    showTrendMetrics: boolean;
    chartOrder: string[];
  };
  
  // Actions
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateChartSettings: (settings: Partial<UIStateSlice['chartSettings']>) => void;
  updateDashboardLayout: (layout: Partial<UIStateSlice['dashboardLayout']>) => void;
  resetUIState: () => void;
}

// Error state store slice
export interface ErrorStateSlice {
  error: AppError | null;
  errorHistory: AppError[];
  circuitBreakerState: {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
    state: CircuitState;
  };
  
  // Actions
  setError: (error: AppError | null) => void;
  addToErrorHistory: (error: AppError) => void;
  clearError: () => void;
  clearErrorHistory: () => void;
  setCircuitBreakerState: (state: {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
    state: CircuitState;
  }) => void;
}

// Processing metrics store slice
export interface ProcessingMetricsSlice {
  totalFilesProcessed: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  successfulUploads: number;
  failedUploads: number;
  lastProcessedAt: number | null;
  performanceHistory: {
    timestamp: number;
    fileSize: number;
    processingTime: number;
    success: boolean;
  }[];
  
  // Actions
  recordProcessingMetrics: (metrics: {
    fileSize: number;
    processingTime: number;
    success: boolean;
  }) => void;
  clearMetrics: () => void;
}

// Undo/Redo store slice
export interface UndoRedoSlice {
  undoStack: Command[];
  redoStack: Command[];
  maxHistorySize: number;
  
  // Actions
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// User preferences store slice
export interface UserPreferencesSlice {
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    dateFormat: string;
    numberFormat: 'US' | 'EU';
    autoSave: boolean;
    showTooltips: boolean;
    compactMode: boolean;
  };
  
  // Actions
  updatePreferences: (prefs: Partial<UserPreferencesSlice['preferences']>) => void;
  resetPreferences: () => void;
}

// File comparison store slice
export interface FileComparisonSlice {
  comparisonFiles: {
    id: string;
    name: string;
    data: FinancialData;
    chartData: ChartDataPoint[];
    uploadedAt: number;
  }[];
  activeComparison: string[] | null;
  
  // Actions
  addComparisonFile: (file: FileComparisonSlice['comparisonFiles'][0]) => void;
  removeComparisonFile: (id: string) => void;
  setActiveComparison: (fileIds: string[] | null) => void;
  clearAllComparisons: () => void;
}

// Export store slice
export interface ExportSlice {
  exportHistory: ExportResult[];
  isExporting: boolean;
  exportProgress: {
    current: number;
    total: number;
    status: string;
  } | null;
  exportPreferences: {
    defaultFormat: ExportFormat;
    includeHeaders: boolean;
    dateFormat: string;
    numberFormat: 'decimal' | 'currency';
    quality: number;
    includeCharts: boolean;
    includeRawData: boolean;
    companyInfo: {
      name: string;
      logo?: string;
      address: string;
    };
  };
  lastExportSettings: {
    format?: ExportFormat;
    template?: string;
    options?: Record<string, any>;
  };
  
  // Actions
  setExporting: (isExporting: boolean) => void;
  setExportProgress: (progress: ExportSlice['exportProgress']) => void;
  addToExportHistory: (result: ExportResult) => void;
  clearExportHistory: () => void;
  updateExportPreferences: (prefs: Partial<ExportSlice['exportPreferences']>) => void;
  setLastExportSettings: (settings: ExportSlice['lastExportSettings']) => void;
}

// Combined store type
export interface AppStore 
  extends FinancialDataSlice,
    UIStateSlice,
    ErrorStateSlice,
    ProcessingMetricsSlice,
    UndoRedoSlice,
    UserPreferencesSlice,
    FileComparisonSlice,
    ExportSlice {}

// Persistence configuration
export interface PersistenceConfig {
  name: string;
  version: number;
  include: (keyof AppStore)[];
  exclude: (keyof AppStore)[];
}
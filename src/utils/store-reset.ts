/**
 * Store Reset Utility
 * Provides functions to reset store state for testing and development
 */

import { useAppStore } from '../store';
import { AppStore } from '../store/types';
import { AppError, ErrorType, ErrorSeverity } from './error-handling';
import { CircuitState } from './circuit-breaker';

/**
 * Initial state for the store
 */
const getInitialState = (): Partial<AppStore> => ({
  // Financial Data
  fileData: null,
  chartData: null,
  trends: null,
  warnings: [],
  processingTime: null,
  lastFileInfo: null,

  // UI State
  loading: false,
  activeTab: 'overview',
  sidebarCollapsed: false,
  chartSettings: {
    showGrid: true,
    showLegend: true,
    theme: 'light',
    chartType: 'line',
  },
  dashboardLayout: {
    showDataPreview: true,
    showTrendMetrics: true,
    chartOrder: ['revenue', 'profit', 'expenses'],
  },

  // Error State
  error: null,
  errorHistory: [],
  circuitBreakerState: {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: null,
    state: CircuitState.CLOSED,
  },

  // Processing Metrics
  totalFilesProcessed: 0,
  totalProcessingTime: 0,
  averageProcessingTime: 0,
  successfulUploads: 0,
  failedUploads: 0,
  lastProcessedAt: null,
  performanceHistory: [],

  // Undo/Redo
  undoStack: [],
  redoStack: [],
  maxHistorySize: 50,

  // User Preferences
  preferences: {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: 'US',
    autoSave: true,
    showTooltips: true,
    compactMode: false,
  },

  // File Comparison
  comparisonFiles: [],
  activeComparison: null,
});

/**
 * Reset the entire store to initial state
 */
export const resetStore = (): void => {
  const initialState = getInitialState();
  useAppStore.setState(initialState);
};

/**
 * Reset only specific store slices
 */
export const resetStoreSlice = <K extends keyof AppStore>(slices: K[]): void => {
  const initialState = getInitialState();
  const updates: Partial<Pick<AppStore, K>> = {};
  
  slices.forEach(slice => {
    if (slice in initialState) {
      const value = initialState[slice];
      if (value !== undefined) {
        (updates as any)[slice] = value;
      }
    }
  });
  
  useAppStore.setState(updates);
};

/**
 * Reset all non-persistent state (keeps user preferences, metrics)
 */
export const resetNonPersistentState = (): void => {
  resetStoreSlice([
    'fileData',
    'chartData',
    'trends',
    'warnings',
    'processingTime',
    'lastFileInfo',
    'loading',
    'error',
    'errorHistory',
    'undoStack',
    'redoStack',
    'activeComparison',
  ]);
};

/**
 * Reset localStorage and store
 */
export const resetStorageAndStore = (): void => {
  // Clear localStorage
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('financial-dashboard')
  );
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Reset store
  resetStore();
};

/**
 * Create a snapshot of current store state
 */
export const createStoreSnapshot = (): string => {
  const state = useAppStore.getState();
  return JSON.stringify({
    timestamp: Date.now(),
    state,
  }, null, 2);
};

/**
 * Restore store from snapshot
 */
export const restoreStoreFromSnapshot = (snapshot: string): boolean => {
  try {
    const parsed = JSON.parse(snapshot);
    if (parsed.state) {
      useAppStore.setState(parsed.state);
      return true;
    }
  } catch (error) {
    console.error('Failed to restore store from snapshot:', error);
  }
  return false;
};

/**
 * Development utilities (only available in dev mode)
 */
export const DevUtils = process.env.NODE_ENV === 'development' ? {
  /**
   * Trigger sample error for testing
   */
  triggerSampleError: () => {
    const sampleError = new AppError(
      'Sample error for testing',
      ErrorType.UNKNOWN_ERROR,
      ErrorSeverity.LOW,
      true,
      'This is a test error for development purposes'
    );
    useAppStore.getState().setError(sampleError);
    console.log('Sample error triggered');
  },

  /**
   * Add sample performance metrics
   */
  addSampleMetrics: () => {
    useAppStore.getState().recordProcessingMetrics({
      fileSize: 1024 * 50, // 50KB
      processingTime: 1500, // 1.5 seconds
      success: true,
    });
    console.log('Sample metrics added');
  },

  /**
   * Test undo/redo functionality
   */
  testUndoRedo: () => {
    const { executeCommand } = useAppStore.getState();
    
    // Create a test command
    const testCommand = {
      id: `test-${Date.now()}`,
      type: 'TEST_COMMAND',
      execute: () => {
        useAppStore.getState().setActiveTab('settings');
        console.log('Test command executed');
      },
      undo: () => {
        useAppStore.getState().setActiveTab('overview');
        console.log('Test command undone');
      },
      timestamp: Date.now(),
      description: 'Test command for undo/redo',
    };
    
    executeCommand(testCommand);
    console.log('Test command added to undo stack');
  },

  /**
   * Log current store state
   */
  logState: () => {
    console.log('Current store state:', useAppStore.getState());
  },

  /**
   * Toggle chart settings for testing
   */
  toggleChartSettings: () => {
    const current = useAppStore.getState().chartSettings;
    useAppStore.getState().updateChartSettings({
      showGrid: !current.showGrid,
      showLegend: !current.showLegend,
      chartType: current.chartType === 'line' ? 'bar' : 'line',
    });
    console.log('Chart settings toggled');
  },

  /**
   * Test preference updates
   */
  testPreferences: () => {
    const current = useAppStore.getState().preferences;
    useAppStore.getState().updatePreferences({
      theme: current.theme === 'light' ? 'dark' : 'light',
      compactMode: !current.compactMode,
    });
    console.log('Preferences updated');
  },
} : {};

/**
 * Global development utilities
 */
if (process.env.NODE_ENV === 'development') {
  (window as any).__storeUtils = {
    reset: resetStore,
    resetSlice: resetStoreSlice,
    resetNonPersistent: resetNonPersistentState,
    resetAll: resetStorageAndStore,
    snapshot: createStoreSnapshot,
    restore: restoreStoreFromSnapshot,
    dev: DevUtils,
  };
  
  console.log('🔧 Store utilities available at window.__storeUtils');
}
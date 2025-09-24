import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { AppStore } from './types';
import { createFinancialDataSlice } from './financial-data-slice';
import { createUIStateSlice } from './ui-state-slice';
import { createErrorStateSlice } from './error-state-slice';
import { createProcessingMetricsSlice } from './processing-metrics-slice';
import { createUndoRedoSlice } from './undo-redo-slice';
import { createUserPreferencesSlice } from './user-preferences-slice';
import { createFileComparisonSlice } from './file-comparison-slice';
import { createExportSlice } from './export-slice';

// Define which state should be persisted
const persistedKeys: (keyof AppStore)[] = [
  'preferences',
  'chartSettings',
  'dashboardLayout',
  'sidebarCollapsed',
  'totalFilesProcessed',
  'totalProcessingTime',
  'averageProcessingTime',
  'successfulUploads',
  'failedUploads',
  'comparisonFiles',
  'exportPreferences',
  'exportHistory',
  'lastExportSettings',
];

// Custom partialize function to control what gets persisted
const partialize = (state: AppStore) => {
  const persistedState: Partial<AppStore> = {};
  
  persistedKeys.forEach(key => {
    if (key in state) {
      (persistedState as any)[key] = (state as any)[key];
    }
  });
  
  return persistedState;
};

// Create the store with all slices combined
export const useAppStore = create<AppStore>()(
  persist(
    subscribeWithSelector(
      (set, get, api) => ({
        // Combine all slices - cast to any to avoid TypeScript issues with slice merging
        ...(createFinancialDataSlice as any)(set, get, api),
        ...(createUIStateSlice as any)(set, get, api),
        ...(createErrorStateSlice as any)(set, get, api),
        ...(createProcessingMetricsSlice as any)(set, get, api),
        ...(createUndoRedoSlice as any)(set, get, api),
        ...(createUserPreferencesSlice as any)(set, get, api),
        ...(createFileComparisonSlice as any)(set, get, api),
        ...(createExportSlice as any)(set, get, api),
      })
    ),
    {
      name: 'financial-dashboard-store',
      partialize,
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration between different store versions
        if (version === 0) {
          // Migration from version 0 to 1 - no changes needed for now
          return persistedState;
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Store rehydrated successfully');
          // Perform any post-rehydration setup here
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useFinancialData = () => {
  const fileData = useAppStore((state) => state.fileData);
  const chartData = useAppStore((state) => state.chartData);
  const trends = useAppStore((state) => state.trends);
  const warnings = useAppStore((state) => state.warnings);
  const processingTime = useAppStore((state) => state.processingTime);
  const lastFileInfo = useAppStore((state) => state.lastFileInfo);
  const setFileData = useAppStore((state) => state.setFileData);
  const setChartData = useAppStore((state) => state.setChartData);
  const setTrends = useAppStore((state) => state.setTrends);
  const setWarnings = useAppStore((state) => state.setWarnings);
  const setProcessingTime = useAppStore((state) => state.setProcessingTime);
  const setLastFileInfo = useAppStore((state) => state.setLastFileInfo);
  const clearFinancialData = useAppStore((state) => state.clearFinancialData);

  return {
    fileData,
    chartData,
    trends,
    warnings,
    processingTime,
    lastFileInfo,
    setFileData,
    setChartData,
    setTrends,
    setWarnings,
    setProcessingTime,
    setLastFileInfo,
    clearFinancialData,
  };
};

export const useUIState = () => {
  const loading = useAppStore((state) => state.loading);
  const setLoading = useAppStore((state) => state.setLoading);
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const updateChartSettings = useAppStore((state) => state.updateChartSettings);
  const dashboardLayout = useAppStore((state) => state.dashboardLayout);
  const updateDashboardLayout = useAppStore((state) => state.updateDashboardLayout);
  const resetUIState = useAppStore((state) => state.resetUIState);

  return {
    loading,
    activeTab,
    sidebarCollapsed,
    chartSettings,
    dashboardLayout,
    setLoading,
    setActiveTab,
    setSidebarCollapsed,
    updateChartSettings,
    updateDashboardLayout,
    resetUIState,
  };
};

export const useErrorState = () => {
  const error = useAppStore((state) => state.error);
  const errorHistory = useAppStore((state) => state.errorHistory);
  const circuitBreakerState = useAppStore((state) => state.circuitBreakerState);
  const setError = useAppStore((state) => state.setError);
  const addToErrorHistory = useAppStore((state) => state.addToErrorHistory);
  const clearError = useAppStore((state) => state.clearError);
  const clearErrorHistory = useAppStore((state) => state.clearErrorHistory);
  const setCircuitBreakerState = useAppStore((state) => state.setCircuitBreakerState);

  return {
    error,
    errorHistory,
    circuitBreakerState,
    setError,
    addToErrorHistory,
    clearError,
    clearErrorHistory,
    setCircuitBreakerState,
  };
};

export const useProcessingMetrics = () => {
  const totalFilesProcessed = useAppStore((state) => state.totalFilesProcessed);
  const totalProcessingTime = useAppStore((state) => state.totalProcessingTime);
  const averageProcessingTime = useAppStore((state) => state.averageProcessingTime);
  const successfulUploads = useAppStore((state) => state.successfulUploads);
  const failedUploads = useAppStore((state) => state.failedUploads);
  const lastProcessedAt = useAppStore((state) => state.lastProcessedAt);
  const performanceHistory = useAppStore((state) => state.performanceHistory);
  const recordProcessingMetrics = useAppStore((state) => state.recordProcessingMetrics);
  const clearMetrics = useAppStore((state) => state.clearMetrics);

  return {
    totalFilesProcessed,
    totalProcessingTime,
    averageProcessingTime,
    successfulUploads,
    failedUploads,
    lastProcessedAt,
    performanceHistory,
    recordProcessingMetrics,
    clearMetrics,
  };
};

export const useUndoRedo = () => {
  const undoStack = useAppStore((state) => state.undoStack);
  const redoStack = useAppStore((state) => state.redoStack);
  const maxHistorySize = useAppStore((state) => state.maxHistorySize);
  const executeCommand = useAppStore((state) => state.executeCommand);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const clearHistory = useAppStore((state) => state.clearHistory);
  const canUndo = useAppStore((state) => state.canUndo);
  const canRedo = useAppStore((state) => state.canRedo);

  return {
    undoStack,
    redoStack,
    maxHistorySize,
    executeCommand,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
  };
};

export const useUserPreferences = () => {
  const preferences = useAppStore((state) => state.preferences);
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const resetPreferences = useAppStore((state) => state.resetPreferences);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
};

export const useFileComparison = () => {
  const comparisonFiles = useAppStore((state) => state.comparisonFiles);
  const activeComparison = useAppStore((state) => state.activeComparison);
  const addComparisonFile = useAppStore((state) => state.addComparisonFile);
  const removeComparisonFile = useAppStore((state) => state.removeComparisonFile);
  const setActiveComparison = useAppStore((state) => state.setActiveComparison);
  const clearAllComparisons = useAppStore((state) => state.clearAllComparisons);

  return {
    comparisonFiles,
    activeComparison,
    addComparisonFile,
    removeComparisonFile,
    setActiveComparison,
    clearAllComparisons,
  };
};

export const useExport = () => {
  const exportHistory = useAppStore((state) => state.exportHistory);
  const isExporting = useAppStore((state) => state.isExporting);
  const exportProgress = useAppStore((state) => state.exportProgress);
  const exportPreferences = useAppStore((state) => state.exportPreferences);
  const lastExportSettings = useAppStore((state) => state.lastExportSettings);
  const setExporting = useAppStore((state) => state.setExporting);
  const setExportProgress = useAppStore((state) => state.setExportProgress);
  const addToExportHistory = useAppStore((state) => state.addToExportHistory);
  const clearExportHistory = useAppStore((state) => state.clearExportHistory);
  const updateExportPreferences = useAppStore((state) => state.updateExportPreferences);
  const setLastExportSettings = useAppStore((state) => state.setLastExportSettings);

  return {
    exportHistory,
    isExporting,
    exportProgress,
    exportPreferences,
    lastExportSettings,
    setExporting,
    setExportProgress,
    addToExportHistory,
    clearExportHistory,
    updateExportPreferences,
    setLastExportSettings,
  };
};

// Store actions for complex operations
export const StoreActions = {
  // Reset all non-persistent state
  resetApp: () => {
    useAppStore.getState().clearFinancialData();
    useAppStore.getState().clearError();
    useAppStore.getState().resetUIState();
    useAppStore.getState().clearHistory();
    useAppStore.getState().clearAllComparisons();
  },

  // Import dashboard configuration
  importConfig: async (file: File) => {
    try {
      const { DashboardConfig } = await import('../utils/persistence');
      const config = await DashboardConfig.import(file);
      
      const state = useAppStore.getState();
      
      if (config.userPreferences) {
        state.updatePreferences(config.userPreferences);
      }
      
      if (config.chartSettings) {
        state.updateChartSettings(config.chartSettings);
      }
      
      if (config.dashboardLayout) {
        state.updateDashboardLayout(config.dashboardLayout);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      throw error;
    }
  },

  // Export dashboard configuration
  exportConfig: () => {
    const state = useAppStore.getState();
    const { DashboardConfig } = require('../utils/persistence');
    return DashboardConfig.export(state);
  },
};
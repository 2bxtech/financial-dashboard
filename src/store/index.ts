import { create } from 'zustand';
import { persist, subscribeWithSelector, devtools } from 'zustand/middleware';
import { AppStore } from './types';
import { migrateStore, getCurrentVersion } from './migrations';
import { createFinancialDataSlice } from './financial-data-slice';
import { createUIStateSlice } from './ui-state-slice';
import { createErrorStateSlice } from './error-state-slice';
import { createProcessingMetricsSlice } from './processing-metrics-slice';
import { createUndoRedoSlice } from './undo-redo-slice';
import { createUserPreferencesSlice } from './user-preferences-slice';
import { createFileComparisonSlice } from './file-comparison-slice';

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
];

// Define which state should NOT be persisted
const excludedKeys: (keyof AppStore)[] = [
  'loading',
  'error',
  'fileData',
  'chartData',
  'trends',
  'warnings',
  'processingTime',
  'lastFileInfo',
  'errorHistory',
  'circuitBreakerState',
  'undoStack',
  'redoStack',
  'lastProcessedAt',
  'performanceHistory',
  'activeComparison',
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
  devtools(
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
        })
      ),
      {
        name: 'financial-dashboard-store',
        partialize,
        version: getCurrentVersion(),
        migrate: (persistedState: any, version: number) => {
          console.log(`Migrating store from version ${version} to ${getCurrentVersion()}`);
          try {
            return migrateStore(persistedState, version);
          } catch (error) {
            console.error('Store migration failed, using defaults:', error);
            return {}; // Return empty state to use defaults
          }
        },
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log('Store rehydrated successfully');
            // Perform any post-rehydration setup here
          }
        },
      }
    ),
    { name: 'financial-dashboard' }
  )
);

// Individual property selectors to prevent unnecessary re-renders
// These are the ONLY recommended exports for optimal performance
// All legacy composed hooks have been removed to prevent performance issues

// Financial Data selectors
export const useFileData = () => useAppStore((state) => state.fileData);
export const useChartData = () => useAppStore((state) => state.chartData);
export const useTrends = () => useAppStore((state) => state.trends);
export const useWarnings = () => useAppStore((state) => state.warnings);
export const useProcessingTime = () => useAppStore((state) => state.processingTime);
export const useLastFileInfo = () => useAppStore((state) => state.lastFileInfo);

// Financial Data actions
export const useSetFileData = () => useAppStore((state) => state.setFileData);
export const useSetChartData = () => useAppStore((state) => state.setChartData);
export const useSetTrends = () => useAppStore((state) => state.setTrends);
export const useSetWarnings = () => useAppStore((state) => state.setWarnings);
export const useSetProcessingTime = () => useAppStore((state) => state.setProcessingTime);
export const useSetLastFileInfo = () => useAppStore((state) => state.setLastFileInfo);
export const useClearFinancialData = () => useAppStore((state) => state.clearFinancialData);

// UI State selectors
export const useLoading = () => useAppStore((state) => state.loading);
export const useActiveTab = () => useAppStore((state) => state.activeTab);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useChartSettings = () => useAppStore((state) => state.chartSettings);
export const useDashboardLayout = () => useAppStore((state) => state.dashboardLayout);

// UI State actions
export const useSetLoading = () => useAppStore((state) => state.setLoading);
export const useSetActiveTab = () => useAppStore((state) => state.setActiveTab);
export const useSetSidebarCollapsed = () => useAppStore((state) => state.setSidebarCollapsed);
export const useUpdateChartSettings = () => useAppStore((state) => state.updateChartSettings);
export const useUpdateDashboardLayout = () => useAppStore((state) => state.updateDashboardLayout);
export const useResetUIState = () => useAppStore((state) => state.resetUIState);

// Error State selectors
export const useError = () => useAppStore((state) => state.error);
export const useErrorHistory = () => useAppStore((state) => state.errorHistory);
export const useCircuitBreakerState = () => useAppStore((state) => state.circuitBreakerState);

// Error State actions
export const useSetError = () => useAppStore((state) => state.setError);
export const useAddToErrorHistory = () => useAppStore((state) => state.addToErrorHistory);
export const useClearError = () => useAppStore((state) => state.clearError);
export const useClearErrorHistory = () => useAppStore((state) => state.clearErrorHistory);
export const useSetCircuitBreakerState = () => useAppStore((state) => state.setCircuitBreakerState);

// Processing Metrics selectors
export const useTotalFilesProcessed = () => useAppStore((state) => state.totalFilesProcessed);
export const useTotalProcessingTime = () => useAppStore((state) => state.totalProcessingTime);
export const useAverageProcessingTime = () => useAppStore((state) => state.averageProcessingTime);
export const useSuccessfulUploads = () => useAppStore((state) => state.successfulUploads);
export const useFailedUploads = () => useAppStore((state) => state.failedUploads);
export const useLastProcessedAt = () => useAppStore((state) => state.lastProcessedAt);
export const usePerformanceHistory = () => useAppStore((state) => state.performanceHistory);

// Processing Metrics actions
export const useRecordProcessingMetrics = () => useAppStore((state) => state.recordProcessingMetrics);
export const useClearMetrics = () => useAppStore((state) => state.clearMetrics);

// Undo/Redo selectors
export const useUndoStack = () => useAppStore((state) => state.undoStack);
export const useRedoStack = () => useAppStore((state) => state.redoStack);
export const useCanUndo = () => useAppStore((state) => state.canUndo());
export const useCanRedo = () => useAppStore((state) => state.canRedo());

// Undo/Redo actions
export const useExecuteCommand = () => useAppStore((state) => state.executeCommand);
export const useUndo = () => useAppStore((state) => state.undo);
export const useRedo = () => useAppStore((state) => state.redo);
export const useClearHistory = () => useAppStore((state) => state.clearHistory);

// User Preferences selectors
export const usePreferences = () => useAppStore((state) => state.preferences);

// User Preferences actions
export const useUpdatePreferences = () => useAppStore((state) => state.updatePreferences);
export const useResetPreferences = () => useAppStore((state) => state.resetPreferences);

// File Comparison selectors
export const useComparisonFiles = () => useAppStore((state) => state.comparisonFiles);
export const useActiveComparison = () => useAppStore((state) => state.activeComparison);

// File Comparison actions
export const useAddComparisonFile = () => useAppStore((state) => state.addComparisonFile);
export const useRemoveComparisonFile = () => useAppStore((state) => state.removeComparisonFile);
export const useSetActiveComparison = () => useAppStore((state) => state.setActiveComparison);
export const useClearAllComparisons = () => useAppStore((state) => state.clearAllComparisons);

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

// Create command helpers with store instance
import { createCommandHelpers } from './commands';
export const CommandHelpers = createCommandHelpers(useAppStore.getState);
/**
 * Zustand Store Tests
 * Tests the core store functionality using individual selectors to prevent re-renders
 */

import { renderHook, act } from '@testing-library/react';
import { 
  // Individual selectors (no object creation)
  useFileData,
  useChartData,
  useTrends,
  useWarnings,
  useProcessingTime,
  useLastFileInfo,
  useSetFileData,
  useSetChartData,
  useSetTrends,
  useSetWarnings,
  useSetProcessingTime,
  useSetLastFileInfo,
  useClearFinancialData,
  
  useLoading,
  useActiveTab,
  useSidebarCollapsed,
  useChartSettings,
  useDashboardLayout,
  useSetLoading,
  useSetActiveTab,
  useSetSidebarCollapsed,
  useUpdateChartSettings,
  useUpdateDashboardLayout,
  useResetUIState,
  
  useError,
  useErrorHistory,
  useCircuitBreakerState,
  useSetError,
  useAddToErrorHistory,
  useClearError,
  useClearErrorHistory,
  useSetCircuitBreakerState,
  
  useTotalFilesProcessed,
  useTotalProcessingTime,
  useAverageProcessingTime,
  useSuccessfulUploads,
  useFailedUploads,
  useLastProcessedAt,
  usePerformanceHistory,
  useRecordProcessingMetrics,
  useClearMetrics,
  
  useUndoStack,
  useRedoStack,
  useCanUndo,
  useCanRedo,
  useExecuteCommand,
  useUndo,
  useRedo,
  useClearHistory,
  
  usePreferences,
  useUpdatePreferences,
  useResetPreferences,
  
  useComparisonFiles,
  useActiveComparison,
  useAddComparisonFile,
  useRemoveComparisonFile,
  useSetActiveComparison,
  useClearAllComparisons,
  
  useAppStore
} from '../index';
import { resetStore } from '../../utils/store-reset';
import { AppError, ErrorType, ErrorSeverity } from '../../utils/error-handling';

// Mock data
const mockFileData = {
  headers: ['Date', 'Revenue', 'Profit'],
  rows: [
    ['2024-01-01', '1000', '200'],
    ['2024-01-02', '1500', '300'],
  ],
  totalRows: 2,
};

const mockChartData = [
  { Date: '2024-01-01', Revenue: 1000, Profit: 200 },
  { Date: '2024-01-02', Revenue: 1500, Profit: 300 },
];

const mockTrends = {
  revenueGrowth: 15.5,
  profitGrowth: 8.3,
  marginGrowth: 2.1,
};

describe('Zustand Store', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Financial Data Management', () => {
    it('should set and clear financial data', () => {
      const { result: fileDataResult } = renderHook(() => useFileData());
      const { result: setFileDataResult } = renderHook(() => useSetFileData());
      const { result: clearDataResult } = renderHook(() => useClearFinancialData());

      // Set file data
      act(() => {
        setFileDataResult.current(mockFileData);
      });

      expect(fileDataResult.current).toEqual(mockFileData);

      // Clear data
      act(() => {
        clearDataResult.current();
      });

      expect(fileDataResult.current).toBeNull();
    });

    it('should update chart data and trends', () => {
      const { result: chartDataResult } = renderHook(() => useChartData());
      const { result: trendsResult } = renderHook(() => useTrends());
      const { result: setChartDataResult } = renderHook(() => useSetChartData());
      const { result: setTrendsResult } = renderHook(() => useSetTrends());

      act(() => {
        setChartDataResult.current(mockChartData);
        setTrendsResult.current(mockTrends);
      });

      expect(chartDataResult.current).toEqual(mockChartData);
      expect(trendsResult.current).toEqual(mockTrends);
    });

    it('should track processing time and warnings', () => {
      const { result: processingTimeResult } = renderHook(() => useProcessingTime());
      const { result: warningsResult } = renderHook(() => useWarnings());
      const { result: setProcessingTimeResult } = renderHook(() => useSetProcessingTime());
      const { result: setWarningsResult } = renderHook(() => useSetWarnings());

      act(() => {
        setProcessingTimeResult.current(1500);
        setWarningsResult.current(['Warning 1', 'Warning 2']);
      });

      expect(processingTimeResult.current).toBe(1500);
      expect(warningsResult.current).toEqual(['Warning 1', 'Warning 2']);
    });
  });

  describe('UI State Management', () => {
    it('should manage loading state', () => {
      const { result: loadingResult } = renderHook(() => useLoading());
      const { result: setLoadingResult } = renderHook(() => useSetLoading());

      expect(loadingResult.current).toBe(false);

      act(() => {
        setLoadingResult.current(true);
      });

      expect(loadingResult.current).toBe(true);
    });

    it('should update chart settings with immer', () => {
      const { result: chartSettingsResult } = renderHook(() => useChartSettings());
      const { result: updateChartSettingsResult } = renderHook(() => useUpdateChartSettings());

      act(() => {
        updateChartSettingsResult.current({
          showGrid: false,
          chartType: 'bar',
        });
      });

      expect(chartSettingsResult.current.showGrid).toBe(false);
      expect(chartSettingsResult.current.chartType).toBe('bar');
      expect(chartSettingsResult.current.showLegend).toBe(true); // Should preserve other settings
    });

    it('should toggle sidebar and manage tabs', () => {
      const { result: sidebarResult } = renderHook(() => useSidebarCollapsed());
      const { result: activeTabResult } = renderHook(() => useActiveTab());
      const { result: setSidebarResult } = renderHook(() => useSetSidebarCollapsed());
      const { result: setActiveTabResult } = renderHook(() => useSetActiveTab());

      act(() => {
        setSidebarResult.current(true);
        setActiveTabResult.current('settings');
      });

      expect(sidebarResult.current).toBe(true);
      expect(activeTabResult.current).toBe('settings');
    });
  });

  describe('Error State Management', () => {
    it('should handle errors and error history', () => {
      const { result: errorResult } = renderHook(() => useError());
      const { result: errorHistoryResult } = renderHook(() => useErrorHistory());
      const { result: setErrorResult } = renderHook(() => useSetError());
      const { result: addToErrorHistoryResult } = renderHook(() => useAddToErrorHistory());
      const { result: clearErrorResult } = renderHook(() => useClearError());

      const testError = new AppError(
        'Test error',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.MEDIUM
      );

      act(() => {
        setErrorResult.current(testError);
        addToErrorHistoryResult.current(testError);
      });

      expect(errorResult.current).toEqual(testError);
      expect(errorHistoryResult.current).toContain(testError);

      act(() => {
        clearErrorResult.current();
      });

      expect(errorResult.current).toBeNull();
      expect(errorHistoryResult.current).toContain(testError); // History should remain
    });

    it('should clear error history', () => {
      const { result: errorHistoryResult } = renderHook(() => useErrorHistory());
      const { result: addToErrorHistoryResult } = renderHook(() => useAddToErrorHistory());
      const { result: clearErrorHistoryResult } = renderHook(() => useClearErrorHistory());

      const testError = new AppError(
        'Test error',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.MEDIUM
      );

      act(() => {
        addToErrorHistoryResult.current(testError);
      });

      expect(errorHistoryResult.current).toHaveLength(1);

      act(() => {
        clearErrorHistoryResult.current();
      });

      expect(errorHistoryResult.current).toHaveLength(0);
    });
  });

  describe('Undo/Redo Functionality', () => {
    it('should execute commands and enable undo/redo', () => {
      const { result: fileDataResult } = renderHook(() => useFileData());
      const { result: setFileDataResult } = renderHook(() => useSetFileData());
      const { result: clearDataResult } = renderHook(() => useClearFinancialData());
      const { result: canUndoResult } = renderHook(() => useCanUndo());
      const { result: canRedoResult } = renderHook(() => useCanRedo());
      const { result: executeCommandResult } = renderHook(() => useExecuteCommand());
      const { result: undoResult } = renderHook(() => useUndo());
      const { result: redoResult } = renderHook(() => useRedo());

      // Create a test command
      const testCommand = {
        id: 'test-command',
        type: 'SET_FILE_DATA',
        execute: () => {
          setFileDataResult.current(mockFileData);
        },
        undo: () => {
          clearDataResult.current();
        },
        timestamp: Date.now(),
        description: 'Set test file data',
      };

      // Initially no undo/redo available
      expect(canUndoResult.current).toBe(false);
      expect(canRedoResult.current).toBe(false);

      // Execute command
      act(() => {
        executeCommandResult.current(testCommand);
      });

      expect(fileDataResult.current).toEqual(mockFileData);
      expect(canUndoResult.current).toBe(true);
      expect(canRedoResult.current).toBe(false);

      // Undo
      act(() => {
        undoResult.current();
      });

      expect(fileDataResult.current).toBeNull();
      expect(canUndoResult.current).toBe(false);
      expect(canRedoResult.current).toBe(true);

      // Redo
      act(() => {
        redoResult.current();
      });

      expect(fileDataResult.current).toEqual(mockFileData);
      expect(canUndoResult.current).toBe(true);
      expect(canRedoResult.current).toBe(false);
    });

    it('should clear history', () => {
      const { result: canUndoResult } = renderHook(() => useCanUndo());
      const { result: canRedoResult } = renderHook(() => useCanRedo());
      const { result: executeCommandResult } = renderHook(() => useExecuteCommand());
      const { result: clearHistoryResult } = renderHook(() => useClearHistory());

      const testCommand = {
        id: 'test-command',
        type: 'TEST',
        execute: () => {},
        undo: () => {},
        timestamp: Date.now(),
        description: 'Test command',
      };

      act(() => {
        executeCommandResult.current(testCommand);
      });

      expect(canUndoResult.current).toBe(true);

      act(() => {
        clearHistoryResult.current();
      });

      expect(canUndoResult.current).toBe(false);
      expect(canRedoResult.current).toBe(false);
    });
  });

  describe('Processing Metrics', () => {
    it('should record and track processing metrics', () => {
      const { result: totalFilesResult } = renderHook(() => useTotalFilesProcessed());
      const { result: successfulUploadsResult } = renderHook(() => useSuccessfulUploads());
      const { result: failedUploadsResult } = renderHook(() => useFailedUploads());
      const { result: totalProcessingTimeResult } = renderHook(() => useTotalProcessingTime());
      const { result: averageProcessingTimeResult } = renderHook(() => useAverageProcessingTime());
      const { result: recordMetricsResult } = renderHook(() => useRecordProcessingMetrics());

      const metrics = {
        fileSize: 1024,
        processingTime: 1500,
        success: true,
      };

      act(() => {
        recordMetricsResult.current(metrics);
      });

      expect(totalFilesResult.current).toBe(1);
      expect(successfulUploadsResult.current).toBe(1);
      expect(failedUploadsResult.current).toBe(0);
      expect(totalProcessingTimeResult.current).toBe(1500);
      expect(averageProcessingTimeResult.current).toBe(1500);
    });

    it('should track failed uploads', () => {
      const { result: totalFilesResult } = renderHook(() => useTotalFilesProcessed());
      const { result: successfulUploadsResult } = renderHook(() => useSuccessfulUploads());
      const { result: failedUploadsResult } = renderHook(() => useFailedUploads());
      const { result: recordMetricsResult } = renderHook(() => useRecordProcessingMetrics());

      const failedMetrics = {
        fileSize: 2048,
        processingTime: 500,
        success: false,
      };

      act(() => {
        recordMetricsResult.current(failedMetrics);
      });

      expect(totalFilesResult.current).toBe(1);
      expect(successfulUploadsResult.current).toBe(0);
      expect(failedUploadsResult.current).toBe(1);
    });
  });

  describe('Store Integration', () => {
    it('should maintain state consistency across multiple individual selectors', () => {
      const { result: fileDataResult1 } = renderHook(() => useFileData());
      const { result: fileDataResult2 } = renderHook(() => useFileData());
      const { result: loadingResult1 } = renderHook(() => useLoading());
      const { result: loadingResult2 } = renderHook(() => useLoading());
      const { result: setFileDataResult } = renderHook(() => useSetFileData());
      const { result: setLoadingResult } = renderHook(() => useSetLoading());

      // Update from one hook
      act(() => {
        setFileDataResult.current(mockFileData);
        setLoadingResult.current(true);
      });

      // Verify state is consistent across all individual selectors
      expect(fileDataResult1.current).toEqual(mockFileData);
      expect(fileDataResult2.current).toEqual(mockFileData);
      expect(loadingResult1.current).toBe(true);
      expect(loadingResult2.current).toBe(true);

      // Verify reference equality (same object reference)
      expect(fileDataResult1.current).toBe(fileDataResult2.current);
      expect(loadingResult1.current).toBe(loadingResult2.current);

      // Get the raw store state
      const storeState = useAppStore.getState();
      expect(storeState.fileData).toEqual(mockFileData);
      expect(storeState.loading).toBe(true);
    });

    it('should handle concurrent updates correctly', () => {
      const { result: fileDataResult } = renderHook(() => useFileData());
      const { result: chartDataResult } = renderHook(() => useChartData());
      const { result: loadingResult } = renderHook(() => useLoading());
      const { result: totalFilesResult } = renderHook(() => useTotalFilesProcessed());
      
      const { result: setFileDataResult } = renderHook(() => useSetFileData());
      const { result: setChartDataResult } = renderHook(() => useSetChartData());
      const { result: setLoadingResult } = renderHook(() => useSetLoading());
      const { result: recordMetricsResult } = renderHook(() => useRecordProcessingMetrics());

      // Simulate concurrent file processing
      act(() => {
        setLoadingResult.current(true);
        setFileDataResult.current(mockFileData);
        setChartDataResult.current(mockChartData);
        recordMetricsResult.current({
          fileSize: 1024,
          processingTime: 1500,
          success: true,
        });
        setLoadingResult.current(false);
      });

      expect(loadingResult.current).toBe(false);
      expect(fileDataResult.current).toEqual(mockFileData);
      expect(chartDataResult.current).toEqual(mockChartData);
      expect(totalFilesResult.current).toBe(1);
    });
  });
});
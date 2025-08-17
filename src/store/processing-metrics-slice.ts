import { StateCreator } from 'zustand';
import { ProcessingMetricsSlice } from './types';

export const createProcessingMetricsSlice: StateCreator<
  ProcessingMetricsSlice,
  [],
  [],
  ProcessingMetricsSlice
> = (set, get) => ({
  // Initial state
  totalFilesProcessed: 0,
  totalProcessingTime: 0,
  averageProcessingTime: 0,
  successfulUploads: 0,
  failedUploads: 0,
  lastProcessedAt: null,
  performanceHistory: [],

  // Actions
  recordProcessingMetrics: (metrics) => {
    set((state) => {
      const newTotalFiles = state.totalFilesProcessed + 1;
      const newTotalTime = state.totalProcessingTime + metrics.processingTime;
      const newAverageTime = newTotalTime / newTotalFiles;
      const newSuccessful = metrics.success 
        ? state.successfulUploads + 1 
        : state.successfulUploads;
      const newFailed = !metrics.success 
        ? state.failedUploads + 1 
        : state.failedUploads;

      const newHistoryEntry = {
        timestamp: Date.now(),
        fileSize: metrics.fileSize,
        processingTime: metrics.processingTime,
        success: metrics.success,
      };

      // Keep only the last 100 entries to prevent memory issues
      const newHistory = [...state.performanceHistory, newHistoryEntry].slice(-100);

      return {
        totalFilesProcessed: newTotalFiles,
        totalProcessingTime: newTotalTime,
        averageProcessingTime: newAverageTime,
        successfulUploads: newSuccessful,
        failedUploads: newFailed,
        lastProcessedAt: Date.now(),
        performanceHistory: newHistory,
      };
    });
  },

  clearMetrics: () => {
    set({
      totalFilesProcessed: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      successfulUploads: 0,
      failedUploads: 0,
      lastProcessedAt: null,
      performanceHistory: [],
    });
  },
});
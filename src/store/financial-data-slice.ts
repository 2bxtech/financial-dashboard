import { StateCreator } from 'zustand';
import { FinancialDataSlice } from './types';

export const createFinancialDataSlice: StateCreator<
  FinancialDataSlice,
  [],
  [],
  FinancialDataSlice
> = (set, get) => ({
  // Initial state
  fileData: null,
  chartData: null,
  trends: null,
  warnings: [],
  processingTime: null,
  lastFileInfo: null,

  // Actions
  setFileData: (data) => {
    set({ fileData: data });
  },

  setChartData: (data) => {
    set({ chartData: data });
  },

  setTrends: (trends) => {
    set({ trends });
  },

  setWarnings: (warnings) => {
    set({ warnings });
  },

  setProcessingTime: (time) => {
    set({ processingTime: time });
  },

  setLastFileInfo: (info) => {
    set({ lastFileInfo: info });
  },

  clearFinancialData: () => {
    set({
      fileData: null,
      chartData: null,
      trends: null,
      warnings: [],
      processingTime: null,
      lastFileInfo: null,
    });
  },
});
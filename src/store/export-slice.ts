/**
 * Export State Slice
 * Manages export operations, history, and preferences
 */

import { StateCreator } from 'zustand';
import { ExportSlice } from './types';
import { ExportResult, ExportFormat } from '../services/interfaces/IExportService';

export const createExportSlice: StateCreator<
  ExportSlice,
  [],
  [],
  ExportSlice
> = (set, get) => ({
  exportHistory: [],
  isExporting: false,
  exportProgress: null,
  exportPreferences: {
    defaultFormat: 'pdf',
    includeHeaders: true,
    dateFormat: 'YYYY-MM-DD',
    numberFormat: 'currency',
    quality: 0.95,
    includeCharts: true,
    includeRawData: false,
    companyInfo: {
      name: '',
      address: ''
    }
  },
  lastExportSettings: {},

  // Actions
  setExporting: (isExporting: boolean) => {
    set({ isExporting });
  },

  setExportProgress: (progress) => {
    set({ exportProgress: progress });
  },

  addToExportHistory: (result: ExportResult) => {
    set((state) => {
      const newHistory = [result, ...state.exportHistory];
      
      // Keep only the last 50 exports
      if (newHistory.length > 50) {
        newHistory.splice(50);
      }
      
      return { exportHistory: newHistory };
    });
  },

  clearExportHistory: () => {
    set({ exportHistory: [] });
  },

  updateExportPreferences: (prefs) => {
    set((state) => ({
      exportPreferences: {
        ...state.exportPreferences,
        ...prefs,
        companyInfo: prefs.companyInfo 
          ? { ...state.exportPreferences.companyInfo, ...prefs.companyInfo }
          : state.exportPreferences.companyInfo
      }
    }));
  },

  setLastExportSettings: (settings) => {
    set((state) => ({
      lastExportSettings: {
        ...state.lastExportSettings,
        ...settings
      }
    }));
  }
});
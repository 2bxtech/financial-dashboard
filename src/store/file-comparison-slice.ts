import { StateCreator } from 'zustand';
import { FileComparisonSlice } from './types';

export const createFileComparisonSlice: StateCreator<
  FileComparisonSlice,
  [],
  [],
  FileComparisonSlice
> = (set, get) => ({
  // Initial state
  comparisonFiles: [],
  activeComparison: null,

  // Actions
  addComparisonFile: (file) => {
    set((state) => {
      // Check if file already exists
      const existingIndex = state.comparisonFiles.findIndex(f => f.id === file.id);
      
      if (existingIndex >= 0) {
        // Update existing file
        const newFiles = [...state.comparisonFiles];
        newFiles[existingIndex] = file;
        return { comparisonFiles: newFiles };
      } else {
        // Add new file (limit to 5 files for performance)
        const newFiles = [...state.comparisonFiles, file].slice(-5);
        return { comparisonFiles: newFiles };
      }
    });
  },

  removeComparisonFile: (id) => {
    set((state) => {
      const newFiles = state.comparisonFiles.filter(f => f.id !== id);
      const newActiveComparison = state.activeComparison?.filter(fileId => fileId !== id) || null;
      
      return {
        comparisonFiles: newFiles,
        activeComparison: newActiveComparison?.length ? newActiveComparison : null,
      };
    });
  },

  setActiveComparison: (fileIds) => {
    set({ activeComparison: fileIds });
  },

  clearAllComparisons: () => {
    set({
      comparisonFiles: [],
      activeComparison: null,
    });
  },
});
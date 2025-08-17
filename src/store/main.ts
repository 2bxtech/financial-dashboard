// Re-export everything from the store
export * from './store';
export * from './types';
export * from './commands';

// Also export individual slices if needed
export { createFinancialDataSlice } from './financial-data-slice';
export { createUIStateSlice } from './ui-state-slice';
export { createErrorStateSlice } from './error-state-slice';
export { createProcessingMetricsSlice } from './processing-metrics-slice';
export { createUndoRedoSlice } from './undo-redo-slice';
export { createUserPreferencesSlice } from './user-preferences-slice';
export { createFileComparisonSlice } from './file-comparison-slice';
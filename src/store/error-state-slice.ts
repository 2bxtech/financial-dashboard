import { StateCreator } from 'zustand';
import { ErrorStateSlice } from './types';
import { AppError } from '../utils/error-handling';
import { CircuitState } from '../utils/circuit-breaker';

export const createErrorStateSlice: StateCreator<
  ErrorStateSlice,
  [],
  [],
  ErrorStateSlice
> = (set, get) => ({
  // Initial state
  error: null,
  errorHistory: [],
  circuitBreakerState: CircuitState.CLOSED,

  // Actions
  setError: (error) => {
    set({ error });
    
    // Add to error history if it's a new error
    if (error && !get().errorHistory.some(e => e.message === error.message)) {
      get().addToErrorHistory(error);
    }
  },

  addToErrorHistory: (error) => {
    set((state) => {
      const newHistory = [...state.errorHistory, error];
      // Keep only the last 50 errors to prevent memory issues
      return {
        errorHistory: newHistory.slice(-50),
      };
    });
  },

  clearError: () => {
    set({ error: null });
  },

  clearErrorHistory: () => {
    set({ errorHistory: [] });
  },

  setCircuitBreakerState: (state) => {
    set({ circuitBreakerState: state });
  },
});
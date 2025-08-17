import { StateCreator } from 'zustand';
import { UserPreferencesSlice } from './types';

const defaultPreferences = {
  theme: 'system' as const,
  language: 'en',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'US' as const,
  autoSave: true,
  showTooltips: true,
  compactMode: false,
};

export const createUserPreferencesSlice: StateCreator<
  UserPreferencesSlice,
  [],
  [],
  UserPreferencesSlice
> = (set, get) => ({
  // Initial state
  preferences: defaultPreferences,

  // Actions
  updatePreferences: (prefs) => {
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    }));
  },

  resetPreferences: () => {
    set({
      preferences: defaultPreferences,
    });
  },
});
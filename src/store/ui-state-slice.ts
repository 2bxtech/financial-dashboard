import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { UIStateSlice } from './types';

const defaultChartSettings = {
  showGrid: true,
  showLegend: true,
  theme: 'light' as const,
  chartType: 'line' as const,
};

const defaultDashboardLayout = {
  showDataPreview: true,
  showTrendMetrics: true,
  chartOrder: ['revenue-chart', 'profit-chart'],
};

export const createUIStateSlice: StateCreator<
  UIStateSlice,
  [],
  [],
  UIStateSlice
> = (set, get) => ({
  // Initial state
  loading: false,
  activeTab: 'dashboard',
  sidebarCollapsed: false,
  chartSettings: defaultChartSettings,
  dashboardLayout: defaultDashboardLayout,

  // Actions
  setLoading: (loading) => {
    set({ loading });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  updateChartSettings: (settings) => {
    set(produce((state) => {
      Object.assign(state.chartSettings, settings);
    }));
  },

  updateDashboardLayout: (layout) => {
    set(produce((state) => {
      Object.assign(state.dashboardLayout, layout);
    }));
  },

  resetUIState: () => {
    set({
      loading: false,
      activeTab: 'dashboard',
      sidebarCollapsed: false,
      chartSettings: defaultChartSettings,
      dashboardLayout: defaultDashboardLayout,
    });
  },
});
import { Command } from './types';
import { FinancialData, ChartDataPoint, TrendMetricsData } from '../types';
import type { AppStore } from './types';

export class CommandFactory {
  private static generateId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper method to restore upload state
  private static restoreUploadState(store: AppStore, state: any): void {
    if (state.fileData) {
      store.setFileData(state.fileData);
    } else {
      store.clearFinancialData();
    }
    
    if (state.chartData) {
      store.setChartData(state.chartData);
    }
    
    if (state.trends) {
      store.setTrends(state.trends);
    }
    
    store.setWarnings(state.warnings);
    
    if (state.processingTime !== null) {
      store.setProcessingTime(state.processingTime);
    }
    
    if (state.lastFileInfo) {
      store.setLastFileInfo(state.lastFileInfo);
    }
  }

  // File upload command
  static createFileUploadCommand(
    store: AppStore,
    fileData: FinancialData,
    chartData: ChartDataPoint[],
    trends: TrendMetricsData,
    warnings: string[],
    processingTime: number,
    fileInfo: {
      name: string;
      size: number;
      type: string;
      lastModified: number;
    }
  ): Command {
    // Capture current state for undo
    const previousState = {
      fileData: store.fileData,
      chartData: store.chartData,
      trends: store.trends,
      warnings: store.warnings,
      processingTime: store.processingTime,
      lastFileInfo: store.lastFileInfo,
    };

    return {
      id: this.generateId(),
      type: 'FILE_UPLOAD',
      description: `Upload file: ${fileInfo.name}`,
      timestamp: Date.now(),
      execute: () => {
        store.setFileData(fileData);
        store.setChartData(chartData);
        store.setTrends(trends);
        store.setWarnings(warnings);
        store.setProcessingTime(processingTime);
        store.setLastFileInfo(fileInfo);
      },
      undo: () => {
        CommandFactory.restoreUploadState(store, previousState);
      },
    };
  }

  // Clear data command
  static createClearDataCommand(store: AppStore): Command {
    // Capture current state for undo
    const previousState = {
      fileData: store.fileData,
      chartData: store.chartData,
      trends: store.trends,
      warnings: store.warnings,
      processingTime: store.processingTime,
      lastFileInfo: store.lastFileInfo,
    };

    return {
      id: this.generateId(),
      type: 'CLEAR_DATA',
      description: 'Clear all financial data',
      timestamp: Date.now(),
      execute: () => {
        store.clearFinancialData();
      },
      undo: () => {
        CommandFactory.restoreUploadState(store, previousState);
      },
    };
  }

  // Update chart settings command
  static createUpdateChartSettingsCommand(
    store: AppStore,
    newSettings: Partial<{
      showGrid: boolean;
      showLegend: boolean;
      theme: 'light' | 'dark';
      chartType: 'line' | 'bar' | 'area';
    }>
  ): Command {
    const previousSettings = { ...store.chartSettings };

    return {
      id: this.generateId(),
      type: 'UPDATE_CHART_SETTINGS',
      description: 'Update chart settings',
      timestamp: Date.now(),
      execute: () => {
        store.updateChartSettings(newSettings);
      },
      undo: () => {
        store.updateChartSettings(previousSettings);
      },
    };
  }

  // Update dashboard layout command
  static createUpdateDashboardLayoutCommand(
    store: AppStore,
    newLayout: Partial<{
      showDataPreview: boolean;
      showTrendMetrics: boolean;
      chartOrder: string[];
    }>
  ): Command {
    const previousLayout = { ...store.dashboardLayout };

    return {
      id: this.generateId(),
      type: 'UPDATE_DASHBOARD_LAYOUT',
      description: 'Update dashboard layout',
      timestamp: Date.now(),
      execute: () => {
        store.updateDashboardLayout(newLayout);
      },
      undo: () => {
        store.updateDashboardLayout(previousLayout);
      },
    };
  }

  // Update user preferences command
  static createUpdatePreferencesCommand(
    store: AppStore,
    newPreferences: Partial<{
      theme: 'light' | 'dark' | 'system';
      language: string;
      currency: string;
      dateFormat: string;
      numberFormat: 'US' | 'EU';
      autoSave: boolean;
      showTooltips: boolean;
      compactMode: boolean;
    }>
  ): Command {
    const previousPreferences = { ...store.preferences };

    return {
      id: this.generateId(),
      type: 'UPDATE_PREFERENCES',
      description: 'Update user preferences',
      timestamp: Date.now(),
      execute: () => {
        store.updatePreferences(newPreferences);
      },
      undo: () => {
        store.updatePreferences(previousPreferences);
      },
    };
  }

  // Add comparison file command
  static createAddComparisonFileCommand(
    store: AppStore,
    file: {
      id: string;
      name: string;
      data: FinancialData;
      chartData: ChartDataPoint[];
      uploadedAt: number;
    }
  ): Command {
    const previousFiles = [...store.comparisonFiles];

    return {
      id: this.generateId(),
      type: 'ADD_COMPARISON_FILE',
      description: `Add comparison file: ${file.name}`,
      timestamp: Date.now(),
      execute: () => {
        store.addComparisonFile(file);
      },
      undo: () => {
        store.removeComparisonFile(file.id);
      },
    };
  }

  // Remove comparison file command
  static createRemoveComparisonFileCommand(store: AppStore, fileId: string): Command {
    const fileToRemove = store.comparisonFiles.find((f: any) => f.id === fileId);
    const previousActiveComparison = store.activeComparison;

    if (!fileToRemove) {
      throw new Error(`File with id ${fileId} not found`);
    }

    return {
      id: this.generateId(),
      type: 'REMOVE_COMPARISON_FILE',
      description: `Remove comparison file: ${fileToRemove.name}`,
      timestamp: Date.now(),
      execute: () => {
        store.removeComparisonFile(fileId);
      },
      undo: () => {
        store.addComparisonFile(fileToRemove);
        if (previousActiveComparison) {
          store.setActiveComparison(previousActiveComparison);
        }
      },
    };
  }

  // Batch command for multiple operations
  static createBatchCommand(commands: Command[], description: string): Command {
    return {
      id: this.generateId(),
      type: 'BATCH',
      description,
      timestamp: Date.now(),
      execute: () => {
        commands.forEach(cmd => cmd.execute());
      },
      undo: () => {
        // Undo in reverse order
        commands.slice().reverse().forEach(cmd => cmd.undo());
      },
    };
  }
}

// Helper functions for common command operations
export const createCommandHelpers = (store: AppStore) => ({
  // Execute command with undo/redo support
  executeWithUndo: (command: Command) => {
    store.executeCommand(command);
  },

  // Create and execute file upload command
  handleFileUpload: (
    fileData: FinancialData,
    chartData: ChartDataPoint[],
    trends: TrendMetricsData,
    warnings: string[],
    processingTime: number,
    fileInfo: {
      name: string;
      size: number;
      type: string;
      lastModified: number;
    }
  ) => {
    const command = CommandFactory.createFileUploadCommand(
      store,
      fileData,
      chartData,
      trends,
      warnings,
      processingTime,
      fileInfo
    );
    store.executeCommand(command);
  },

  // Create and execute clear data command
  handleClearData: () => {
    const command = CommandFactory.createClearDataCommand(store);
    store.executeCommand(command);
  },

  // Create and execute chart settings update
  handleChartSettingsUpdate: (settings: any) => {
    const command = CommandFactory.createUpdateChartSettingsCommand(store, settings);
    store.executeCommand(command);
  },

  // Create and execute dashboard layout update
  handleDashboardLayoutUpdate: (layout: any) => {
    const command = CommandFactory.createUpdateDashboardLayoutCommand(store, layout);
    store.executeCommand(command);
  },

  // Create and execute preferences update
  handlePreferencesUpdate: (preferences: any) => {
    const command = CommandFactory.createUpdatePreferencesCommand(store, preferences);
    store.executeCommand(command);
  },
});
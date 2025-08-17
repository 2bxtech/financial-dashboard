import { Command } from './types';
import { FinancialData, ChartDataPoint, TrendMetricsData } from '../types';
import { useAppStore } from './store';

export class CommandFactory {
  private static generateId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // File upload command
  static createFileUploadCommand(
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
    const store = useAppStore.getState();
    
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
        if (previousState.fileData) {
          store.setFileData(previousState.fileData);
        } else {
          store.clearFinancialData();
        }
        
        if (previousState.chartData) {
          store.setChartData(previousState.chartData);
        }
        
        if (previousState.trends) {
          store.setTrends(previousState.trends);
        }
        
        store.setWarnings(previousState.warnings);
        
        if (previousState.processingTime !== null) {
          store.setProcessingTime(previousState.processingTime);
        }
        
        if (previousState.lastFileInfo) {
          store.setLastFileInfo(previousState.lastFileInfo);
        }
      },
    };
  }

  // Clear data command
  static createClearDataCommand(): Command {
    const store = useAppStore.getState();
    
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
        if (previousState.fileData) {
          store.setFileData(previousState.fileData);
        }
        
        if (previousState.chartData) {
          store.setChartData(previousState.chartData);
        }
        
        if (previousState.trends) {
          store.setTrends(previousState.trends);
        }
        
        store.setWarnings(previousState.warnings);
        
        if (previousState.processingTime !== null) {
          store.setProcessingTime(previousState.processingTime);
        }
        
        if (previousState.lastFileInfo) {
          store.setLastFileInfo(previousState.lastFileInfo);
        }
      },
    };
  }

  // Update chart settings command
  static createUpdateChartSettingsCommand(
    newSettings: Partial<{
      showGrid: boolean;
      showLegend: boolean;
      theme: 'light' | 'dark';
      chartType: 'line' | 'bar' | 'area';
    }>
  ): Command {
    const store = useAppStore.getState();
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
    newLayout: Partial<{
      showDataPreview: boolean;
      showTrendMetrics: boolean;
      chartOrder: string[];
    }>
  ): Command {
    const store = useAppStore.getState();
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
    const store = useAppStore.getState();
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
    file: {
      id: string;
      name: string;
      data: FinancialData;
      chartData: ChartDataPoint[];
      uploadedAt: number;
    }
  ): Command {
    const store = useAppStore.getState();
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
        // Remove the added file and restore previous state
        store.removeComparisonFile(file.id);
        // If the previous files list was different, restore it completely
        if (previousFiles.length !== store.comparisonFiles.length) {
          store.clearAllComparisons();
          previousFiles.forEach(prevFile => {
            store.addComparisonFile(prevFile);
          });
        }
      },
    };
  }

  // Remove comparison file command
  static createRemoveComparisonFileCommand(fileId: string): Command {
    const store = useAppStore.getState();
    const fileToRemove = store.comparisonFiles.find(f => f.id === fileId);
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
export const CommandHelpers = {
  // Execute command with undo/redo support
  executeWithUndo: (command: Command) => {
    const store = useAppStore.getState();
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
      fileData,
      chartData,
      trends,
      warnings,
      processingTime,
      fileInfo
    );
    CommandHelpers.executeWithUndo(command);
  },

  // Create and execute clear data command
  handleClearData: () => {
    const command = CommandFactory.createClearDataCommand();
    CommandHelpers.executeWithUndo(command);
  },

  // Create and execute chart settings update
  handleChartSettingsUpdate: (settings: any) => {
    const command = CommandFactory.createUpdateChartSettingsCommand(settings);
    CommandHelpers.executeWithUndo(command);
  },

  // Create and execute dashboard layout update
  handleDashboardLayoutUpdate: (layout: any) => {
    const command = CommandFactory.createUpdateDashboardLayoutCommand(layout);
    CommandHelpers.executeWithUndo(command);
  },

  // Create and execute preferences update
  handlePreferencesUpdate: (preferences: any) => {
    const command = CommandFactory.createUpdatePreferencesCommand(preferences);
    CommandHelpers.executeWithUndo(command);
  },
};
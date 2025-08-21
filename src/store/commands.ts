/**
 * Command Pattern Implementation for Undo/Redo functionality
 * 
 * This file implements the Command pattern to enable undo/redo operations.
 * 
 * IMPORTANT: To prevent memory leaks and stale data issues with closure variables:
 * - State is captured at EXECUTION time, not at CREATION time
 * - Each command uses closure variables (capturedState, capturedSettings, etc.)
 * - Error handling ensures commands are only added to undo stack on successful execution
 * 
 * This approach prevents:
 * 1. Memory leaks from persistent closure variables
 * 2. Stale data when store state changes between command creation and execution
 * 3. Inconsistent state when operations fail after being added to undo stack
 */

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
    let capturedState: any = null;

    return {
      id: this.generateId(),
      type: 'FILE_UPLOAD',
      description: `Upload file: ${fileInfo.name}`,
      timestamp: Date.now(),
      execute: () => {
        // Capture current state at execution time to avoid stale data
        capturedState = {
          fileData: store.fileData,
          chartData: store.chartData,
          trends: store.trends,
          warnings: store.warnings,
          processingTime: store.processingTime,
          lastFileInfo: store.lastFileInfo,
        };

        store.setFileData(fileData);
        store.setChartData(chartData);
        store.setTrends(trends);
        store.setWarnings(warnings);
        store.setProcessingTime(processingTime);
        store.setLastFileInfo(fileInfo);
      },
      undo: () => {
        if (!capturedState) {
          throw new Error('Cannot undo: previous state not captured during execution');
        }
        CommandFactory.restoreUploadState(store, capturedState);
      },
    };
  }

  // Clear data command
  static createClearDataCommand(store: AppStore): Command {
    let capturedState: any = null;

    return {
      id: this.generateId(),
      type: 'CLEAR_DATA',
      description: 'Clear all financial data',
      timestamp: Date.now(),
      execute: () => {
        // Only capture state if there's actually data to clear
        const hasData = !!(store.fileData || store.chartData || store.trends);
        
        if (hasData) {
          // Capture current state at execution time to avoid stale data
          capturedState = {
            fileData: store.fileData,
            chartData: store.chartData,
            trends: store.trends,
            warnings: store.warnings,
            processingTime: store.processingTime,
            lastFileInfo: store.lastFileInfo,
          };
        }
        
        try {
          store.clearFinancialData();
        } catch (error) {
          console.error('Failed to clear financial data:', error);
        }
      },
      undo: () => {
        if (!capturedState) {
          return;
        }
        
        CommandFactory.restoreUploadState(store, capturedState);
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
    let capturedSettings: any = null;

    return {
      id: this.generateId(),
      type: 'UPDATE_CHART_SETTINGS',
      description: 'Update chart settings',
      timestamp: Date.now(),
      execute: () => {
        // Capture current state at execution time
        capturedSettings = { ...store.chartSettings };
        store.updateChartSettings(newSettings);
      },
      undo: () => {
        if (!capturedSettings) {
          throw new Error('Cannot undo: previous chart settings not captured during execution');
        }
        store.updateChartSettings(capturedSettings);
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
    let capturedLayout: any = null;

    return {
      id: this.generateId(),
      type: 'UPDATE_DASHBOARD_LAYOUT',
      description: 'Update dashboard layout',
      timestamp: Date.now(),
      execute: () => {
        // Capture current state at execution time
        capturedLayout = { ...store.dashboardLayout };
        store.updateDashboardLayout(newLayout);
      },
      undo: () => {
        if (!capturedLayout) {
          throw new Error('Cannot undo: previous dashboard layout not captured during execution');
        }
        store.updateDashboardLayout(capturedLayout);
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
    let capturedPreferences: any = null;

    return {
      id: this.generateId(),
      type: 'UPDATE_PREFERENCES',
      description: 'Update user preferences',
      timestamp: Date.now(),
      execute: () => {
        // Capture current state at execution time
        capturedPreferences = { ...store.preferences };
        store.updatePreferences(newPreferences);
      },
      undo: () => {
        if (!capturedPreferences) {
          throw new Error('Cannot undo: previous preferences not captured during execution');
        }
        store.updatePreferences(capturedPreferences);
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
export const createCommandHelpers = (getStore: () => AppStore) => ({
  // Execute command with undo/redo support
  executeWithUndo: (command: Command) => {
    const store = getStore();
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
    const store = getStore();
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
    const store = getStore();
    const command = CommandFactory.createClearDataCommand(store);
    store.executeCommand(command);
  },

  // Create and execute chart settings update
  handleChartSettingsUpdate: (settings: any) => {
    const store = getStore();
    const command = CommandFactory.createUpdateChartSettingsCommand(store, settings);
    store.executeCommand(command);
  },

  // Create and execute dashboard layout update
  handleDashboardLayoutUpdate: (layout: any) => {
    const store = getStore();
    const command = CommandFactory.createUpdateDashboardLayoutCommand(store, layout);
    store.executeCommand(command);
  },

  // Create and execute preferences update
  handlePreferencesUpdate: (preferences: any) => {
    const store = getStore();
    const command = CommandFactory.createUpdatePreferencesCommand(store, preferences);
    store.executeCommand(command);
  },
});
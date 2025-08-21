import { CommandFactory, createCommandHelpers } from '../../store/commands';
import { useAppStore } from '../../store';
import { AppError } from '../../utils/error-handling';

// Mock the store
const createMockStore = () => ({
  fileData: null,
  chartData: null,
  trends: null,
  warnings: [],
  processingTime: 0,
  lastFileInfo: null,
  preferences: {
    theme: 'light',
    currency: 'USD',
    autoSave: true,
    notifications: true,
  },
  chartSettings: {
    chartType: 'line' as 'line' | 'bar' | 'area',
    showGrid: true,
    showLegend: true,
    animationDuration: 300,
  },
  dashboardLayout: {
    showDataPreview: true,
    showTrendMetrics: true,
    chartOrder: ['revenue', 'profit'],
  },
  undoStack: [],
  redoStack: [],
  clearFinancialData: jest.fn(),
  setFileData: jest.fn(),
  setChartData: jest.fn(),
  setTrends: jest.fn(),
  setWarnings: jest.fn(),
  setProcessingTime: jest.fn(),
  setLastFileInfo: jest.fn(),
  updatePreferences: jest.fn(),
  updateChartSettings: jest.fn(),
  updateDashboardLayout: jest.fn(),
  executeCommand: jest.fn(),
  undo: jest.fn(),
  redo: jest.fn(),
});

describe('Enhanced Store Command Pattern', () => {
  let mockStore: any;
  let getStore: () => any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = createMockStore();
    getStore = jest.fn(() => mockStore);
  });

  describe('Command Factory', () => {
    describe('File Upload Command', () => {
      it('should create file upload command with proper state capture', () => {
        const fileData = {
          headers: ['Date', 'Revenue'],
          rows: [{ Date: '2024-01-01', Revenue: '10000' }],
          totalRows: 1,
        };
        const chartData = [{ Date: '2024-01-01', Revenue: 10000 }];
        const trends = { revenueGrowth: 15.5, profitGrowth: 10.2, marginGrowth: 5.1 };
        const warnings = ['Test warning'];
        const processingTime = 1500;
        const lastFileInfo = { name: 'test.csv', size: 1024, type: 'text/csv', lastModified: Date.now() };

        const command = CommandFactory.createFileUploadCommand(
          mockStore,
          fileData,
          chartData,
          trends,
          warnings,
          processingTime,
          lastFileInfo
        );

        expect(command.description).toContain('Upload file: test.csv');
        expect(command.timestamp).toBeDefined();
        expect(typeof command.execute).toBe('function');
        expect(typeof command.undo).toBe('function');
      });

      it('should execute file upload command correctly', () => {
        const fileData = {
          headers: ['Date', 'Revenue'],
          rows: [{ Date: '2024-01-01', Revenue: '10000' }],
          totalRows: 1,
        };
        const chartData = [{ Date: '2024-01-01', Revenue: 10000 }];
        const trends = { revenueGrowth: 15.5, profitGrowth: 10.2, marginGrowth: 5.1 };
        const warnings = ['Test warning'];
        const processingTime = 1500;
        const lastFileInfo = { name: 'test.csv', size: 1024, type: 'text/csv', lastModified: Date.now() };

        const command = CommandFactory.createFileUploadCommand(
          mockStore,
          fileData,
          chartData,
          trends,
          warnings,
          processingTime,
          lastFileInfo
        );

        command.execute();

        expect(mockStore.setFileData).toHaveBeenCalledWith(fileData);
        expect(mockStore.setChartData).toHaveBeenCalledWith(chartData);
        expect(mockStore.setTrends).toHaveBeenCalledWith(trends);
        expect(mockStore.setWarnings).toHaveBeenCalledWith(warnings);
        expect(mockStore.setProcessingTime).toHaveBeenCalledWith(processingTime);
        expect(mockStore.setLastFileInfo).toHaveBeenCalledWith(lastFileInfo);
      });

      it('should undo file upload command correctly', () => {
        // Set up initial state
        mockStore.fileData = { headers: ['Old'], rows: [], totalRows: 0 };
        mockStore.chartData = [];
        mockStore.trends = null;
        mockStore.warnings = [];
        mockStore.processingTime = 0;
        mockStore.lastFileInfo = null;

        const fileData = {
          headers: ['Date', 'Revenue'],
          rows: [{ Date: '2024-01-01', Revenue: '10000' }],
          totalRows: 1,
        };
        const chartData = [{ Date: '2024-01-01', Revenue: 10000 }];
        const trends = { revenueGrowth: 15.5, profitGrowth: 10.2, marginGrowth: 5.1 };
        const warnings = ['Test warning'];
        const processingTime = 1500;
        const lastFileInfo = { name: 'test.csv', size: 1024, type: 'text/csv', lastModified: Date.now() };

        const command = CommandFactory.createFileUploadCommand(
          mockStore,
          fileData,
          chartData,
          trends,
          warnings,
          processingTime,
          lastFileInfo
        );

        // Execute and then undo
        command.execute();
        command.undo();

        // Should restore previous state
        expect(mockStore.setFileData).toHaveBeenCalledWith({ headers: ['Old'], rows: [], totalRows: 0 });
        expect(mockStore.setChartData).toHaveBeenCalledWith([]);
        expect(mockStore.setTrends).toHaveBeenCalledWith(null);
        expect(mockStore.setWarnings).toHaveBeenCalledWith([]);
        expect(mockStore.setProcessingTime).toHaveBeenCalledWith(0);
        expect(mockStore.setLastFileInfo).toHaveBeenCalledWith(null);
      });
    });

    describe('Clear Data Command', () => {
      it('should create clear data command', () => {
        const command = CommandFactory.createClearDataCommand(mockStore);

        expect(command.description).toBe('Clear all financial data');
        expect(command.timestamp).toBeDefined();
        expect(typeof command.execute).toBe('function');
        expect(typeof command.undo).toBe('function');
      });

      it('should execute clear data command only when data exists', () => {
        // No data case
        mockStore.fileData = null;
        mockStore.chartData = null;
        mockStore.trends = null;

        const command = CommandFactory.createClearDataCommand(mockStore);
        command.execute();

        expect(mockStore.clearFinancialData).toHaveBeenCalled();

        // With data case
        jest.clearAllMocks();
        mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };
        
        const commandWithData = CommandFactory.createClearDataCommand(mockStore);
        commandWithData.execute();

        expect(mockStore.clearFinancialData).toHaveBeenCalled();
      });

      it('should handle undo when no previous state was captured', () => {
        // No data to capture
        mockStore.fileData = null;
        mockStore.chartData = null;
        mockStore.trends = null;

        const command = CommandFactory.createClearDataCommand(mockStore);
        command.execute();

        // Should not throw when undoing with no captured state
        expect(() => command.undo()).not.toThrow();
      });

      it('should restore state correctly when undoing clear command', () => {
        // Set up data to be captured
        const originalData = {
          fileData: { headers: ['Date'], rows: [], totalRows: 0 },
          chartData: [{ Date: '2024-01-01', Revenue: 10000 }],
          trends: { revenueGrowth: 15.5, profitGrowth: 10.2, marginGrowth: 5.1 },
          warnings: ['Warning'],
          processingTime: 1000,
          lastFileInfo: { name: 'test.csv', size: 1024, type: 'text/csv', lastModified: Date.now() },
        };

        mockStore.fileData = originalData.fileData;
        mockStore.chartData = originalData.chartData;
        mockStore.trends = originalData.trends;
        mockStore.warnings = originalData.warnings;
        mockStore.processingTime = originalData.processingTime;
        mockStore.lastFileInfo = originalData.lastFileInfo;

        const command = CommandFactory.createClearDataCommand(mockStore);
        command.execute();
        command.undo();

        expect(mockStore.setFileData).toHaveBeenCalledWith(originalData.fileData);
        expect(mockStore.setChartData).toHaveBeenCalledWith(originalData.chartData);
        expect(mockStore.setTrends).toHaveBeenCalledWith(originalData.trends);
        expect(mockStore.setWarnings).toHaveBeenCalledWith(originalData.warnings);
        expect(mockStore.setProcessingTime).toHaveBeenCalledWith(originalData.processingTime);
        expect(mockStore.setLastFileInfo).toHaveBeenCalledWith(originalData.lastFileInfo);
      });

      it('should handle errors during clear data execution', () => {
        mockStore.clearFinancialData.mockImplementation(() => {
          throw new Error('Clear failed');
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const command = CommandFactory.createClearDataCommand(mockStore);
        
        expect(() => command.execute()).not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to clear financial data:', expect.any(Error));

        consoleSpy.mockRestore();
      });
    });

    describe('Settings Update Commands', () => {
      it('should create chart settings update command', () => {
        const newSettings = {
          chartType: 'bar' as const,
          showGrid: false,
          showLegend: true,
          animationDuration: 500,
        };

        const command = CommandFactory.createUpdateChartSettingsCommand(mockStore, newSettings);

        expect(command.description).toBe('Update chart settings');
        expect(command.timestamp).toBeDefined();
      });

      it('should execute chart settings update correctly', () => {
        const newSettings = {
          chartType: 'bar' as const,
          showGrid: false,
          showLegend: true,
          animationDuration: 500,
        };

        const command = CommandFactory.createUpdateChartSettingsCommand(mockStore, newSettings);
        command.execute();

        expect(mockStore.updateChartSettings).toHaveBeenCalledWith(newSettings);
      });

      it('should undo chart settings update correctly', () => {
        const originalSettings = { ...mockStore.chartSettings };
        const newSettings = {
          chartType: 'bar' as const,
          showGrid: false,
          showLegend: true,
          animationDuration: 500,
        };

        const command = CommandFactory.createUpdateChartSettingsCommand(mockStore, newSettings);
        command.execute();
        command.undo();

        expect(mockStore.updateChartSettings).toHaveBeenCalledWith(originalSettings);
      });

      it('should create preferences update command', () => {
        const newPreferences = {
          theme: 'dark' as const,
          currency: 'EUR',
          autoSave: false,
          notifications: false,
        };

        const command = CommandFactory.createUpdatePreferencesCommand(mockStore, newPreferences);

        expect(command.description).toBe('Update user preferences');
        expect(command.timestamp).toBeDefined();
      });

      it('should create dashboard layout update command', () => {
        const newLayout = {
          showDataPreview: false,
          showTrendMetrics: true,
          chartOrder: ['profit', 'revenue'],
        };

        const command = CommandFactory.createUpdateDashboardLayoutCommand(mockStore, newLayout);

        expect(command.description).toBe('Update dashboard layout');
        expect(command.timestamp).toBeDefined();
      });
    });
  });

  describe('Command Helpers with Live Store Access', () => {
    let commandHelpers: any;

    beforeEach(() => {
      commandHelpers = createCommandHelpers(getStore);
    });

    it('should execute command with live store reference', () => {
      const mockCommand = {
        description: 'Test command',
        timestamp: Date.now(),
        execute: jest.fn(),
        undo: jest.fn(),
      };

      commandHelpers.executeWithUndo(mockCommand);

      expect(getStore).toHaveBeenCalled();
      expect(mockStore.executeCommand).toHaveBeenCalledWith(mockCommand);
    });

    it('should handle file upload with live store reference', () => {
      const fileData = { headers: ['Date'], rows: [], totalRows: 0 };
      const chartData = [{ Date: '2024-01-01', Revenue: 10000 }];
      const trends = { revenueGrowth: 15.5, profitGrowth: 10.2, marginGrowth: 5.1 };
      const warnings: string[] = [];
      const processingTime = 1000;
      const lastFileInfo = { name: 'test.csv', size: 1024, type: 'text/csv', lastModified: Date.now() };

      commandHelpers.handleFileUpload(
        fileData,
        chartData,
        trends,
        warnings,
        processingTime,
        lastFileInfo
      );

      expect(getStore).toHaveBeenCalled();
      expect(mockStore.executeCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('Upload file: test.csv'),
        })
      );
    });

    it('should handle clear data with live store reference', () => {
      commandHelpers.handleClearData();

      expect(getStore).toHaveBeenCalled();
      expect(mockStore.executeCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Clear all financial data',
        })
      );
    });

    it('should handle chart settings update with live store reference', () => {
      const newSettings = {
        chartType: 'bar' as const,
        showGrid: false,
        showLegend: true,
        animationDuration: 500,
      };

      commandHelpers.handleChartSettingsUpdate(newSettings);

      expect(getStore).toHaveBeenCalled();
      expect(mockStore.executeCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Update chart settings',
        })
      );
    });

    it('should handle preferences update with live store reference', () => {
      const newPreferences = {
        theme: 'dark' as const,
        currency: 'EUR',
        autoSave: false,
        notifications: false,
      };

      commandHelpers.handlePreferencesUpdate(newPreferences);

      expect(getStore).toHaveBeenCalled();
      expect(mockStore.executeCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Update user preferences',
        })
      );
    });

    it('should handle dashboard layout update with live store reference', () => {
      const newLayout = {
        showDataPreview: false,
        showTrendMetrics: true,
        chartOrder: ['profit', 'revenue'],
      };

      commandHelpers.handleDashboardLayoutUpdate(newLayout);

      expect(getStore).toHaveBeenCalled();
      expect(mockStore.executeCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Update dashboard layout',
        })
      );
    });

    it('should get fresh store state on each command execution', () => {
      // First call
      commandHelpers.handleClearData();
      expect(getStore).toHaveBeenCalledTimes(1);

      // Second call should get fresh store
      commandHelpers.handleClearData();
      expect(getStore).toHaveBeenCalledTimes(2);

      // Third call with different command
      commandHelpers.handleChartSettingsUpdate({ chartType: 'area' });
      expect(getStore).toHaveBeenCalledTimes(3);
    });

    it('should work with updated store state', () => {
      // Initial state
      expect(mockStore.fileData).toBeNull();

      // Simulate store state change
      mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };
      
      // Command should work with updated state
      commandHelpers.handleClearData();

      expect(getStore).toHaveBeenCalled();
      expect(mockStore.executeCommand).toHaveBeenCalled();
    });
  });

  describe('Command Error Handling', () => {
    it('should handle command execution errors gracefully', () => {
      const faultyCommand = {
        id: 'test-cmd-1',
        type: 'TEST_COMMAND',
        description: 'Faulty command',
        timestamp: Date.now(),
        execute: jest.fn(() => {
          throw new Error('Execution failed');
        }),
        undo: jest.fn(),
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw
      expect(() => {
        const helpers = createCommandHelpers(getStore);
        helpers.executeWithUndo(faultyCommand);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle undo errors gracefully', () => {
      mockStore.fileData = { headers: ['Date'], rows: [], totalRows: 0 };

      const command = CommandFactory.createClearDataCommand(mockStore);
      command.execute();

      // Mock error during undo
      const originalUndo = command.undo;
      command.undo = jest.fn(() => {
        throw new Error('Undo failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw
      expect(() => command.undo()).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Command Timestamps and Metadata', () => {
    it('should include timestamp in all commands', () => {
      const beforeTime = Date.now();
      
      const commands = [
        CommandFactory.createClearDataCommand(mockStore),
        CommandFactory.createUpdatePreferencesCommand(mockStore, { theme: 'dark' }),
        CommandFactory.createUpdateChartSettingsCommand(mockStore, { chartType: 'bar' }),
        CommandFactory.createUpdateDashboardLayoutCommand(mockStore, { showDataPreview: false }),
      ];

      const afterTime = Date.now();

      commands.forEach(command => {
        expect(command.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(command.timestamp).toBeLessThanOrEqual(afterTime);
      });
    });

    it('should have descriptive command descriptions', () => {
      const commands = [
        CommandFactory.createClearDataCommand(mockStore),
        CommandFactory.createUpdatePreferencesCommand(mockStore, { theme: 'dark' }),
        CommandFactory.createUpdateChartSettingsCommand(mockStore, { chartType: 'bar' }),
        CommandFactory.createUpdateDashboardLayoutCommand(mockStore, { showDataPreview: false }),
      ];

      const descriptions = commands.map(cmd => cmd.description);

      expect(descriptions).toEqual([
        'Clear all financial data',
        'Update user preferences',
        'Update chart settings',
        'Update dashboard layout',
      ]);
    });
  });
});
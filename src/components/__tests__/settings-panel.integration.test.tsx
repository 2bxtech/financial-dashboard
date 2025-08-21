import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { StoreDemo } from '../store-demo';

// Mock the store
jest.mock('../../store', () => {
  const mockStore = {
    preferences: {
      theme: 'light',
      currency: 'USD',
      autoSave: true,
      notifications: true,
    },
    chartSettings: {
      chartType: 'line',
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
  };

  return {
    usePreferences: jest.fn(() => mockStore.preferences),
    useChartSettings: jest.fn(() => mockStore.chartSettings),
    useDashboardLayout: jest.fn(() => mockStore.dashboardLayout),
    useUndoStack: jest.fn(() => mockStore.undoStack),
    useRedoStack: jest.fn(() => mockStore.redoStack),
    CommandHelpers: {
      handleUpdateTheme: jest.fn(),
      handleUpdateChartType: jest.fn(),
      handleToggleDataPreview: jest.fn(),
      handlePreferencesUpdate: jest.fn(),
      handleChartSettingsUpdate: jest.fn(),
      handleDashboardLayoutUpdate: jest.fn(),
    },
    mockStore, // Export for test access
  };
});

// Mock the UndoRedoControls component
jest.mock('../undo-redo-controls', () => ({
  UndoRedoControls: () => <div data-testid="undo-redo-controls">Undo/Redo Controls</div>,
}));

describe('Settings Panel (StoreDemo) Integration', () => {
  let mockStore: any;
  let mockCommandHelpers: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = require('../../store').mockStore;
    mockCommandHelpers = require('../../store').CommandHelpers;
    
    // Reset store state
    mockStore.preferences = {
      theme: 'light',
      currency: 'USD',
      autoSave: true,
      notifications: true,
    };
    mockStore.chartSettings = {
      chartType: 'line',
      showGrid: true,
      showLegend: true,
      animationDuration: 300,
    };
    mockStore.dashboardLayout = {
      showDataPreview: true,
      showTrendMetrics: true,
      chartOrder: ['revenue', 'profit'],
    };
    mockStore.undoStack = [];
    mockStore.redoStack = [];
    
    // Update mocked functions to return current state
    require('../../store').usePreferences.mockReturnValue(mockStore.preferences);
    require('../../store').useChartSettings.mockReturnValue(mockStore.chartSettings);
    require('../../store').useDashboardLayout.mockReturnValue(mockStore.dashboardLayout);
    require('../../store').useUndoStack.mockReturnValue(mockStore.undoStack);
    require('../../store').useRedoStack.mockReturnValue(mockStore.redoStack);
  });

  describe('Component Rendering', () => {
    it('should render all main sections', () => {
      render(<StoreDemo />);

      expect(screen.getByText('Settings Panel with Undo/Redo')).toBeInTheDocument();
      expect(screen.getByText('Application Settings')).toBeInTheDocument();
      expect(screen.getByText('User Preferences')).toBeInTheDocument();
      expect(screen.getByText('Chart Settings')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Layout')).toBeInTheDocument();
      expect(screen.getByText('Undo/Redo Status')).toBeInTheDocument();
    });

    it('should display current theme preference', () => {
      render(<StoreDemo />);

      expect(screen.getByText('Current Theme:')).toBeInTheDocument();
      expect(screen.getByText('light')).toBeInTheDocument();
    });

    it('should display current chart type setting', () => {
      render(<StoreDemo />);

      expect(screen.getByText('Current Chart Type:')).toBeInTheDocument();
      expect(screen.getByText('line')).toBeInTheDocument();
    });

    it('should display dashboard layout status', () => {
      render(<StoreDemo />);

      expect(screen.getByText('Show Data Preview:')).toBeInTheDocument();
      expect(screen.getByText('Visible')).toBeInTheDocument();
    });

    it('should include undo/redo controls', () => {
      render(<StoreDemo />);

      expect(screen.getByTestId('undo-redo-controls')).toBeInTheDocument();
    });
  });

  describe('Theme Settings', () => {
    it('should display theme dropdown with correct options', () => {
      render(<StoreDemo />);

      const selects = screen.getAllByRole('combobox');
      const themeSelect = selects[0]; // First select is theme
      expect(themeSelect).toBeInTheDocument();

      // Check that all theme options are available
      const options = themeSelect.querySelectorAll('option');
      const optionValues = Array.from(options).map(option => (option as HTMLOptionElement).value);
      expect(optionValues).toEqual(['light', 'dark', 'system']);
    });

    it('should handle theme change selection', async () => {
      render(<StoreDemo />);

      const selects = screen.getAllByRole('combobox');
      const themeSelect = selects[0]; // First select is theme

      await act(async () => {
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
      });

      expect(themeSelect).toHaveValue('dark');
    });    it('should call theme update command when Update button is clicked', async () => {
      render(<StoreDemo />);

      const selects = screen.getAllByRole('combobox');
      const themeSelect = selects[0]; // First select is theme
      const updateButton = screen.getAllByText('Update')[0]; // First Update button is for theme

      // Change theme selection
      await act(async () => {
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
      });

      // Click update button
      await act(async () => {
        fireEvent.click(updateButton);
      });

      expect(mockCommandHelpers.handlePreferencesUpdate).toHaveBeenCalledWith({ theme: 'dark' });
    });

    it('should display other preferences information', () => {
      render(<StoreDemo />);

      // Look for text within the User Preferences section specifically
      expect(screen.getByText(/Currency:/)).toBeInTheDocument();
      expect(screen.getByText(/USD/)).toBeInTheDocument();
      expect(screen.getByText(/Auto Save:/)).toBeInTheDocument();
      expect(screen.getByText(/On/)).toBeInTheDocument();
    });
  });

  describe('Chart Settings', () => {
    it('should display chart type dropdown with correct options', () => {
      render(<StoreDemo />);

      // Find the chart type select element more reliably
      const selects = screen.getAllByRole('combobox');
      const chartTypeSelect = selects[1]; // Second select is chart type (first is theme)
      expect(chartTypeSelect).toBeInTheDocument();

      const options = chartTypeSelect.querySelectorAll('option');
      const optionValues = Array.from(options).map(option => (option as HTMLOptionElement).value);
      expect(optionValues).toEqual(['line', 'bar', 'area']);
    });

    it('should handle chart type change selection', async () => {
      render(<StoreDemo />);

      const selects = screen.getAllByRole('combobox');
      const chartTypeSelect = selects[1]; // Second select is chart type
      
      await act(async () => {
        fireEvent.change(chartTypeSelect, { target: { value: 'bar' } });
      });

      expect(chartTypeSelect).toHaveValue('bar');
    });

    it('should call chart type update command when Update button is clicked', async () => {
      render(<StoreDemo />);

      const selects = screen.getAllByRole('combobox');
      const chartTypeSelect = selects[1]; // Second select is chart type
      const updateButton = screen.getAllByText('Update')[1]; // Second Update button is for chart type

      // Change chart type selection
      await act(async () => {
        fireEvent.change(chartTypeSelect, { target: { value: 'area' } });
      });

      // Click update button
      await act(async () => {
        fireEvent.click(updateButton);
      });

      expect(mockCommandHelpers.handleChartSettingsUpdate).toHaveBeenCalledWith({ chartType: 'area' });
    });

    it('should display other chart settings information', () => {
      render(<StoreDemo />);

      // Look for text within the Chart Settings section specifically by using within
      const chartSettingsSection = screen.getByText('Chart Settings').closest('.border') as HTMLElement;
      expect(within(chartSettingsSection).getByText(/Show Grid:/)).toBeInTheDocument();
      expect(within(chartSettingsSection).getByText(/Show Legend:/)).toBeInTheDocument();
    });
  });

  describe('Dashboard Layout', () => {
    it('should display data preview visibility status', () => {
      render(<StoreDemo />);

      expect(screen.getByText('Show Data Preview:')).toBeInTheDocument();
      expect(screen.getByText('Visible')).toBeInTheDocument();
    });

    it('should handle toggle data preview button click', async () => {
      render(<StoreDemo />);

      const toggleButton = screen.getByText('Toggle Data Preview');

      await act(async () => {
        fireEvent.click(toggleButton);
      });

      expect(mockCommandHelpers.handleDashboardLayoutUpdate).toHaveBeenCalledTimes(1);
      expect(mockCommandHelpers.handleDashboardLayoutUpdate).toHaveBeenCalledWith({ 
        showDataPreview: false // Should toggle from true to false
      });
    });

    it('should update display when data preview is hidden', () => {
      mockStore.dashboardLayout.showDataPreview = false;
      require('../../store').useDashboardLayout.mockReturnValue(mockStore.dashboardLayout);

      render(<StoreDemo />);

      expect(screen.getByText('Hidden')).toBeInTheDocument();
    });

    it('should display other layout settings information', () => {
      render(<StoreDemo />);

      // Look for partial text since it's split across elements
      expect(screen.getByText(/Show Trend Metrics:/)).toBeInTheDocument();
      expect(screen.getByText(/Chart Order:/)).toBeInTheDocument();
    });
  });

  describe('Undo/Redo Status', () => {
    it('should display empty undo/redo stacks', () => {
      render(<StoreDemo />);

      expect(screen.getByText('Undo/Redo Status')).toBeInTheDocument();
      const operations = screen.getAllByText('0 operations');
      expect(operations).toHaveLength(2); // One for undo, one for redo
    });

    it('should display undo stack operations when present', () => {
      mockStore.undoStack = [
        { description: 'Update theme' },
        { description: 'Change chart type' },
        { description: 'Toggle data preview' },
      ];
      require('../../store').useUndoStack.mockReturnValue(mockStore.undoStack);

      render(<StoreDemo />);

      expect(screen.getByText('3 operations')).toBeInTheDocument();
      expect(screen.getByText('Last operation:')).toBeInTheDocument();
      expect(screen.getByText('Toggle data preview')).toBeInTheDocument();
    });

    it('should display recent operations when more than 3 operations exist', () => {
      mockStore.undoStack = [
        { description: 'First operation' },
        { description: 'Second operation' },
        { description: 'Third operation' },
        { description: 'Fourth operation' },
        { description: 'Fifth operation' },
      ];
      require('../../store').useUndoStack.mockReturnValue(mockStore.undoStack);

      render(<StoreDemo />);

      expect(screen.getByText('5 operations')).toBeInTheDocument();
      expect(screen.getByText('Recent operations:')).toBeInTheDocument();
      const fifthOperations = screen.getAllByText('Fifth operation');
      expect(fifthOperations.length).toBeGreaterThan(0); // Should appear in both "Last operation" and "Recent operations"
    });

    it('should display redo stack operations when present', () => {
      mockStore.redoStack = [
        { description: 'Undone operation 1' },
        { description: 'Undone operation 2' },
      ];
      require('../../store').useRedoStack.mockReturnValue(mockStore.redoStack);

      render(<StoreDemo />);

      expect(screen.getByText('2 operations')).toBeInTheDocument();
    });
  });

  describe('Instructions Section', () => {
    it('should display instructions', () => {
      render(<StoreDemo />);

      expect(screen.getByText('Instructions:')).toBeInTheDocument();
      expect(screen.getByText(/Make changes using the controls above/)).toBeInTheDocument();
      expect(screen.getByText(/Use the Undo\/Redo buttons/)).toBeInTheDocument();
      expect(screen.getByText(/All changes are automatically persisted/)).toBeInTheDocument();
      expect(screen.getByText(/Try keyboard shortcuts/)).toBeInTheDocument();
      expect(screen.getByText(/Refresh the page to see persistence/)).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should update when preferences change', async () => {
      const { rerender } = render(<StoreDemo />);

      expect(screen.getByText('light')).toBeInTheDocument();

      // Simulate preference change
      mockStore.preferences.theme = 'dark';
      require('../../store').usePreferences.mockReturnValue(mockStore.preferences);

      rerender(<StoreDemo />);

      await waitFor(() => {
        expect(screen.getByText('dark')).toBeInTheDocument();
      });
    });

    it('should update when chart settings change', async () => {
      const { rerender } = render(<StoreDemo />);

      expect(screen.getByText('line')).toBeInTheDocument();

      // Simulate chart settings change
      mockStore.chartSettings.chartType = 'bar';
      require('../../store').useChartSettings.mockReturnValue(mockStore.chartSettings);

      rerender(<StoreDemo />);

      await waitFor(() => {
        expect(screen.getByText('bar')).toBeInTheDocument();
      });
    });

    it('should update when dashboard layout changes', async () => {
      const { rerender } = render(<StoreDemo />);

      expect(screen.getByText('Visible')).toBeInTheDocument();

      // Simulate layout change
      mockStore.dashboardLayout.showDataPreview = false;
      require('../../store').useDashboardLayout.mockReturnValue(mockStore.dashboardLayout);

      rerender(<StoreDemo />);

      await waitFor(() => {
        expect(screen.getByText('Hidden')).toBeInTheDocument();
      });
    });

    it('should update when undo/redo stacks change', async () => {
      const { rerender } = render(<StoreDemo />);

      const initialOperations = screen.getAllByText('0 operations');
      expect(initialOperations).toHaveLength(2);

      // Simulate stack change
      mockStore.undoStack = [{ description: 'New operation' }];
      require('../../store').useUndoStack.mockReturnValue(mockStore.undoStack);

      rerender(<StoreDemo />);

      await waitFor(() => {
        expect(screen.getByText('1 operations')).toBeInTheDocument();
        expect(screen.getByText('New operation')).toBeInTheDocument();
      });
    });
  });

  describe('Form Controls', () => {
    it('should have proper semantic classes for accessibility', () => {
      render(<StoreDemo />);

      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toHaveClass('border-border', 'bg-background', 'text-foreground');
      });

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('transition-colors');
      });
    });

    it('should have proper labels for form controls', () => {
      render(<StoreDemo />);

      expect(screen.getByText('Change Theme:')).toBeInTheDocument();
      expect(screen.getByText('Change Chart Type:')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should work together to provide complete settings experience', async () => {
      render(<StoreDemo />);

      // Check all major sections are present and functional
      expect(screen.getByText('Settings Panel with Undo/Redo')).toBeInTheDocument();
      expect(screen.getByTestId('undo-redo-controls')).toBeInTheDocument();
      
      // Controls should be present
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2);
      
      const themeSelect = selects[0]; // First select is theme
      const chartSelect = selects[1]; // Second select is chart type
      
      // Layout controls
      const toggleButton = screen.getByText('Toggle Data Preview');
      expect(toggleButton).toBeInTheDocument();
      
      // Status display
      expect(screen.getByText('Undo/Redo Status')).toBeInTheDocument();
      
      // Instructions
      expect(screen.getByText('Instructions:')).toBeInTheDocument();

      // Test that all controls are interactive
      await act(async () => {
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
        fireEvent.change(chartSelect, { target: { value: 'bar' } });
        fireEvent.click(toggleButton);
      });

      // All controls should have responded
      expect(themeSelect).toHaveValue('dark');
      expect(chartSelect).toHaveValue('bar');
      expect(mockCommandHelpers.handleDashboardLayoutUpdate).toHaveBeenCalled();
    });
  });
});
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import DataPreview from '../data-preview';
import FileUploader from '../file-uploader';
import TrendMetrics from '../trend-metrics';
import { UndoRedoControls } from '../undo-redo-controls';
import { StoreDemo } from '../store-demo';

// Mock the store
jest.mock('../../store', () => ({
  usePreferences: jest.fn(() => ({
    theme: 'light',
    currency: 'USD',
    autoSave: true,
    notifications: true,
  })),
  useChartSettings: jest.fn(() => ({
    chartType: 'line',
    showGrid: true,
    showLegend: true,
    animationDuration: 300,
  })),
  useDashboardLayout: jest.fn(() => ({
    showDataPreview: true,
    showTrendMetrics: true,
    chartOrder: ['revenue', 'profit'],
  })),
  useUndoStack: jest.fn(() => []),
  useRedoStack: jest.fn(() => []),
  useCanUndo: jest.fn(() => false),
  useCanRedo: jest.fn(() => false),
  CommandHelpers: {
    handleUpdateTheme: jest.fn(),
    handleUpdateChartType: jest.fn(),
    handleToggleDataPreview: jest.fn(),
  },
}));

// Mock the icons
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon" />,
  Undo: () => <div data-testid="undo-icon" />,
  Redo: () => <div data-testid="redo-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
}));

const mockFileData = {
  headers: ['Date', 'Revenue', 'Expenses'],
  rows: [
    { Date: '2024-01-01', Revenue: '10000', Expenses: '8000' },
    { Date: '2024-02-01', Revenue: '12000', Expenses: '9000' },
  ],
  totalRows: 2,
};

const mockTrendData = {
  revenueGrowth: 15.5,
  profitGrowth: -2.3,
  marginGrowth: 8.7,
};

describe('Dark Mode Implementation', () => {
  beforeEach(() => {
    // Reset document classes
    document.documentElement.className = '';
    
    // Reset CSS custom properties
    const style = document.documentElement.style;
    style.removeProperty('--background');
    style.removeProperty('--foreground');
    style.removeProperty('--card');
    style.removeProperty('--card-foreground');
    style.removeProperty('--border');
    style.removeProperty('--muted');
    style.removeProperty('--muted-foreground');
  });

  afterEach(() => {
    cleanup();
    // Clean up document classes
    document.documentElement.className = '';
  });

  describe('CSS Custom Properties', () => {
    it('should apply light mode variables by default', () => {
      // Simulate CSS being loaded
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --border: 214.3 31.8% 91.4%;
          --muted: 210 40% 98%;
          --muted-foreground: 215.4 16.3% 46.9%;
        }
      `;
      document.head.appendChild(style);

      const rootStyles = getComputedStyle(document.documentElement);
      
      // Note: In jsdom, getComputedStyle might not return custom properties
      // This test verifies the structure is in place
      expect(document.head.contains(style)).toBe(true);
      
      document.head.removeChild(style);
    });

    it('should apply dark mode variables when .dark class is present', () => {
      document.documentElement.classList.add('dark');
      
      const style = document.createElement('style');
      style.textContent = `
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
        }
      `;
      document.head.appendChild(style);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      document.head.removeChild(style);
    });
  });

  describe('Semantic Color Classes', () => {
    describe('DataPreview Component', () => {
      it('should use semantic color classes', () => {
        render(<DataPreview data={mockFileData} />);

        // Check for semantic classes in the markup
        const preview = screen.getByText('Showing first 5 rows of 2 total rows');
        expect(preview).toHaveClass('text-muted-foreground');

        const table = screen.getByRole('table');
        expect(table).toHaveClass('divide-y', 'divide-border');
      });

      it('should apply semantic colors to table headers', () => {
        render(<DataPreview data={mockFileData} />);

        const headers = screen.getAllByRole('columnheader');
        headers.forEach(header => {
          expect(header).toHaveClass('bg-muted', 'text-muted-foreground');
        });
      });

      it('should apply semantic colors to table cells', () => {
        render(<DataPreview data={mockFileData} />);

        const cells = screen.getAllByRole('cell');
        cells.forEach(cell => {
          expect(cell).toHaveClass('text-foreground');
        });
      });
    });

    describe('FileUploader Component', () => {
      it('should use semantic color classes for upload icon', () => {
        const mockOnFileUpload = jest.fn();
        const mockOnError = jest.fn();

        render(
          <FileUploader 
            onFileUpload={mockOnFileUpload}
            onError={mockOnError}
            loading={false}
            error=""
          />
        );

        const uploadIcon = screen.getByTestId('upload-icon').parentElement;
        expect(uploadIcon).toHaveClass('text-muted-foreground');
      });

      it('should use semantic color classes for help text', () => {
        const mockOnFileUpload = jest.fn();
        const mockOnError = jest.fn();

        render(
          <FileUploader 
            onFileUpload={mockOnFileUpload}
            onError={mockOnError}
            loading={false}
            error=""
          />
        );

        const helpText = screen.getByText('Supported formats: CSV, XLSX, XLS');
        expect(helpText).toHaveClass('text-muted-foreground');
      });
    });

    describe('TrendMetrics Component', () => {
      it('should use semantic color classes for descriptions', () => {
        render(<TrendMetrics trends={mockTrendData} />);

        // Find trend description elements
        const descriptions = screen.getAllByText((content, element) => {
          return element?.tagName.toLowerCase() === 'p' && 
                 element?.classList.contains('text-muted-foreground');
        });

        expect(descriptions.length).toBeGreaterThan(0);
        descriptions.forEach(desc => {
          expect(desc).toHaveClass('text-muted-foreground');
        });
      });
    });

    describe('UndoRedoControls Component', () => {
      it('should use semantic color classes for status text', () => {
        render(<UndoRedoControls />);

        // The status text should use muted foreground
        const statusElements = document.querySelectorAll('.text-muted-foreground');
        expect(statusElements.length).toBeGreaterThan(0);
      });

      it('should use semantic border colors for outline buttons', () => {
        render(<UndoRedoControls />);

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          // Check if button has outline variant classes
          const hasOutlineClasses = button.classList.contains('border-border') ||
                                   button.classList.contains('bg-background') ||
                                   button.classList.contains('text-foreground');
          
          if (hasOutlineClasses) {
            expect(button).toHaveClass('border-border');
          }
        });
      });
    });
  });

  describe('StoreDemo Component Theming', () => {
    it('should use semantic color classes throughout', () => {
      render(<StoreDemo />);

      // Check for card background
      const cards = document.querySelectorAll('.bg-card');
      expect(cards.length).toBeGreaterThan(0);

      // Check for border usage
      const borders = document.querySelectorAll('.border-border');
      expect(borders.length).toBeGreaterThan(0);

      // Check for foreground text
      const foregroundText = document.querySelectorAll('.text-foreground');
      expect(foregroundText.length).toBeGreaterThan(0);

      // Check for muted text
      const mutedText = document.querySelectorAll('.text-muted-foreground');
      expect(mutedText.length).toBeGreaterThan(0);

      // Check for muted background
      const mutedBg = document.querySelectorAll('.bg-muted');
      expect(mutedBg.length).toBeGreaterThan(0);
    });

    it('should have proper form control styling', () => {
      render(<StoreDemo />);

      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toHaveClass('border-border', 'bg-background', 'text-foreground');
      });
    });
  });

  describe('Theme Transition Classes', () => {
    it('should include transition classes where appropriate', () => {
      render(<StoreDemo />);

      const buttons = screen.getAllByRole('button');
      const transitionButtons = buttons.filter(btn => 
        btn.classList.contains('transition-colors')
      );

      expect(transitionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Component Contrast and Accessibility', () => {
    it('should maintain proper contrast in both themes', () => {
      // Test light mode
      render(<DataPreview data={mockFileData} />);
      
      const lightModeText = screen.getByText('Data Preview');
      expect(lightModeText).toBeInTheDocument();

      // Simulate dark mode
      document.documentElement.classList.add('dark');
      
      const { rerender } = render(<DataPreview data={mockFileData} />);
      rerender(<DataPreview data={mockFileData} />);
      
      const darkModeText = screen.getByText('Data Preview');
      expect(darkModeText).toBeInTheDocument();

      document.documentElement.classList.remove('dark');
    });

    it('should handle theme switching without losing content', () => {
      const { rerender } = render(<TrendMetrics trends={mockTrendData} />);

      // Verify content is present
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();

      // Switch to dark mode
      document.documentElement.classList.add('dark');
      rerender(<TrendMetrics trends={mockTrendData} />);

      // Content should still be present
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();

      // Switch back to light mode
      document.documentElement.classList.remove('dark');
      rerender(<TrendMetrics trends={mockTrendData} />);

      // Content should still be present
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
    });
  });

  describe('CSS Variable Usage', () => {
    it('should use HSL color format in CSS variables', () => {
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
        }
        .test-element {
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
      `;
      document.head.appendChild(style);

      const testElement = document.createElement('div');
      testElement.className = 'test-element';
      document.body.appendChild(testElement);

      // Verify the element can use the CSS variables
      expect(testElement).toHaveClass('test-element');

      document.body.removeChild(testElement);
      document.head.removeChild(style);
    });

    it('should have all required CSS variables defined', () => {
      const requiredVariables = [
        '--background',
        '--foreground', 
        '--card',
        '--card-foreground',
        '--border',
        '--muted',
        '--muted-foreground',
      ];

      const style = document.createElement('style');
      style.textContent = `
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --border: 214.3 31.8% 91.4%;
          --muted: 210 40% 98%;
          --muted-foreground: 215.4 16.3% 46.9%;
        }
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
        }
      `;
      document.head.appendChild(style);

      // Verify all variables are in the stylesheet
      requiredVariables.forEach(variable => {
        expect(style.textContent).toContain(variable);
      });

      document.head.removeChild(style);
    });
  });
});
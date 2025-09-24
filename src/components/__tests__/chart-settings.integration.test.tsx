import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import RevenueChart from '../revenue-chart';
import ProfitChart from '../profit-chart';
import { ChartDataPoint } from '../../types';

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  AreaChart: ({ children, data }: any) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" data-props={JSON.stringify(props)} />,
  Bar: (props: any) => <div data-testid="bar" data-props={JSON.stringify(props)} />,
  Area: (props: any) => <div data-testid="area" data-props={JSON.stringify(props)} />,
  XAxis: (props: any) => <div data-testid="x-axis" data-props={JSON.stringify(props)} />,
  YAxis: (props: any) => <div data-testid="y-axis" data-props={JSON.stringify(props)} />,
  CartesianGrid: (props: any) => <div data-testid="grid" data-props={JSON.stringify(props)} />,
  Tooltip: (props: any) => <div data-testid="tooltip" data-props={JSON.stringify(props)} />,
  Legend: (props: any) => <div data-testid="legend" data-props={JSON.stringify(props)} />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock the store
jest.mock('../../store', () => {
  const mockChartSettings = {
    chartType: 'line' as 'line' | 'bar' | 'area',
    showGrid: true,
    showLegend: true,
    animationDuration: 300,
  };

  const mockPreferences = {
    theme: 'light' as 'light' | 'dark',
    autoSave: true,
    showNotifications: true,
  };

  return {
    useChartSettings: jest.fn(() => mockChartSettings),
    usePreferences: jest.fn(() => mockPreferences),
    mockChartSettings, // Export for test access
    mockPreferences, // Export for test access
  };
});

const mockData: ChartDataPoint[] = [
  {
    Date: '2024-01-01',
    Revenue: 10000,
    Expenses: 8000,
    profitMargin: 20,
  },
  {
    Date: '2024-02-01',
    Revenue: 12000,
    Expenses: 9000,
    profitMargin: 25,
  },
  {
    Date: '2024-03-01',
    Revenue: 11000,
    Expenses: 8500,
    profitMargin: 22.7,
  },
];

describe('Chart Settings Integration', () => {
  let mockChartSettings: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChartSettings = require('../../store').mockChartSettings;
    
    // Reset to default settings
    mockChartSettings.chartType = 'line';
    mockChartSettings.showGrid = true;
    mockChartSettings.showLegend = true;
    mockChartSettings.animationDuration = 300;
    
    require('../../store').useChartSettings.mockReturnValue(mockChartSettings);
  });

  describe('Revenue Chart Settings', () => {
    it('should render line chart by default', () => {
      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });

    it('should render bar chart when chartType is bar', () => {
      mockChartSettings.chartType = 'bar';
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });

    it('should render area chart when chartType is area', () => {
      mockChartSettings.chartType = 'area';
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('should show grid when showGrid is true', () => {
      mockChartSettings.showGrid = true;
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });

    it('should hide grid when showGrid is false', () => {
      mockChartSettings.showGrid = false;
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<RevenueChart data={mockData} />);

      expect(screen.queryByTestId('grid')).not.toBeInTheDocument();
    });

    it('should show legend when showLegend is true', () => {
      mockChartSettings.showLegend = true;
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('should hide legend when showLegend is false', () => {
      mockChartSettings.showLegend = false;
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<RevenueChart data={mockData} />);

      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });

    it('should pass correct data to chart component', () => {
      render(<RevenueChart data={mockData} />);

      const chart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
      
      expect(chartData).toHaveLength(3);
      expect(chartData[0]).toEqual(expect.objectContaining({
        Date: '2024-01-01',
        Revenue: 10000,
        Expenses: 8000,
      }));
    });

    it('should sort data by date', () => {
      const unsortedData = [
        mockData[2], // March
        mockData[0], // January  
        mockData[1], // February
      ];

      render(<RevenueChart data={unsortedData} />);

      const chart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
      
      expect(chartData[0].Date).toBe('2024-01-01');
      expect(chartData[1].Date).toBe('2024-02-01');
      expect(chartData[2].Date).toBe('2024-03-01');
    });

    it('should handle null data gracefully', () => {
      render(<RevenueChart data={null} />);

      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });
  });

  describe('Profit Chart Settings', () => {
    it('should render line chart by default', () => {
      render(<ProfitChart data={mockData} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });

    it('should render bar chart when chartType is bar', () => {
      mockChartSettings.chartType = 'bar';
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<ProfitChart data={mockData} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });

    it('should render area chart when chartType is area', () => {
      mockChartSettings.chartType = 'area';
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<ProfitChart data={mockData} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    it('should configure profit margin data correctly for bar chart', () => {
      mockChartSettings.chartType = 'bar';
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<ProfitChart data={mockData} />);

      const barElement = screen.getByTestId('bar');
      const barProps = JSON.parse(barElement.getAttribute('data-props') || '{}');
      
      expect(barProps.dataKey).toBe('profitMargin');
      expect(barProps.name).toBe('Profit Margin');
      expect(barProps.fill).toBe('#22c55e');
    });

    it('should configure profit margin data correctly for line chart', () => {
      mockChartSettings.chartType = 'line';
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<ProfitChart data={mockData} />);

      const lineElement = screen.getByTestId('line');
      const lineProps = JSON.parse(lineElement.getAttribute('data-props') || '{}');
      
      expect(lineProps.dataKey).toBe('profitMargin');
      expect(lineProps.name).toBe('Profit Margin');
      expect(lineProps.stroke).toBe('#22c55e');
      expect(lineProps.strokeWidth).toBe(2);
    });

    it('should configure profit margin data correctly for area chart', () => {
      mockChartSettings.chartType = 'area';
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      render(<ProfitChart data={mockData} />);

      const areaElement = screen.getByTestId('area');
      const areaProps = JSON.parse(areaElement.getAttribute('data-props') || '{}');
      
      expect(areaProps.dataKey).toBe('profitMargin');
      expect(areaProps.name).toBe('Profit Margin');
      expect(areaProps.stroke).toBe('#22c55e');
      expect(areaProps.fill).toBe('#22c55e');
    });

    it('should handle null data gracefully', () => {
      render(<ProfitChart data={null} />);

      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });
  });

  describe('Chart Settings Changes', () => {
    it('should re-render when chart settings change', async () => {
      const { rerender } = render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      // Change chart type
      mockChartSettings.chartType = 'bar';
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      rerender(<RevenueChart data={mockData} />);

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
      });
    });

    it('should toggle grid visibility when showGrid changes', async () => {
      const { rerender } = render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId('grid')).toBeInTheDocument();

      // Hide grid
      mockChartSettings.showGrid = false;
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      rerender(<RevenueChart data={mockData} />);

      await waitFor(() => {
        expect(screen.queryByTestId('grid')).not.toBeInTheDocument();
      });
    });

    it('should toggle legend visibility when showLegend changes', async () => {
      const { rerender } = render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();

      // Hide legend
      mockChartSettings.showLegend = false;
      require('../../store').useChartSettings.mockReturnValue(mockChartSettings);

      rerender(<RevenueChart data={mockData} />);

      await waitFor(() => {
        expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
      });
    });
  });

  describe('Chart Accessibility', () => {
    it('should have proper test ids for charts', () => {
      render(<RevenueChart data={mockData} />);
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();

      render(<ProfitChart data={mockData} />);
      expect(screen.getByTestId('profit-chart')).toBeInTheDocument();
    });

    it('should have proper card structure', () => {
      render(<RevenueChart data={mockData} />);
      
      expect(screen.getByText('Revenue vs Expenses Trend')).toBeInTheDocument();
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    });
  });
});
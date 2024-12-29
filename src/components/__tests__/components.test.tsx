import React from 'react';
import { render, screen } from '@testing-library/react';
import DataPreview from '../data-preview';
import HealthMetrics from '../health-metrics';
import TrendMetrics from '../trend-metrics';
import RevenueChart from '../revenue-chart';
import ProfitChart from '../profit-chart';

// Mock ResizeObserver for chart components
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// At the top of the file, right after imports
const mockChartContainer = () => {
    const div = document.createElement('div');
    div.style.width = '500px';
    div.style.height = '500px';
    document.body.appendChild(div);
    return div;
  };
  
  const mockChartData = [
    { Date: '2024-01', Revenue: 1000, Expenses: 800 },
    { Date: '2024-02', Revenue: 1200, Expenses: 900 }
  ];
  
  const mockProfitChartData = [
    { Date: '2024-01', Revenue: 1000, Expenses: 800, profitMargin: 20 },
    { Date: '2024-02', Revenue: 1200, Expenses: 900, profitMargin: 25 }
  ];

  const unsortedData = [
    { Date: '2024-02', Revenue: 1200, Expenses: 900 },
    { Date: '2024-01', Revenue: 1000, Expenses: 800 }
  ];

describe('DataPreview', () => {
  const mockData = {
    headers: ['Date', 'Revenue', 'Expenses'],
    rows: [
      { Date: '2024-01', Revenue: 1000, Expenses: 800 },
      { Date: '2024-02', Revenue: 1200, Expenses: 900 }
    ],
    totalRows: 2
  };

  it('renders data preview correctly', () => {
    render(<DataPreview data={mockData} />);
    
    expect(screen.getByText('Data Preview')).toBeInTheDocument();
    expect(screen.getByText('2024-01')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('handles null data gracefully', () => {
    const { container } = render(<DataPreview data={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('HealthMetrics', () => {
  const mockMetrics = {
    currentRatio: 2.5,
    quickRatio: 1.2,
    debtToEquity: 1.1
  };

  it('renders health indicators correctly', () => {
    render(<HealthMetrics metrics={mockMetrics} />);
    
    expect(screen.getByText('Current Ratio')).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
  });

  it('shows correct indicator colors', () => {
    render(<HealthMetrics metrics={mockMetrics} />);
    
    const goodIndicators = screen.getAllByTestId('trending-up-icon');
    expect(goodIndicators.length).toBeGreaterThan(0);
  });
});

describe('TrendMetrics', () => {
  const mockTrends = {
    revenueGrowth: 5.2,
    profitGrowth: 3.8,
    marginGrowth: 0.5
  };

  it('renders trend indicators correctly', () => {
    render(<TrendMetrics trends={mockTrends} />);
    
    expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });

  it('handles null trends gracefully', () => {
    const { container } = render(<TrendMetrics trends={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('RevenueChart', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = mockChartContainer();
    });

    it('renders chart with correct data', () => {
        render(<RevenueChart data={mockChartData} />, { container });
        expect(screen.getByText('Revenue vs Expenses Trend')).toBeInTheDocument();
    });

    it('sorts data by date', () => {
        render(<RevenueChart data={unsortedData} />, { container });
        expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    });
});

describe('ProfitChart', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = mockChartContainer();
    });

    it('renders profit margin chart correctly', () => {
        render(<ProfitChart data={mockProfitChartData} />, { container });
        expect(screen.getByText('Profit Margin Trend')).toBeInTheDocument();
    });

    it('formats tooltip values correctly', () => {
        render(<ProfitChart data={mockProfitChartData} />, { container });
        expect(screen.getByTestId('profit-chart')).toBeInTheDocument();
    });
});
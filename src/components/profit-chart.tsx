import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { ChartDataPoint } from '../types';
import { useChartSettings } from '../store';

interface ProfitChartProps {
  data: ChartDataPoint[] | null;
}

const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
  const chartSettings = useChartSettings();
  
  if (!data) return null;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const tooltipProps = {
      formatter: (value: number) => [value.toFixed(1) + '%']
    };

    switch (chartSettings.chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="Date" />
            <YAxis unit="%" />
            <Tooltip {...tooltipProps} />
            {chartSettings.showLegend && <Legend />}
            <Bar dataKey="profitMargin" name="Profit Margin" fill="#22c55e" />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="Date" />
            <YAxis unit="%" />
            <Tooltip {...tooltipProps} />
            {chartSettings.showLegend && <Legend />}
            <Area type="monotone" dataKey="profitMargin" name="Profit Margin" stroke="#22c55e" fill="#22c55e" />
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="Date" />
            <YAxis unit="%" />
            <Tooltip {...tooltipProps} />
            {chartSettings.showLegend && <Legend />}
            <Line type="monotone" dataKey="profitMargin" name="Profit Margin" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Margin Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96" data-testid="profit-chart">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitChart;
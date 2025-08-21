import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { ChartDataPoint } from '../types';
import { useChartSettings } from '../store';

interface RevenueChartProps {
  data: ChartDataPoint[] | null;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartSettings = useChartSettings();
  
  if (!data) return null;

  const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

  const renderChart = () => {
    const commonProps = {
      data: sortedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const xAxisProps = {
      dataKey: "Date",
      tickFormatter: (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    };

    const tooltipProps = {
      formatter: (value: number) => ['$' + value.toLocaleString(undefined, { maximumFractionDigits: 2 })],
      labelFormatter: (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    switch (chartSettings.chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis {...xAxisProps} />
            <YAxis />
            <Tooltip {...tooltipProps} />
            {chartSettings.showLegend && <Legend />}
            <Bar dataKey="Revenue" fill="#4f46e5" name="Revenue" />
            <Bar dataKey="Expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis {...xAxisProps} />
            <YAxis />
            <Tooltip {...tooltipProps} />
            {chartSettings.showLegend && <Legend />}
            <Area type="monotone" dataKey="Revenue" stackId="1" stroke="#4f46e5" fill="#4f46e5" name="Revenue" />
            <Area type="monotone" dataKey="Expenses" stackId="1" stroke="#ef4444" fill="#ef4444" name="Expenses" />
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis {...xAxisProps} />
            <YAxis />
            <Tooltip {...tooltipProps} />
            {chartSettings.showLegend && <Legend />}
            <Line type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Expenses Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96" data-testid="revenue-chart">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
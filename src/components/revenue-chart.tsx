import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { ChartDataPoint } from '../types';
import { useChartSettings, usePreferences } from '../store';

interface RevenueChartProps {
  data: ChartDataPoint[] | null;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartSettings = useChartSettings();
  const preferences = usePreferences();
  
  if (!data) return null;

  const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

  // Theme-aware colors
  const isDark = preferences.theme === 'dark';
  const revenueColor = isDark ? '#60a5fa' : '#4f46e5'; // blue-400 : blue-600
  const expensesColor = isDark ? '#f87171' : '#ef4444'; // red-400 : red-500
  const gridColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 : gray-200
  const textColor = isDark ? '#d1d5db' : '#374151'; // gray-300 : gray-700

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
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis {...xAxisProps} tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip {...tooltipProps} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }} />
            {chartSettings.showLegend && <Legend />}
            <Bar dataKey="Revenue" fill={revenueColor} name="Revenue" />
            <Bar dataKey="Expenses" fill={expensesColor} name="Expenses" />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis {...xAxisProps} tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip {...tooltipProps} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }} />
            {chartSettings.showLegend && <Legend />}
            <Area type="monotone" dataKey="Revenue" stackId="1" stroke={revenueColor} fill={revenueColor} name="Revenue" />
            <Area type="monotone" dataKey="Expenses" stackId="1" stroke={expensesColor} fill={expensesColor} name="Expenses" />
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis {...xAxisProps} tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip {...tooltipProps} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }} />
            {chartSettings.showLegend && <Legend />}
            <Line type="monotone" dataKey="Revenue" stroke={revenueColor} strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="Expenses" stroke={expensesColor} strokeWidth={2} name="Expenses" />
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
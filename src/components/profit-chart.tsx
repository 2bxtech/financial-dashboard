import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { ChartDataPoint } from '../types';
import { useChartSettings, usePreferences } from '../store';

interface ProfitChartProps {
  data: ChartDataPoint[] | null;
}

const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
  const chartSettings = useChartSettings();
  const preferences = usePreferences();
  
  if (!data) return null;

  // Theme-aware colors
  const isDark = preferences.theme === 'dark';
  const profitColor = isDark ? '#4ade80' : '#22c55e'; // green-400 : green-500
  const gridColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 : gray-200
  const textColor = isDark ? '#d1d5db' : '#374151'; // gray-300 : gray-700

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
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey="Date" tick={{ fill: textColor }} />
            <YAxis unit="%" tick={{ fill: textColor }} />
            <Tooltip {...tooltipProps} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }} />
            {chartSettings.showLegend && <Legend />}
            <Bar dataKey="profitMargin" name="Profit Margin" fill={profitColor} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey="Date" tick={{ fill: textColor }} />
            <YAxis unit="%" tick={{ fill: textColor }} />
            <Tooltip {...tooltipProps} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }} />
            {chartSettings.showLegend && <Legend />}
            <Area type="monotone" dataKey="profitMargin" name="Profit Margin" stroke={profitColor} fill={profitColor} />
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
            <XAxis dataKey="Date" tick={{ fill: textColor }} />
            <YAxis unit="%" tick={{ fill: textColor }} />
            <Tooltip {...tooltipProps} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }} />
            {chartSettings.showLegend && <Legend />}
            <Line type="monotone" dataKey="profitMargin" name="Profit Margin" stroke={profitColor} strokeWidth={2} />
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
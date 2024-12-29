import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface ProfitChartProps {
  data: ChartDataPoint[] | null;
}

const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Margin Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96" data-testid="profit-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" />
              <YAxis unit="%" />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(1) + '%']}
              />
              <Legend />
              <Line type="monotone" dataKey="profitMargin" name="Profit Margin" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitChart;
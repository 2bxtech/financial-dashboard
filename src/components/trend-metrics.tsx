import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendMetricsData, IndicatorProps } from '../types';

const TrendIndicator: React.FC<IndicatorProps> = ({ 
  value, 
  threshold, 
  title, 
  description, 
  format = 'percentage' 
}) => {
  const isGood = value >= threshold;
  const formattedValue = format === 'ratio' 
    ? value.toFixed(2)
    : format === 'percentage'
      ? value.toFixed(1) + '%'
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {isGood ? (
            <TrendingUp className="h-5 w-5 text-green-500" data-testid="trending-up-icon" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" data-testid="trending-down-icon" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formattedValue}
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

interface TrendMetricsProps {
  trends: TrendMetricsData | null;
}

const TrendMetrics: React.FC<TrendMetricsProps> = ({ trends }) => {
  if (!trends) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TrendIndicator
        value={trends.revenueGrowth}
        threshold={0}
        title="Revenue Growth"
        description="Month-over-month revenue change"
      />
      <TrendIndicator
        value={trends.profitGrowth}
        threshold={0}
        title="Profit Growth"
        description="Month-over-month profit change"
      />
      <TrendIndicator
        value={trends.marginGrowth}
        threshold={0}
        title="Margin Growth"
        description="Profit margin trend"
      />
    </div>
  );
};

export default TrendMetrics;
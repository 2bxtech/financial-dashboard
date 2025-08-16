import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { HealthMetricsData, IndicatorProps } from '../types';

const HealthIndicator: React.FC<IndicatorProps> = ({ 
  value, 
  threshold, 
  title, 
  description, 
  format = 'number' 
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

interface HealthMetricsProps {
  metrics: HealthMetricsData | null;
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <HealthIndicator
        value={metrics.currentRatio}
        threshold={2}
        title="Current Ratio"
        description="Ability to pay short-term obligations"
        format="ratio"
      />
      <HealthIndicator
        value={metrics.quickRatio}
        threshold={1}
        title="Quick Ratio"
        description="Immediate ability to pay debt"
        format="ratio"
      />
      <HealthIndicator
        value={metrics.debtToEquity}
        threshold={1.5}
        title="Debt to Equity"
        description="Financial leverage and risk"
        format="ratio"
      />
    </div>
  );
};

export default HealthMetrics;
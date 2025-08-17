/**
 * Enhanced Loading Component with Progress and Circuit Breaker Status
 */

import React from 'react';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { CircuitState } from '../utils/circuit-breaker';

interface LoadingStateProps {
  loading: boolean;
  progress?: number;
  message?: string;
  circuitBreakerState?: {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
    state: CircuitState;
  };
  showCircuitStatus?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  loading, 
  progress, 
  message = 'Processing file...', 
  circuitBreakerState,
  showCircuitStatus = false
}) => {
  if (!loading) return null;

  const getCircuitStatusIcon = () => {
    if (!circuitBreakerState) return null;
    switch (circuitBreakerState.state) {
      case CircuitState.CLOSED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case CircuitState.HALF_OPEN:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case CircuitState.OPEN:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getCircuitStatusText = () => {
    if (!circuitBreakerState) return '';
    switch (circuitBreakerState.state) {
      case CircuitState.CLOSED:
        return 'Service operational';
      case CircuitState.HALF_OPEN:
        return 'Service recovering';
      case CircuitState.OPEN:
        return 'Service unavailable';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            {progress !== undefined && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="text-xs text-gray-500">{Math.round(progress)}%</div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{message}</p>
            
            {progress !== undefined && (
              <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            
            {showCircuitStatus && circuitBreakerState && (
              <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-600">
                {getCircuitStatusIcon()}
                <span>{getCircuitStatusText()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
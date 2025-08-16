/**
 * Enhanced Error Display Component
 * Provides user-friendly error messages with recovery suggestions
 */

import React from 'react';
import { AlertTriangle, RefreshCw, X, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AppError, ErrorType, ErrorSeverity } from '../utils/error-handling';

interface ErrorDisplayProps {
  error: AppError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false 
}) => {
  if (!error) return null;

  const appError = typeof error === 'string' 
    ? new AppError(error, ErrorType.UNKNOWN_ERROR)
    : error;

  const getVariant = () => {
    switch (appError.severity) {
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      case ErrorSeverity.HIGH:
        return 'destructive';
      case ErrorSeverity.MEDIUM:
        return 'default';
      case ErrorSeverity.LOW:
        return 'default';
      default:
        return 'default';
    }
  };

  const getIcon = () => {
    switch (appError.type) {
      case ErrorType.CIRCUIT_BREAKER_ERROR:
        return <Clock className="h-4 w-4" />;
      case ErrorType.NETWORK_ERROR:
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRecoveryAction = () => {
    switch (appError.type) {
      case ErrorType.CIRCUIT_BREAKER_ERROR:
        return 'Please wait a moment and try again.';
      case ErrorType.VALIDATION_ERROR:
        return 'Please check your file format and ensure it contains the required columns (Date, Revenue, Expenses).';
      case ErrorType.FILE_PROCESSING_ERROR:
        return 'Try using a different file or check if the file is corrupted.';
      case ErrorType.PARSE_ERROR:
        return 'Ensure your file is properly formatted and not corrupted.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  };

  return (
    <Alert variant={getVariant()} className="mt-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          {getIcon()}
          <div className="flex-1">
            <AlertTitle className="flex items-center justify-between">
              {appError.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              {onDismiss && (
                <button 
                  onClick={onDismiss}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <p>{appError.userMessage}</p>
                <p className="text-sm text-gray-600">{getRecoveryAction()}</p>
                
                {appError.recoverable && onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </button>
                )}
                
                {showDetails && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      Show technical details
                    </summary>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                      <p><strong>Type:</strong> {appError.type}</p>
                      <p><strong>Severity:</strong> {appError.severity}</p>
                      <p><strong>Timestamp:</strong> {new Date(appError.context.timestamp).toLocaleString()}</p>
                      {appError.context.fileInfo && (
                        <>
                          <p><strong>File:</strong> {appError.context.fileInfo.name}</p>
                          <p><strong>Size:</strong> {(appError.context.fileInfo.size / 1024).toFixed(1)} KB</p>
                        </>
                      )}
                      <p><strong>Message:</strong> {appError.message}</p>
                    </div>
                  </details>
                )}
              </div>
            </AlertDescription>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default ErrorDisplay;
/**
 * Export History Dialog
 * Simple display of export history
 */

import React from 'react';
import { useExport } from '../store/store';
import { X, Download, FileText, File, FileImage } from 'lucide-react';

interface ExportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportHistoryDialog: React.FC<ExportHistoryDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { exportHistory, clearExportHistory } = useExport();

  if (!open) return null;

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'png':
      case 'svg':
        return <FileImage className="h-4 w-4" />;
      case 'csv':
      case 'xlsx':
        return <File className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Export History</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {exportHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No export history yet
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {exportHistory.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded border ${
                    item.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getFormatIcon(item.format)}
                    <div>
                      <div className="font-medium">{item.filename}</div>
                      <div className="text-sm text-gray-500">
                        {item.timestamp.toLocaleString()}
                        {item.size && ` • ${Math.round(item.size / 1024)}KB`}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    item.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.success ? 'Success' : 'Failed'}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {exportHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={clearExportHistory}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Clear History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
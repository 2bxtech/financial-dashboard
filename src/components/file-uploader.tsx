import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { validateFile } from '../utils/validation-utils';

export interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onError: (error: string) => void;
  loading: boolean;
  error: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, onError, loading, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = 'dataTransfer' in e 
      ? e.dataTransfer?.files[0]
      : e.target?.files?.[0];
      
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      onError(validation.error || 'Invalid file');
      return;
    }

    onFileUpload(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Financial Data</CardTitle>
      </CardHeader>
      <CardContent>
        <label
          className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleDrop}
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">Drag and drop a CSV or Excel file, or click to browse</p>
          <p className="text-sm text-gray-500 mt-1">Supported formats: CSV, XLSX, XLS</p>
        </label>

        {loading && (
          <div className="mt-4 text-center" role="status" aria-live="polite">
            Processing file...
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploader;
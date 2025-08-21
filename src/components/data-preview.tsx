import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FinancialData } from '../types';

interface DataPreviewProps {
  data: FinancialData | null;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  if (!data?.headers || !data?.rows) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Showing first 5 rows of {data.totalRows} total rows
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                {data.headers.map((header: string) => (
                  <th
                    key={header}
                    className="px-4 py-2 bg-muted text-left text-sm font-medium text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.rows.map((row: Record<string, any>, rowIndex: number) => (
                <tr key={rowIndex}>
                  {data.headers.map((header: string) => (
                    <td
                      key={header}
                      className="px-4 py-2 text-sm text-foreground whitespace-nowrap"
                    >
                      {row[header]?.toString() || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataPreview;
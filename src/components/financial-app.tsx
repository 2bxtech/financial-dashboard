import React, { useState } from 'react';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { FinancialData, HealthMetricsData, TrendMetricsData, ChartDataPoint } from '../types';
import FileUploader from './file-uploader';
import DataPreview from './data-preview';
import HealthMetrics from './health-metrics';
import TrendMetrics from './trend-metrics';
import RevenueChart from './revenue-chart';
import ProfitChart from './profit-chart';

const FinancialApp: React.FC = () => {
  const [fileData, setFileData] = useState<FinancialData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [trends, setTrends] = useState<TrendMetricsData | null>(null);

  const calculateGrowthMetrics = (data: ChartDataPoint[]) => {
    if (data.length < 2) return { revenueGrowth: 0, profitGrowth: 0, marginGrowth: 0 };

    const latest = data[data.length - 1] ?? {};
    const previous = data[data.length - 2] ?? {};

    const latestRevenue = latest.Revenue ?? 0;
    const previousRevenue = previous.Revenue ?? 0;
    const latestExpenses = latest.Expenses ?? 0;
    const previousExpenses = previous.Expenses ?? 0;
    const latestMargin = latest.profitMargin ?? 0;
    const previousMargin = previous.profitMargin ?? 0;

    const revenueGrowth = previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const profitGrowth = previousRevenue - previousExpenses > 0 ? ((latestRevenue - latestExpenses) - (previousRevenue - previousExpenses)) / (previousRevenue - previousExpenses) * 100 : 0;
    const marginGrowth = Number((latestMargin - previousMargin).toFixed(2));

    return {
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      profitGrowth: Number(profitGrowth.toFixed(2)),
      marginGrowth: Number(marginGrowth.toFixed(2))
    };
  };

  const handleParseComplete = (results: Papa.ParseResult<Record<string, any>>) => {
    if (results.errors.length > 0) {
      setError(`Parse errors: ${results.errors.map(e => e.message).join(', ')}`);
      return;
    }

    const processedData: FinancialData = {
      headers: results.meta.fields || [],
      rows: results.data.slice(0, 5),
      totalRows: results.data.length
    };

    const chartPoints: ChartDataPoint[] = results.data.map(row => {
      const revenue = Number(row.Revenue || row.revenue || 0);
      const expenses = Number(row.Expenses || row.expenses || 0);
      const profit = revenue - expenses;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      let date = row.Date || row.date || 'N/A';

      if (typeof date === 'string') {
        date = date.includes('-') ? date : `${date.slice(0, 4)}-${date.slice(4)}`;
      } else if (typeof date === 'number') {
        const excelDate = new Date(Date.UTC(0, 0, date - 1));
        date = excelDate.toISOString().slice(0, 7);
      } else if (date instanceof Date) {
        date = date.toISOString().slice(0, 7);
      } else {
        date = 'Invalid Date';
      }

      return {
        Date: date,
        Revenue: revenue,
        Expenses: expenses,
        profitMargin: Number(profitMargin.toFixed(2))
      };
    });

    const calculatedTrends = calculateGrowthMetrics(chartPoints);

    setFileData(processedData);
    setChartData(chartPoints);
    setTrends(calculatedTrends);
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setError('');
    setFileData(null);
    setChartData(null);
    setTrends(null);

    const fileType = file.name.split('.').pop()?.toLowerCase() || '';

    if (fileType === 'csv') {
      Papa.parse<Record<string, any>>(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          handleParseComplete(results);
          setLoading(false);
        },
        error: () => {
          setError('Error parsing CSV file.');
          setLoading(false);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileType)) {
      try {
        const workbook = new ExcelJS.Workbook();
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        const headers: string[] = [];
        const rows: Record<string, any>[] = [];

        worksheet.getRow(1).eachCell((cell) => {
          headers.push(cell.text);
        });

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const rowData: Record<string, any> = {};

          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            rowData[header] = cell.value;
          });

          rows.push(rowData);
        });

        handleParseComplete({
          data: rows,
          errors: [],
          meta: { fields: headers, delimiter: ",", linebreak: "\n", aborted: false, truncated: false, cursor: 0 }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError('Error parsing Excel file: ' + errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <FileUploader onFileUpload={processFile} loading={loading} error={error} />
      <DataPreview data={fileData} />
      {chartData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={chartData} />
            <ProfitChart data={chartData} />
          </div>
          {trends && <TrendMetrics trends={trends} />}
        </>
      )}
    </div>
  );
};

export default FinancialApp;

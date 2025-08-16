import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSampleExcelFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Financial Data');

  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Revenue', key: 'revenue', width: 15 },
    { header: 'Expenses', key: 'expenses', width: 15 }
  ];

  // Sample data with monthly progression
  const data = [
    { date: '2024-01', revenue: 120000, expenses: 85000 },
    { date: '2024-02', revenue: 135000, expenses: 92000 },
    { date: '2024-03', revenue: 128000, expenses: 88000 },
    { date: '2024-04', revenue: 142000, expenses: 95000 },
    { date: '2024-05', revenue: 156000, expenses: 102000 },
    { date: '2024-06', revenue: 148000, expenses: 98000 },
    { date: '2024-07', revenue: 165000, expenses: 108000 },
    { date: '2024-08', revenue: 172000, expenses: 112000 },
    { date: '2024-09', revenue: 158000, expenses: 105000 },
    { date: '2024-10', revenue: 175000, expenses: 115000 },
    { date: '2024-11', revenue: 188000, expenses: 122000 },
    { date: '2024-12', revenue: 195000, expenses: 125000 },
    { date: '2025-01', revenue: 125000, expenses: 87000 },
    { date: '2025-02', revenue: 138000, expenses: 94000 },
    { date: '2025-03', revenue: 145000, expenses: 97000 },
    { date: '2025-04', revenue: 152000, expenses: 101000 },
    { date: '2025-05', revenue: 168000, expenses: 110000 },
    { date: '2025-06', revenue: 162000, expenses: 106000 },
    { date: '2025-07', revenue: 178000, expenses: 116000 },
    { date: '2025-08', revenue: 185000, expenses: 119000 }
  ];

  // Add data rows
  data.forEach(row => {
    worksheet.addRow(row);
  });

  // Format headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Format currency columns
  worksheet.getColumn('revenue').numFmt = '$#,##0';
  worksheet.getColumn('expenses').numFmt = '$#,##0';

  // Save the file
  const filePath = path.join(__dirname, 'sample-financial-data.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file created: ${filePath}`);
}

// Run the function
createSampleExcelFile().catch(console.error);
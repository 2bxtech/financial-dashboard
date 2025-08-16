import { validateFile, validateHeaders, validateData } from '../../utils/validation-utils';

describe('validateFile', () => {
  it('accepts valid CSV files', () => {
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });
    expect(validateFile(file).isValid).toBe(true);
  });

  it('accepts valid Excel files', () => {
    const xlsxFile = new File(['content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const xlsFile = new File(['content'], 'test.xls', { type: 'application/vnd.ms-excel' });
    
    expect(validateFile(xlsxFile).isValid).toBe(true);
    expect(validateFile(xlsFile).isValid).toBe(true);
  });

  it('rejects files over size limit', () => {
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.csv', { type: 'text/csv' });
    const result = validateFile(largeFile);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/file size/i);
  });

  it('rejects unsupported file types', () => {
    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const result = validateFile(pdfFile);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/file type/i);
  });
});

describe('validateHeaders', () => {
  it('accepts valid header combinations', () => {
    const validHeaders = ['Date', 'Revenue', 'Expenses'];
    expect(validateHeaders(validHeaders).isValid).toBe(true);
  });

  it('accepts headers with different cases', () => {
    const headers = ['date', 'REVENUE', 'Expenses'];
    expect(validateHeaders(headers).isValid).toBe(true);
  });

  it('rejects missing required headers', () => {
    const missingDate = ['Revenue', 'Expenses'];
    const missingRevenue = ['Date', 'Expenses'];
    
    expect(validateHeaders(missingDate).isValid).toBe(false);
    expect(validateHeaders(missingRevenue).isValid).toBe(false);
  });

  it('rejects empty header array', () => {
    expect(validateHeaders([]).isValid).toBe(false);
  });
});

describe('validateData', () => {
  it('accepts valid financial data', () => {
    const validData = [
      { Date: '2024-01', Revenue: 1000, Expenses: 800 },
      { Date: '2024-02', Revenue: 1200, Expenses: 900 }
    ];
    expect(validateData(validData).isValid).toBe(true);
  });

  it('accepts string numbers in data', () => {
    const stringNumberData = [
      { Date: '2024-01', Revenue: '1000', Expenses: '800' }
    ];
    expect(validateData(stringNumberData).isValid).toBe(true);
  });

  it('rejects invalid date formats', () => {
    const invalidDateData = [
      { Date: 'invalid', Revenue: 1000, Expenses: 800 }
    ];
    expect(validateData(invalidDateData).isValid).toBe(false);
  });

  it('rejects negative numbers', () => {
    const negativeData = [
      { Date: '2024-01', Revenue: -1000, Expenses: 800 }
    ];
    expect(validateData(negativeData).isValid).toBe(false);
  });

  it('rejects non-numeric revenue/expenses', () => {
    const invalidData = [
      { Date: '2024-01', Revenue: 'invalid', Expenses: 800 }
    ];
    expect(validateData(invalidData).isValid).toBe(false);
  });
});
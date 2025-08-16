/**
 * Excel File Parser Implementation
 * Implements IFileParser interface for Excel files using ExcelJS
 */

import ExcelJS from 'exceljs';
import { IFileParser, ParseResult } from '../interfaces/IFileParser';
import { AppError, ErrorType, ErrorSeverity } from '../../utils/error-handling';

export class ExcelParser implements IFileParser {
  private readonly supportedTypes = ['xlsx', 'xls'];

  async parse(file: File): Promise<ParseResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new AppError(
          'Excel file contains no worksheets',
          ErrorType.PARSE_ERROR,
          ErrorSeverity.HIGH,
          true,
          'The Excel file appears to be empty or corrupted.'
        );
      }

      const headers: string[] = [];
      const rows: Record<string, any>[] = [];
      const errors: ParseResult['errors'] = [];

      // Extract headers from first row
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        const headerValue = cell.text || String(cell.value || '');
        headers.push(headerValue);
      });

      if (headers.length === 0) {
        throw new AppError(
          'Excel file has no headers',
          ErrorType.VALIDATION_ERROR,
          ErrorSeverity.HIGH,
          true,
          'The Excel file must contain headers in the first row.'
        );
      }

      // Extract data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        
        try {
          const rowData: Record<string, any> = {};
          let hasData = false;

          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              const cellValue = cell.value;
              rowData[header] = cellValue;
              
              if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                hasData = true;
              }
            }
          });

          if (hasData) {
            rows.push(rowData);
          }
        } catch (error) {
          errors.push({
            type: 'RowProcessingError',
            code: 'ROW_PROCESSING_FAILED',
            message: `Error processing row ${rowNumber}: ${error instanceof Error ? error.message : String(error)}`,
            row: rowNumber
          });
        }
      });

      return {
        data: rows,
        errors,
        meta: {
          fields: headers,
          delimiter: ',', // Not applicable to Excel, but required by interface
          linebreak: '\n', // Not applicable to Excel, but required by interface
          aborted: false,
          truncated: false,
          cursor: rows.length
        }
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        `Excel parsing failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorType.PARSE_ERROR,
        ErrorSeverity.HIGH,
        true,
        'Unable to read the Excel file. Please ensure it\'s not corrupted and try again.'
      );
    }
  }

  supports(fileType: string): boolean {
    return this.supportedTypes.includes(fileType.toLowerCase());
  }

  getSupportedTypes(): string[] {
    return [...this.supportedTypes];
  }

  getParserInfo() {
    return {
      name: 'Excel Parser',
      version: '1.0.0',
      description: 'Parses Excel files (XLSX, XLS) using ExcelJS library'
    };
  }
}
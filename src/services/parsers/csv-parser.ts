/**
 * CSV File Parser Implementation
 * Implements IFileParser interface for CSV files using PapaParse
 */

import Papa from 'papaparse';
import { IFileParser, ParseResult } from '../interfaces/IFileParser';
import { AppError, ErrorType, ErrorSeverity } from '../../utils/error-handling';

export class CSVParser implements IFileParser {
  private readonly supportedTypes = ['csv', 'txt'];

  async parse(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, any>>(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            // Transform Papa parse results to our interface
            const parseResult: ParseResult = {
              data: results.data,
              errors: results.errors.map(error => ({
                type: error.type || 'UnknownError',
                code: error.code || 'UNKNOWN',
                message: error.message,
                row: error.row
              })),
              meta: {
                fields: results.meta.fields || [],
                delimiter: results.meta.delimiter,
                linebreak: results.meta.linebreak,
                aborted: results.meta.aborted,
                truncated: results.meta.truncated,
                cursor: results.meta.cursor
              }
            };
            
            resolve(parseResult);
          } catch (error) {
            reject(new AppError(
              `CSV parsing transformation failed: ${error instanceof Error ? error.message : String(error)}`,
              ErrorType.PARSE_ERROR,
              ErrorSeverity.HIGH,
              true,
              'Failed to process CSV file structure'
            ));
          }
        },
        error: (error) => {
          reject(new AppError(
            `CSV parsing failed: ${error.message}`,
            ErrorType.PARSE_ERROR,
            ErrorSeverity.HIGH,
            true,
            'Unable to read CSV file. Please check the file format.'
          ));
        }
      });
    });
  }

  supports(fileType: string): boolean {
    return this.supportedTypes.includes(fileType.toLowerCase());
  }

  getSupportedTypes(): string[] {
    return [...this.supportedTypes];
  }

  getParserInfo() {
    return {
      name: 'CSV Parser',
      version: '1.0.0',
      description: 'Parses CSV files using PapaParse library'
    };
  }
}
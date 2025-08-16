/**
 * File Parser Factory
 * Implements Factory Pattern for creating appropriate file parsers
 */

import { IFileParser, IFileParserFactory } from '../interfaces/IFileParser';
import { CSVParser } from './csv-parser';
import { ExcelParser } from './excel-parser';
import { AppError, ErrorType, ErrorSeverity } from '../../utils/error-handling';

export class FileParserFactory implements IFileParserFactory {
  private parsers: IFileParser[] = [];

  constructor() {
    // Register default parsers
    this.registerParser(new CSVParser());
    this.registerParser(new ExcelParser());
  }

  getParser(file: File): IFileParser {
    const fileExtension = this.getFileExtension(file.name);
    
    const parser = this.parsers.find(p => p.supports(fileExtension));
    
    if (!parser) {
      const supportedTypes = this.getSupportedFileTypes();
      throw new AppError(
        `No parser available for file type: ${fileExtension}`,
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.MEDIUM,
        true,
        `File type "${fileExtension}" is not supported. Supported formats: ${supportedTypes.join(', ')}`
      );
    }

    return parser;
  }

  registerParser(parser: IFileParser): void {
    // Check if parser for these types already exists
    const existingParser = this.parsers.find(p => 
      p.getSupportedTypes().some(type => 
        parser.getSupportedTypes().includes(type)
      )
    );

    if (existingParser) {
      // Replace existing parser
      const index = this.parsers.indexOf(existingParser);
      this.parsers[index] = parser;
    } else {
      this.parsers.push(parser);
    }
  }

  getAvailableParsers(): IFileParser[] {
    return [...this.parsers];
  }

  getSupportedFileTypes(): string[] {
    const allTypes = this.parsers.flatMap(parser => parser.getSupportedTypes());
    return [...new Set(allTypes)].sort();
  }

  getParserInfo(fileType: string): string {
    const parser = this.parsers.find(p => p.supports(fileType));
    if (!parser) {
      return 'No parser available';
    }
    
    const info = parser.getParserInfo();
    return `${info.name} v${info.version} - ${info.description}`;
  }

  private getFileExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension) {
      throw new AppError(
        'File has no extension',
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.MEDIUM,
        true,
        'Please ensure your file has a valid extension (e.g., .csv, .xlsx)'
      );
    }
    return extension;
  }
}

// Export singleton instance
export const fileParserFactory = new FileParserFactory();
/**
 * File Parser Interface
 * Abstracts file parsing operations following Dependency Inversion Principle
 */

export interface ParseResult<T = any> {
  data: T[];
  errors: Array<{
    type: string;
    code: string;
    message: string;
    row?: number;
  }>;
  meta: {
    fields: string[];
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

export interface IFileParser {
  /**
   * Parse a file and return structured data
   */
  parse(file: File): Promise<ParseResult>;
  
  /**
   * Check if this parser supports the given file type
   */
  supports(fileType: string): boolean;
  
  /**
   * Get the file types this parser can handle
   */
  getSupportedTypes(): string[];
  
  /**
   * Get parser-specific configuration options
   */
  getParserInfo(): {
    name: string;
    version: string;
    description: string;
  };
}

export interface IFileParserFactory {
  /**
   * Get the appropriate parser for a file
   */
  getParser(file: File): IFileParser;
  
  /**
   * Register a new parser
   */
  registerParser(parser: IFileParser): void;
  
  /**
   * Get all available parsers
   */
  getAvailableParsers(): IFileParser[];
}
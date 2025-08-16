// validation-utils.ts

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const ALLOWED_TYPES = ['.csv', '.xlsx', '.xls'];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (file: File): ValidationResult => {
   
    if (file.size > FILE_SIZE_LIMIT) {
      return {
        isValid: false,
        error: `File size exceeds 5MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      };
    }
   
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_TYPES.includes(`.${extension}`)) {
      return {
        isValid: false,
        error: `Invalid file type. Supported formats: ${ALLOWED_TYPES.join(', ')}`
      };
    }
   
    return { isValid: true };
   };

export const validateHeaders = (headers: string[]): ValidationResult => {
  const requiredHeaders = ['Date', 'Revenue', 'Expenses'];
  const missingHeaders = requiredHeaders.filter(
    header => !headers.some(h => h.toLowerCase() === header.toLowerCase())
  );

  if (missingHeaders.length > 0) {
    return {
      isValid: false,
      error: `Missing required columns: ${missingHeaders.join(', ')}`
    };
  }

  return { isValid: true };
};

export const validateData = (data: any[]): ValidationResult => {
    if (!Array.isArray(data) || data.length === 0) {
      return { isValid: false, error: 'Data must be a non-empty array' };
    }
  
    const dateRegex = /^\d{4}-\d{2}$/;
    
    for (const row of data) {
      if (!dateRegex.test(row.Date?.toString())) {
        return { isValid: false, error: 'Invalid date format' };
      }
      
      if (!row.Revenue || !row.Expenses) {
        return { isValid: false, error: 'Missing required fields' };
      }
  
      const revenue = Number(row.Revenue);
      const expenses = Number(row.Expenses);
      
      if (isNaN(revenue) || isNaN(expenses) || revenue < 0 || expenses < 0) {
        return { isValid: false, error: 'Invalid numeric values' };
      }
    }
  
    return { isValid: true };
  };
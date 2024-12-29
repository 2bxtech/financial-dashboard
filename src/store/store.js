import create from 'zustand';
import Papa from 'papaparse';

export const useFinancialStore = create((set) => ({
  financialData: null,
  loading: false,
  error: '',
  setFinancialData: (data) => set({ financialData: data }),
  processFile: (file) => {
    set({ loading: true, error: '' });

    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          set({ financialData: results.data, loading: false });
        },
        error: () => set({ error: 'Error parsing CSV', loading: false }),
      });
    } else {
      set({ error: 'Unsupported file type', loading: false });
    }
  }
}));

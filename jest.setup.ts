import '@testing-library/jest-dom';

// jest.setup.ts
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  
  global.ResizeObserver = ResizeObserver;
  
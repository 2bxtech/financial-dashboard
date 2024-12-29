import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.paths.json';

export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest"  // Use babel-jest for all TypeScript and JavaScript files
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
    "^@/(.*)$": "<rootDir>/src/$1",  // Explicit manual mapping for "@/lib/*" or "@/components/*"
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js"
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],  // Setup file for additional Jest configurations
  transformIgnorePatterns: [
    "node_modules/(?!@babel|lodash-es|exceljs|uuid)"  // Transform ES modules from node_modules if needed
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],  // Supported extensions
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'  // Explicitly point to your tsconfig
    }
  },
};

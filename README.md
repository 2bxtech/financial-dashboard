# 📊 Financial Dashboard

> A financial data visualization tool built with React and TypeScript. Upload CSV or Excel files to see charts and basic financial metrics.

[![Tests](https://img.shields.io/badge/tests-59%2F59%20passing-brightgreen)](https://github.com/2bxtech/financial-dashboard)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange)](https://zustand-demo.pmnd.rs/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/2bxtech/financial-dashboard.git

# Install dependencies
cd financial-dashboard
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The application will be available at `http://localhost:5173/`

## 📋 Overview

The Financial Dashboard is a web application that transforms spreadsheet data into charts and financial metrics. Built with React, TypeScript, and Zustand state management, it processes CSV and Excel files to display revenue, expenses, and profit trends with **enterprise-grade features** including data persistence, undo/redo functionality, and performance optimizations. Data processing is highly optimized for fast performance.

### 🎯 Key Benefits

- **Simple Interface**: Drag-and-drop file upload with intuitive controls
- **Fast Processing**: Immediate chart generation with optimized performance
- **Reliable Error Handling**: Clear error messages and recovery options
- **Privacy Focused**: All processing happens in your browser
- **Multiple Formats**: Works with CSV and Excel files
- **Data Persistence**: Settings and preferences automatically saved
- **Undo/Redo Support**: Full command history with keyboard shortcuts
- **Enterprise State Management**: Zustand store with performance optimizations

## ✨ Features

### 📈 Data Visualization
- **Interactive Charts**: Revenue vs expenses with responsive design
- **Profit Tracking**: Margin calculations and trends with drill-down
- **Advanced Metrics**: Growth rates and comprehensive financial ratios
- **Trend Analysis**: Revenue consistency and expense pattern recognition

### 🔧 Technical Features
- **File Support**: CSV and Excel (.xlsx) processing with validation
- **Data Validation**: Input validation with helpful error messages
- **Error Recovery**: Circuit breaker pattern for reliable processing
- **Type Safety**: TypeScript for better code quality and development experience
- **Fast Processing**: Optimized performance, typically ~50ms for most files
- **State Management**: Zustand store with persistence and undo/redo
- **Performance Monitoring**: Built-in performance tracking and optimization

### 🎨 User Interface
- **File Upload**: Drag & drop or click to upload with progress indicators
- **Data Feedback**: Shows processing status and validation results
- **Modern Design**: Built with Tailwind CSS and Shadcn/UI components
- **Error Display**: Clear messages with recovery suggestions
- **Mobile Friendly**: Responsive design for all screen sizes
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Undo/Redo Controls**: Visual controls with operation descriptions

### 🚀 Enterprise Features
- **Data Persistence**: Automatic saving of user preferences and settings
- **Undo/Redo System**: Complete command history with 50-operation memory
- **Storage Management**: Intelligent localStorage with quota monitoring
- **Performance Optimization**: Zero unnecessary re-renders with optimized selectors
- **Development Tools**: Redux DevTools integration and performance monitoring
- **Migration System**: Version-safe store updates with rollback support

## 🏗️ Architecture

### Code Organization

The application follows standard React patterns with TypeScript:

- **Single Responsibility**: Each component has one main job
- **Modular Design**: Features are separated into logical modules
- **Type Safety**: TypeScript interfaces define data contracts
- **Error Handling**: Structured error management throughout
- **Testing**: Components and services have test coverage

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  React Components + TypeScript + Tailwind CSS + Shadcn/UI  │
│                   + Undo/Redo Controls                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                 State Management Layer                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Zustand Store (7 Slices)               │  │
│  │  • Financial Data    • UI State    • Error State    │  │
│  │  • User Preferences  • Processing  • File Compare   │  │
│  │  • Undo/Redo + Command Pattern + Persistence        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                   Service Layer                             │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │ File Processing  │  │    Data Processing Service      │  │
│  │    Service       │  │  • Metrics Calculation         │  │
│  │ • CSV Parser     │  │  • Data Transformation         │  │
│  │ • Excel Parser   │  │  • Validation Logic            │  │
│  │ • Factory Pattern│  │  • Business Intelligence       │  │
│  └──────────────────┘  └─────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                Infrastructure Layer                         │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Circuit Breaker │  │ Error System │  │ Storage & Utils │ │
│  │ • Fault Tolerance│  │ • Structured │  │ • Type Safety   │ │
│  │ • Auto Recovery │  │ • User Messages│  │ • Persistence   │ │
│  │                 │  │              │  │ • Performance   │ │
│  └─────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Core Technologies
- **React 18**: Modern component-based UI framework with hooks and Suspense
- **TypeScript 5+**: Static type checking and enhanced developer experience
- **Vite**: Fast build tool with optimized development server and HMR
- **Tailwind CSS**: Utility-first styling with responsive design system
- **Zustand**: Lightweight, performant state management with persistence

#### State Management & Performance
- **Zustand Store**: Modular store architecture with 7 specialized slices
- **Command Pattern**: Reversible operations with comprehensive undo/redo (50-operation memory)
- **Individual Selectors**: Performance-optimized subscriptions preventing re-renders
- **localStorage Integration**: Smart persistence with selective data storage
- **Performance Monitoring**: Development tools for optimization and debugging
#### Data Processing & File Handling
- **PapaParse**: High-performance CSV parsing with stream support
- **ExcelJS**: Native Excel file processing with formatting preservation
- **Recharts**: Powerful charting library with interactive visualizations
- **Lodash**: Utility functions for efficient data manipulation

#### Quality & Testing
- **Jest**: Comprehensive testing framework (59/59 tests passing)
- **Testing Library**: React component testing with accessibility focus
- **ESLint**: Code quality and consistency enforcement
- **TypeScript Strict Mode**: Enhanced type safety with zero any types

#### UI/UX Libraries
- **Shadcn/UI**: Modern, accessible component library with dark mode
- **Lucide React**: Beautiful, customizable icon system
- **Immer**: Immutable state updates with developer-friendly syntax
- **Performance Utilities**: Custom shallow comparison and optimization tools

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (Shadcn/UI)
│   ├── error-display.tsx    # Error handling components
│   ├── loading-state.tsx    # Loading indicators
│   ├── financial-app.tsx    # Main application component
│   ├── undo-redo-controls.tsx # Undo/redo UI controls
│   ├── store-demo.tsx       # Interactive store demonstration
│   └── __tests__/       # Component tests
├── store/               # Zustand state management
│   ├── index.ts         # Main store with individual selectors
│   ├── types.ts         # TypeScript interfaces for all slices
│   ├── commands.ts      # Command pattern for undo/redo
│   ├── migrations.ts    # Store version migration system
│   ├── *-slice.ts       # Modular store slices (7 total)
│   └── __tests__/       # Store functionality tests
├── services/            # Business logic layer
│   ├── interfaces/      # Service contracts
│   │   ├── IDataProcessingService.ts
│   │   └── IFileParser.ts
│   ├── parsers/         # File format implementations
│   │   ├── csv-parser.ts
│   │   ├── excel-parser.ts
│   │   └── file-parser-factory.ts
│   ├── data-processing.service.ts
│   └── file-processing.service.ts
├── utils/               # Infrastructure utilities
│   ├── circuit-breaker.ts   # Fault tolerance
│   ├── error-handling.ts    # Structured error system
│   ├── validation-utils.ts  # Data validation
│   ├── persistence.ts       # localStorage management
│   ├── performance-monitor.ts # Performance tracking
│   ├── storage-quota-manager.ts # Storage management
│   ├── shallow.ts           # Performance optimization utilities
│   └── store-reset.ts       # Development utilities
├── hooks/               # Custom React hooks
│   └── useKeyboardShortcuts.ts # Global keyboard shortcuts
├── types/               # TypeScript definitions
└── assets/              # Static resources
```

## 🔧 Key Features

### Zustand Store Architecture

Enterprise-grade state management with modular architecture:

```typescript
// Store Structure (7 specialized slices)
interface AppStore {
  // Financial data management
  fileData: FileData | null;
  chartData: ChartData[];
  
  // UI state with persistence
  loading: boolean;
  theme: 'light' | 'dark';
  chartSettings: ChartSettings;
  
  // Error handling integration
  error: AppError | null;
  errorHistory: AppError[];
  
  // User preferences (persisted)
  preferences: UserPreferences;
  
  // Processing metrics and analytics
  processingMetrics: ProcessingMetrics;
  
  // File comparison features
  comparisonData: ComparisonData;
  
  // Undo/redo system
  commandHistory: Command[];
  canUndo: boolean;
  canRedo: boolean;
}
```

### Command Pattern & Undo/Redo

Comprehensive undo/redo system with 50-operation history:

```typescript
interface Command {
  id: string;
  type: string;
  execute: () => void;
  undo: () => void;
  timestamp: number;
  description: string;
}

// Supported operations
- File upload/clear operations
- Settings changes (theme, chart type, layout)
- Dashboard configuration updates
- User preference modifications
```

### Performance Optimizations

Zero unnecessary re-renders with individual selectors:

```typescript
// Individual selectors prevent object recreation
export const useFileData = () => useAppStore(state => state.fileData);
export const useLoading = () => useAppStore(state => state.loading);
export const useSetFileData = () => useAppStore(state => state.setFileData);

// Factory pattern prevents memory leaks
import { shallow } from 'zustand/shallow';

// Factory to create a shallow-equality selector for Zustand
export const createShallowSelector = (selector) => {
  return (state) => shallow(selector(state));
};
```

### Data Persistence System

Smart localStorage with selective persistence:

**Persisted Data:**
- User preferences (theme, currency, settings)
- Chart settings (type, grid, legend preferences)  
- Dashboard layout (component visibility, order)
- Processing metrics (performance history)
- File comparison data

**Non-Persisted Data:**
- Current file data (session-only)
- Loading states (UI state)
- Error states (temporary)
- Undo/redo stacks (memory-only)

### Keyboard Shortcuts

Global keyboard shortcuts for enhanced productivity:

- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo  
- `Ctrl+Y` / `Cmd+Y` - Redo (alternative)
- `Ctrl+S` / `Cmd+S` - Save/Export
- `Ctrl+O` / `Cmd+O` - Open file
- `Escape` - Close modals

### Circuit Breaker Pattern

Prevents errors from cascading when file processing fails:

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;    // Max failures before opening
  recoveryTimeout: number;     // Time before recovery attempt
  monitoringPeriod: number;    // Monitoring window
}
```

**States**: CLOSED → OPEN → HALF_OPEN → CLOSED

### Error Handling System

Structured error management with helpful messages:

```typescript
class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly recoverable: boolean;
  public readonly userMessage: string;
}
```

**Error Types**: Validation, Processing, Network, Circuit Breaker  
**Severity Levels**: Low, Medium, High, Critical

### Data Processing Features

Basic financial calculations and metrics:

- **Revenue Tracking**: Monthly revenue totals and trends
- **Expense Analysis**: Cost tracking and spending patterns  
- **Profit Calculations**: Basic margin and profitability metrics
- **Data Validation**: Checks for common data quality issues

## 🧪 Testing

### Test Coverage
```
✅ Test Suites: 8 passed, 8 total
✅ Tests: 59 passed, 59 total  
✅ Coverage: Comprehensive coverage including store functionality
✅ New Features: 14 additional tests for state management
```

### Test Categories
- **Unit Tests**: Service layer, utilities, business logic
- **Integration Tests**: Component interactions, data flow, store operations
- **UI Tests**: User interactions, error states, loading states  
- **Store Tests**: Zustand store functionality, persistence, undo/redo
- **Performance Tests**: Re-render optimization, memory management
- **E2E Tests**: Complete file processing workflows

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📊 Sample Data

The repository includes test data for trying out the application:

- **`sample-data.csv`**: Basic revenue/expense data (20 entries)
- **`sample-data-detailed.csv`**: More complex data with categories (60 entries)
- **`sample-financial-data.xlsx`**: Excel format example

### Expected Data Format

**CSV Structure**:
```csv
Date,Revenue,Expenses
2024-01,120000,85000
2024-02,135000,92000
```

**Excel Support**:
- Native .xlsx format
- Formatted headers and currency
- Multiple sheets (first sheet processed)

**Extended Format** (optional columns):
```csv
Date,Revenue,Expenses,Department,Region,Product Category
2024-01,120000,85000,Sales,North America,Software
```

## 🚀 Performance

### What to Expect
- **Processing Time**: Optimized to ~50ms for typical files (20-60 rows)
- **Memory Usage**: Efficient memory management with bounded histories
- **File Size**: Handles small to medium spreadsheets with performance monitoring
- **Load Time**: Fast startup with state hydration from localStorage
- **Re-render Optimization**: Zero unnecessary re-renders with individual selectors
- **Storage Management**: Automatic cleanup when quota exceeds 85%

### Technical Details
- **Client-side Processing**: No server required for data processing
- **File Parsing**: Uses established libraries (PapaParse, ExcelJS)
- **Chart Rendering**: Recharts for responsive data visualization
- **Bundle Optimization**: Code splitting and tree shaking enabled
- **State Persistence**: Smart localStorage with migration system
- **Performance Monitoring**: Built-in development performance tracking
- **Memory Management**: Bounded command history and automatic cleanup

## 🎯 Target Audience

### Primary Users
- **Small to Medium Business Owners**: Quick financial insights and reporting
- **Financial Analysts**: Rapid data visualization from spreadsheets
- **Accountants & Bookkeepers**: Regular financial data analysis
- **Business Consultants**: Client presentation and trend analysis

### Use Cases
- Monthly/quarterly financial review meetings
- Profit margin analysis and optimization
- Revenue trend identification and forecasting
- Expense tracking and cost management
- Investment pitch deck preparation

## 🔮 Future Plans

### Next Features
- [ ] Export charts as images or PDFs with settings persistence
- [ ] Advanced analytics dashboard with performance metrics
- [ ] Plugin architecture for custom calculations
- [ ] Multi-file comparison with visual diff tools
- [ ] Real-time collaboration features
- [ ] API integration with automatic sync

### Possible Improvements
- [ ] Enhanced data export functionality with format options
- [ ] Time period comparison with historical analysis
- [ ] Integration with external financial APIs
- [ ] Custom dashboard layouts with drag-and-drop
- [ ] Advanced filtering and search capabilities
- [ ] Batch file processing with progress tracking


### Development Setup
```bash
# Fork the repository
git clone https://github.com/your-username/financial-dashboard.git

# Create feature branch
git checkout -b feature/your-feature-name

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

```

### Code Standards
- **TypeScript**: All new code must be TypeScript
- **Testing**: Include tests for new features
- **Documentation**: Update README and inline docs
- **Linting**: Code must pass ESLint checks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## 🙏 Acknowledgments

- **React Team**: For the excellent framework
- **TypeScript Team**: For static type safety
- **Vite Team**: For blazing fast build tools
- **Tailwind CSS**: For utility-first styling
- **Shadcn**: For beautiful, accessible components

---

<div align="center">

**Built with ❤️ by 2bxtech**

[Documentation](https://github.com/2bxtech/financial-dashboard/wiki)

</div>
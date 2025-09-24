# 📊 Financial Dashboard

> A comprehensive financial data analysis and reporting tool built with React and TypeScript. Upload CSV or Excel files to generate charts, analyze financial metrics, and export professional reports.

[![Tests](https://img.shields.io/badge/tests-213%2F213%20passing-brightgreen)](https://github.com/2bxtech/financial-dashboard)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
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

A web application that processes CSV and Excel files to generate financial charts, analyze metrics, and export professional reports. Built with React, TypeScript, and Zustand for state management. Features include comprehensive export functionality, undo/redo operations, chart customization, dark mode support, and client-side data processing for privacy.

## 📱 Screenshots

* Screenshots available in the [`screenshots/`](screenshots/) directory*

<img width="1920" height="1080" alt="dashboard-light-lines-part1-top" src="https://github.com/user-attachments/assets/14b004e2-5cac-4615-8155-e5e3ccaa2d22" />

<img width="1920" height="1080" alt="dashboard-light-lines-part2-middle" src="https://github.com/user-attachments/assets/fe0fcf6b-6533-41ae-8404-cf547c5d2e3d" />

<img width="1920" height="1080" alt="dashboard-light-lines-part3-bottom" src="https://github.com/user-attachments/assets/614c2b95-cf89-4008-823b-a5a469bf8c91" />


<img width="1920" height="945" alt="dashboard-light-area-part1-top" src="https://github.com/user-attachments/assets/a61a86a8-f665-40e2-9dce-3acc66898351" />

<img width="1920" height="945" alt="dashboard-light-area-part2-middle" src="https://github.com/user-attachments/assets/c520f189-769f-4051-b3ec-8a2efab6fdcb" />

<img width="1920" height="945" alt="dashboard-light-area-part3-bottom" src="https://github.com/user-attachments/assets/eeb56461-123d-4bcd-ade4-09430ae823d6" />


<img width="1920" height="1080" alt="dashboard-dark-bars-part1-top" src="https://github.com/user-attachments/assets/3facf283-8116-44ae-89a4-54f443d85d5d" />

<img width="1920" height="1080" alt="dashboard-dark-bars-part2-middle" src="https://github.com/user-attachments/assets/3ec79417-a759-4380-947d-64d640a51e8d" />

<img width="1920" height="1080" alt="dashboard-dark-bars-part3-bottom" src="https://github.com/user-attachments/assets/f058577d-9478-4bef-acb7-6f46b6bb8063" />


### 🎯 Key Features

- Drag-and-drop file upload interface
- Comprehensive export system (CSV, Excel, PNG, PDF reports)
- Professional PDF report generation with embedded charts
- Chart settings update components in real-time
- Undo/redo operations with keyboard shortcuts
- Dark mode with accessible color contrast
- ~50ms processing time for typical files
- Error handling with recovery suggestions
- Client-side processing (no server required)
- CSV and Excel file support
- Settings panel with live configuration updates
- Zustand state management with performance optimizations

## ✨ Features

### 📈 Data Visualization
- Revenue vs expenses charts with configurable types (Line, Bar, Area)
- Chart type switching with live updates
- Grid lines and legend toggle controls
- Profit margin calculations and trend display
- Basic growth rate and financial ratio calculations
- Revenue consistency and expense pattern analysis
- Dark mode chart rendering with appropriate color schemes

### 📊 Export & Reporting
- Multi-format data export (CSV, Excel) with complete dataset preservation
- Professional PDF report generation with two templates (Executive Summary, Detailed Analysis)
- Chart image exports (PNG) with theme-aware rendering
- Export settings configuration and history tracking
- Real-time export progress indicators
- Client-side processing maintaining zero server dependencies

### 🔧 Technical Features
- CSV and Excel (.xlsx) file parsing with validation
- Multi-format export system with data integrity validation
- PDF report generation with embedded chart screenshots
- Input validation with error messages
- Circuit breaker pattern for error handling
- TypeScript for type safety
- Performance optimization (~50ms typical processing)
- Zustand state management with persistence and undo/redo
- Performance monitoring and tracking
- Chart settings integrate with UI components

### 🎨 User Interface
- Drag & drop file upload with progress indicators
- Processing status and validation feedback with data preview
- Tailwind CSS and Shadcn/UI components
- Dark theme with semantic color system and accessible contrast
- Error messages with recovery suggestions
- Responsive design for mobile and desktop
- Keyboard shortcuts for common operations
- Settings panel with real-time configuration
- Undo/redo controls with operation history

### 🚀 State Management
- Undo/redo system with 50-operation memory and keyboard shortcuts
- Chart settings update all components when changed
- Dark mode implementation with semantic color system
- User preferences and settings persistence to localStorage
- Settings panel with real-time UI updates
- CSS variables for consistent light/dark theming
- localStorage quota monitoring and management
- Individual Zustand selectors to prevent unnecessary re-renders
- Redux DevTools integration for debugging
- Store migration system for version updates

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
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │ Export Service   │  │  Report Generation Service      │  │
│  │ • Multi-format   │  │  • PDF Report Creation          │  │
│  │ • Chart Capture  │  │  • Template Management         │  │
│  │ • Data Export    │  │  • Chart Embedding             │  │
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

#### Export & Reporting
- **@react-pdf/renderer**: Professional PDF report generation
- **html2canvas**: Chart screenshot capture for embedded images
- **file-saver**: Cross-browser file download management
- **xlsx**: Excel format export functionality

#### Quality & Testing
- **Jest**: Comprehensive testing framework (213/213 tests passing)
- **Testing Library**: React component testing with accessibility focus
- **ESLint**: Code quality and consistency enforcement
- **TypeScript Strict Mode**: Enhanced type safety with zero any types

#### UI/UX Libraries
- **Shadcn/UI**: Modern, accessible component library with complete dark mode support
- **Tailwind CSS v3**: Class-based dark mode with CSS variables for semantic theming
- **Lucide React**: Beautiful, customizable icon system with theme-aware colors
- **CSS Variables**: Semantic color system for consistent light/dark mode theming
- **Immer**: Immutable state updates with developer-friendly syntax
- **Performance Utilities**: Custom shallow comparison and optimization tools

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (Shadcn/UI with dark mode)
│   ├── error-display.tsx    # Error handling components
│   ├── loading-state.tsx    # Loading indicators
│   ├── financial-app.tsx    # Main application component with keyboard shortcuts
│   ├── undo-redo-controls.tsx # Undo/redo UI controls with dark mode support
│   ├── store-demo.tsx       # Interactive Settings Panel with real-time updates
│   ├── data-preview.tsx     # Data table with dark mode support
│   ├── revenue-chart.tsx    # Revenue chart with live settings integration
│   ├── profit-chart.tsx     # Profit chart with live settings integration
│   ├── trend-metrics.tsx    # Metrics display with dark mode support
│   ├── file-uploader.tsx    # File upload with enhanced UI
│   ├── export-controls.tsx  # Export functionality UI
│   ├── export-settings-dialog.tsx # Export configuration
│   ├── export-history-dialog.tsx # Export history tracking
│   └── __tests__/       # Component tests (comprehensive coverage)
├── store/               # Zustand state management
│   ├── index.ts         # Main store with individual selectors
│   ├── types.ts         # TypeScript interfaces for all slices
│   ├── commands.ts      # Command pattern for undo/redo (fixed live store access)
│   ├── migrations.ts    # Store version migration system
│   ├── *-slice.ts       # Modular store slices (7 total with enhanced features)
│   └── __tests__/       # Store functionality tests
├── services/            # Business logic layer
│   ├── interfaces/      # Service contracts
│   │   ├── IDataProcessingService.ts
│   │   ├── IFileParser.ts
│   │   ├── IExportService.ts
│   │   └── IReportGenerationService.ts
│   ├── parsers/         # File format implementations
│   │   ├── csv-parser.ts
│   │   ├── excel-parser.ts
│   │   └── file-parser-factory.ts
│   ├── data-processing.service.ts
│   ├── file-processing.service.ts
│   ├── export.service.ts
│   └── report-generation.service.ts
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
│   └── useKeyboardShortcuts.ts # Global keyboard shortcuts (comprehensive)
├── types/               # TypeScript definitions
└── assets/              # Static resources
```

## 🔧 Key Features

### Zustand Store Architecture

State management with modular store structure:

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

Undo/redo system with 50-operation history:

```typescript
interface Command {
  id: string;
  type: string;
  execute: () => void;
  undo: () => void;
  timestamp: number;
  description: string;
}

// Supported operations with full undo/redo
- File upload/clear operations (with smart state capture)
- Settings changes (theme, chart type, grid, legend)
- Dashboard configuration updates with real-time feedback
- User preference modifications with instant UI updates
- Theme switching with complete dark/light mode support
```

### Performance Optimizations

Individual selectors to prevent unnecessary re-renders:

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

localStorage integration with selective persistence:

**Persisted Data:**
- User preferences (theme, currency, advanced settings)
- Chart settings (type, grid, legend preferences with real-time sync)  
- Dashboard layout (component visibility, order, configuration)
- Processing metrics (performance history and analytics)
- File comparison data and user workflows

**Non-Persisted Data:**
- Current file data (session-only for privacy)
- Loading states and UI transient state
- Error states (temporary with recovery options)
- Undo/redo stacks (memory-only, 50-operation limit)

### Keyboard Shortcuts

Available keyboard shortcuts:

**Core Actions:**
- `Ctrl+Z` / `Cmd+Z` - Undo last operation
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo operation  
- `Ctrl+Y` / `Cmd+Y` - Redo (alternative)
- `Ctrl+Delete` - Clear all data (undoable)

**Application Controls:**
- `Ctrl+Shift+D` / `Cmd+Shift+D` - Toggle dark/light theme
- `Ctrl+S` / `Cmd+S` - Save/Export (when available)
- `Ctrl+O` / `Cmd+O` - Open file dialog
- `Escape` - Close modals and dialogs

**Chart & Dashboard:**
- Live chart type switching through Settings Panel
- Grid and legend toggles with immediate visual feedback
- Theme changes apply instantly to all components

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

Financial calculations and metrics:

- **Revenue Tracking**: Monthly revenue totals and trends
- **Expense Analysis**: Cost tracking and spending patterns  
- **Profit Calculations**: Basic margin and profitability metrics
- **Data Validation**: Checks for common data quality issues

## 🧪 Testing

### Test Coverage
```
✅ Test Suites: 12 passed, 12 total
✅ Tests: 213 passed, 213 total  
✅ Coverage: Comprehensive coverage, including store and export functionality
```

### Test Categories
- **Unit Tests**: Service layer, utilities, business logic
- **Integration Tests**: Component interactions, data flow, store operations
- **UI Tests**: User interactions, error states, loading states  
- **Store Tests**: Zustand store functionality, persistence, undo/redo
- **Export Tests**: Export service functionality, PDF generation, data integrity
- **Performance Tests**: Re-render optimization, memory management
- **E2E Tests**: Complete file processing and export workflows

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
- **`sample-exports/`**: Directory with sample export outputs (CSV, Excel, PDF, PNG)

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

### Metrics
- Processing time: ~50ms for typical files (20-60 rows)
- Memory management with bounded operation histories
- Handles small to medium spreadsheets with monitoring
- Fast startup with localStorage state hydration
- Individual selectors prevent unnecessary re-renders
- Automatic storage cleanup when quota exceeds 85%

### Technical Implementation
- Client-side processing (no server required)
- File parsing with PapaParse and ExcelJS libraries
- Recharts for chart rendering
- Code splitting and tree shaking enabled
- localStorage with migration system
- Development performance tracking
- Bounded command history with automatic cleanup

## 🎯 Target Audience

### Users
- Small to medium business owners needing financial reporting
- Financial analysts doing rapid data visualization
- Accountants and bookkeepers analyzing financial data
- Business consultants preparing client presentations

### Use Cases
- Monthly/quarterly financial reviews
- Profit margin analysis
- Revenue trend identification
- Expense tracking
- Investment presentation preparation

## 🔮 Future Plans

### Potential Improvements
- [ ] Basic forecasting with linear regression
- [ ] Additional chart types and customization
- [ ] Enhanced data filtering and search
- [ ] Batch file processing capabilities


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
- TypeScript is required for all new code
- Include tests for new features
- Update documentation for changes
- Code must pass ESLint checks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## 🙏 Acknowledgments

- React Team for the library
- TypeScript Team for static type safety
- Vite Team for build tools
- Tailwind CSS for utility-first styling
- Shadcn for accessible components
- Zustand for lightweight state management
- Recharts for powerful data visualization
- @react-pdf/renderer for PDF generation capabilities

---

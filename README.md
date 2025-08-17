# 📊 Financial Dashboard

> A financial data visualization tool built with React and TypeScript. Upload CSV or Excel files to see charts and basic financial metrics.

[![Tests](https://img.shields.io/badge/tests-45%2F45%20passing-brightgreen)](https://github.com/2bxtech/financial-dashboard)
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

The Financial Dashboard is a web application that transforms spreadsheet data into charts and financial metrics. Built with React and TypeScript, it processes CSV and Excel files to display revenue, expenses, and profit trends.

### 🎯 Key Benefits

- **Simple Interface**: Drag-and-drop file upload
- **Fast Processing**: Immediate chart generation from your data
- **Reliable Error Handling**: Clear error messages and recovery options
- **Privacy Focused**: All processing happens in your browser
- **Multiple Formats**: Works with CSV and Excel files

## ✨ Features

### 📈 Data Visualization
- **Basic Charts**: Revenue vs expenses over time
- **Profit Tracking**: Margin calculations and trends
- **Simple Metrics**: Growth rates and basic financial ratios
- **Trend Analysis**: Revenue consistency and expense patterns

### 🔧 Technical Features
- **File Support**: CSV and Excel (.xlsx) processing
- **Data Validation**: Input validation with helpful error messages
- **Error Recovery**: Circuit breaker pattern for reliable processing
- **Type Safety**: TypeScript for better code quality
- **Fast Processing**: Typically under 100ms for small datasets

### 🎨 User Interface
- **File Upload**: Drag & drop or click to upload
- **Data Feedback**: Shows processing status and validation results
- **Clean Design**: Built with Tailwind CSS components
- **Error Display**: Clear messages when something goes wrong
- **Mobile Friendly**: Works on different screen sizes

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
│  │ Circuit Breaker │  │ Error System │  │ Validation Utils│ │
│  │ • Fault Tolerance│  │ • Structured │  │ • Type Safety   │ │
│  │ • Auto Recovery │  │ • User Messages│  │ • Data Quality  │ │
│  └─────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Core Technologies
- **React 18**: Modern component-based UI framework with hooks
- **TypeScript 5+**: Static type checking and enhanced developer experience
- **Vite**: Fast build tool with optimized development server
- **Tailwind CSS**: Utility-first styling with responsive design

#### Data Processing
- **PapaParse**: High-performance CSV parsing
- **ExcelJS**: Native Excel file processing with formatting support
- **Recharts**: Powerful charting library for data visualization
- **Lodash**: Utility functions for data manipulation

#### Quality & Testing
- **Jest**: Comprehensive testing framework (45/45 tests passing)
- **Testing Library**: React component testing utilities
- **ESLint**: Code quality and consistency enforcement
- **TypeScript Strict Mode**: Enhanced type safety

#### UI/UX Libraries
- **Shadcn/UI**: Modern, accessible component library
- **Lucide React**: Beautiful, customizable icons
- **Zustand**: Lightweight state management

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (Shadcn/UI)
│   ├── error-display.tsx    # Error handling components
│   ├── loading-state.tsx    # Loading indicators
│   ├── financial-app.tsx    # Main application component
│   └── __tests__/       # Component tests
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
│   └── validation-utils.ts  # Data validation
├── types/               # TypeScript definitions
└── assets/              # Static resources
```

## 🔧 Key Features

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
✅ Test Suites: 5 passed, 5 total
✅ Tests: 45 passed, 45 total
✅ Coverage: Good coverage of main functionality
```

### Test Categories
- **Unit Tests**: Service layer, utilities, business logic
- **Integration Tests**: Component interactions, data flow
- **UI Tests**: User interactions, error states, loading states
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
- **Processing Time**: Around 100ms for typical files (20-60 rows)
- **Memory Usage**: Reasonable memory usage for client-side processing
- **File Size**: Works well with small to medium spreadsheets
- **Load Time**: Quick startup on modern browsers

### Technical Details
- **Client-side Processing**: No server required for data processing
- **File Parsing**: Uses established libraries (PapaParse, ExcelJS)
- **Chart Rendering**: Recharts for responsive data visualization
- **Bundle Optimization**: Code splitting and tree shaking enabled

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
- [ ] More chart types and visualization options
- [ ] Export charts as images or PDFs
- [ ] Better handling of larger datasets
- [ ] Additional financial metrics and ratios

### Possible Improvements
- [ ] Data export functionality
- [ ] Comparison between different time periods
- [ ] Integration with external APIs
- [ ] Custom dashboard layouts

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

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

# Submit pull request
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
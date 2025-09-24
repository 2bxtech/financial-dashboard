/**
 * Report Generation Service Implementation
 * Handles PDF report creation with React-PDF
 */

import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { 
  IReportGenerationService,
  ReportData,
  ReportSection,
  PDFReportTemplate
} from './interfaces/IReportGenerationService';
import { ReportExportOptions, ExportResult } from './interfaces/IExportService';
import { AppError, ErrorType, ErrorSeverity } from '../utils/error-handling';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: 'bold'
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 15,
    color: '#34495e',
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 20,
    padding: 10
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    color: '#2c3e50',
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: '#34495e',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 24,
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#bdc3c7',
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 24,
    paddingHorizontal: 8
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center'
  },
  chart: {
    width: '100%',
    height: 300,
    marginVertical: 15
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 10
  },
  companyInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10
  },
  metricLabel: {
    fontSize: 12,
    color: '#2c3e50'
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27ae60'
  }
});

export class ReportGenerationService implements IReportGenerationService {

  async generatePDFReport(data: ReportData, options: ReportExportOptions): Promise<ExportResult> {
    try {
      const template = this.getTemplateByName(options.template);
      const sections = this.generateReportSections(data, template);
      
      const MyDocument = () => (
        React.createElement(Document, null,
          React.createElement(Page, { size: 'A4', style: styles.page },
            React.createElement(Text, { style: styles.header }, 
              `Financial Report - ${options.template === 'executive-summary' ? 'Executive Summary' : 'Detailed Analysis'}`
            ),
            
            options.companyInfo?.name && React.createElement(View, { style: styles.companyInfo },
              React.createElement(Text, { style: styles.text }, 
                `Company: ${options.companyInfo.name}`
              ),
              options.companyInfo.address && React.createElement(Text, { style: styles.text }, 
                `Address: ${options.companyInfo.address}`
              )
            ),
            
            options.reportPeriod && React.createElement(View, { style: styles.section },
              React.createElement(Text, { style: styles.text }, 
                `Report Period: ${options.reportPeriod.start} to ${options.reportPeriod.end}`
              )
            ),
            
            React.createElement(View, { style: styles.section },
              React.createElement(Text, { style: styles.subHeader }, 'Key Financial Metrics'),
              React.createElement(View, { style: styles.metric },
                React.createElement(Text, { style: styles.metricLabel }, 'Total Revenue:'),
                React.createElement(Text, { style: styles.metricValue }, 
                  this.formatCurrency(data.metrics.summaryStats.totalRevenue)
                )
              ),
              React.createElement(View, { style: styles.metric },
                React.createElement(Text, { style: styles.metricLabel }, 'Total Expenses:'),
                React.createElement(Text, { style: styles.metricValue }, 
                  this.formatCurrency(data.metrics.summaryStats.totalExpenses)
                )
              ),
              React.createElement(View, { style: styles.metric },
                React.createElement(Text, { style: styles.metricLabel }, 'Average Margin:'),
                React.createElement(Text, { style: styles.metricValue }, 
                  `${data.metrics.summaryStats.averageMargin.toFixed(2)}%`
                )
              ),
              React.createElement(View, { style: styles.metric },
                React.createElement(Text, { style: styles.metricLabel }, 'Profitability Trend:'),
                React.createElement(Text, { style: styles.metricValue }, 
                  data.metrics.healthIndicators.profitabilityTrend.toUpperCase()
                )
              )
            ),
            
            options.includeCharts && data.chartImages && React.createElement(View, { style: styles.section },
              React.createElement(Text, { style: styles.subHeader }, 'Financial Charts'),
              data.chartImages.revenueChart && React.createElement(Image, {
                style: styles.chart,
                src: data.chartImages.revenueChart
              }),
              data.chartImages.profitChart && React.createElement(Image, {
                style: styles.chart,
                src: data.chartImages.profitChart
              })
            ),
            
            options.includeRawData && React.createElement(View, { style: styles.section },
              React.createElement(Text, { style: styles.subHeader }, 'Financial Data'),
              React.createElement(View, { style: styles.tableHeader },
                React.createElement(Text, { style: styles.tableCell }, 'Date'),
                React.createElement(Text, { style: styles.tableCell }, 'Revenue'),
                React.createElement(Text, { style: styles.tableCell }, 'Expenses'),
                React.createElement(Text, { style: styles.tableCell }, 'Profit')
              ),
              ...data.financialData.slice(0, 10).map((row, index) =>
                React.createElement(View, { key: index, style: styles.tableRow },
                  React.createElement(Text, { style: styles.tableCell }, row.date),
                  React.createElement(Text, { style: styles.tableCell }, 
                    this.formatCurrency(row.revenue)
                  ),
                  React.createElement(Text, { style: styles.tableCell }, 
                    this.formatCurrency(row.expenses)
                  ),
                  React.createElement(Text, { style: styles.tableCell }, 
                    this.formatCurrency(row.revenue - row.expenses)
                  )
                )
              )
            ),
            
            React.createElement(Text, { style: styles.footer }, 
              `Generated on ${data.generatedAt.toLocaleDateString()} - Financial Dashboard Report`
            )
          )
        )
      );

      const pdfBlob = await pdf(React.createElement(MyDocument)).toBlob();
      const filename = options.filename || `financial-report-${Date.now()}.pdf`;
      
      saveAs(pdfBlob, filename);

      return {
        success: true,
        filename,
        size: pdfBlob.size,
        format: 'pdf',
        timestamp: new Date()
      };

    } catch (error) {
      throw new AppError(
        `Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorType.FILE_PROCESSING_ERROR,
        ErrorSeverity.HIGH,
        true,
        'Unable to generate the PDF report. Please try again or contact support.'
      );
    }
  }

  getAvailableTemplates(): PDFReportTemplate[] {
    return [
      {
        name: 'executive-summary',
        sections: [
          {
            title: 'Executive Summary',
            content: 'High-level overview of financial performance',
            order: 1
          },
          {
            title: 'Key Metrics',
            content: 'Essential financial indicators and trends',
            order: 2
          },
          {
            title: 'Charts',
            content: 'Visual representation of financial data',
            order: 3
          }
        ],
        styling: {
          headerColor: '#2c3e50',
          accentColor: '#3498db',
          font: 'Helvetica'
        }
      },
      {
        name: 'detailed-analysis',
        sections: [
          {
            title: 'Financial Overview',
            content: 'Comprehensive analysis of financial data',
            order: 1
          },
          {
            title: 'Detailed Metrics',
            content: 'In-depth financial indicators and calculations',
            order: 2
          },
          {
            title: 'Data Tables',
            content: 'Complete financial data breakdown',
            order: 3
          },
          {
            title: 'Charts and Visualizations',
            content: 'Comprehensive visual analysis',
            order: 4
          }
        ],
        styling: {
          headerColor: '#27ae60',
          accentColor: '#2ecc71',
          font: 'Helvetica'
        }
      }
    ];
  }

  async previewReport(
    data: ReportData, 
    template: PDFReportTemplate
  ): Promise<{ pageCount: number; sections: string[]; estimatedSize: number }> {
    const sections = this.generateReportSections(data, template);
    
    let estimatedSize = 50000;
    estimatedSize += data.financialData.length * 200;
    if (data.chartImages) {
      estimatedSize += Object.keys(data.chartImages).length * 100000;
    }

    return {
      pageCount: Math.ceil(sections.length / 3),
      sections: sections.map(s => s.title),
      estimatedSize
    };
  }

  generateReportSections(data: ReportData, template: PDFReportTemplate): ReportSection[] {
    return template.sections.map(section => ({
      ...section,
      content: this.generateSectionContent(section.title, data),
      charts: data.chartImages ? Object.values(data.chartImages).filter(Boolean) : undefined
    })).sort((a, b) => a.order - b.order);
  }

  private getTemplateByName(templateName: string): PDFReportTemplate {
    const templates = this.getAvailableTemplates();
    const template = templates.find(t => t.name === templateName);
    
    if (!template) {
      return templates[0];
    }
    
    return template;
  }

  private generateSectionContent(sectionTitle: string, data: ReportData): string {
    switch (sectionTitle.toLowerCase()) {
      case 'executive summary':
        return this.generateExecutiveSummary(data);
      case 'key metrics':
        return this.generateKeyMetrics(data);
      case 'detailed metrics':
        return this.generateDetailedMetrics(data);
      default:
        return `Content for ${sectionTitle} section`;
    }
  }

  private generateExecutiveSummary(data: ReportData): string {
    const { totalRevenue, totalExpenses, averageMargin } = data.metrics.summaryStats;
    const profit = totalRevenue - totalExpenses;
    
    return `
      This report provides a comprehensive analysis of financial performance for the specified period.
      
      Key highlights:
      • Total Revenue: ${this.formatCurrency(totalRevenue)}
      • Total Expenses: ${this.formatCurrency(totalExpenses)}
      • Net Profit: ${this.formatCurrency(profit)}
      • Average Margin: ${averageMargin.toFixed(2)}%
      
      The company shows a ${data.metrics.healthIndicators.profitabilityTrend} profitability trend
      with ${data.metrics.healthIndicators.revenueConsistency.toFixed(2)}% revenue consistency.
    `;
  }

  private generateKeyMetrics(data: ReportData): string {
    return `
      Financial Performance Indicators:
      
      Revenue Performance: ${data.metrics.summaryStats.totalRevenue > 0 ? 'Positive' : 'Needs Attention'}
      Expense Control: ${data.metrics.healthIndicators.expenseVolatility < 0.5 ? 'Well Controlled' : 'High Volatility'}
      Profitability: ${data.metrics.summaryStats.averageMargin > 0 ? 'Profitable' : 'Loss Making'}
      
      Data Quality: ${data.metrics.summaryStats.dataPoints} data points analyzed
    `;
  }

  private generateDetailedMetrics(data: ReportData): string {
    const { summaryStats, healthIndicators } = data.metrics;
    
    return `
      Detailed Financial Analysis:
      
      Revenue Analysis:
      • Total Revenue: ${this.formatCurrency(summaryStats.totalRevenue)}
      • Revenue Consistency: ${healthIndicators.revenueConsistency.toFixed(2)}%
      
      Expense Analysis:
      • Total Expenses: ${this.formatCurrency(summaryStats.totalExpenses)}
      • Expense Volatility: ${healthIndicators.expenseVolatility.toFixed(2)}%
      
      Profitability Analysis:
      • Average Margin: ${summaryStats.averageMargin.toFixed(2)}%
      • Trend: ${healthIndicators.profitabilityTrend}
      
      Data Coverage: ${summaryStats.dataPoints} periods analyzed
    `;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
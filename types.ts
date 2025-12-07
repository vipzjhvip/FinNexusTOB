export enum InvoiceStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  VOID = 'Void'
}

export enum InvoiceType {
  VAT_SPECIAL = 'VAT Special',
  VAT_NORMAL = 'VAT Normal',
  GENERAL = 'General'
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientName: string;
  amount: number;
  taxAmount: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  type: InvoiceType;
}

export interface FinancialMetric {
  name: string;
  value: number;
  change: number; // Percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  name: string;
  income: number;
  expense: number;
  profit: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}
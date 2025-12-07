export enum InvoiceStatus {
  DRAFT = '草稿',
  PENDING = '待处理',
  PAID = '已付款',
  OVERDUE = '逾期',
  VOID = '作废'
}

export enum InvoiceType {
  VAT_SPECIAL = '增值税专票',
  VAT_NORMAL = '增值税普票',
  GENERAL = '通用发票'
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientName: string; // Generally treated as the "Counterparty"
  buyerName?: string;
  buyerTaxId?: string;
  sellerName?: string;
  sellerTaxId?: string;
  amount: number;
  taxAmount: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  type: InvoiceType;
  items?: InvoiceItem[];
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
import { Invoice, InvoiceStatus, InvoiceType, ChartDataPoint, FinancialMetric } from './types';

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNo: '20231001-01',
    clientName: 'Acme Corp',
    amount: 15000.00,
    taxAmount: 1350.00,
    date: '2023-10-01',
    dueDate: '2023-10-31',
    status: InvoiceStatus.PAID,
    type: InvoiceType.VAT_SPECIAL
  },
  {
    id: 'INV-002',
    invoiceNo: '20231005-02',
    clientName: 'Globex Inc',
    amount: 4200.50,
    taxAmount: 378.05,
    date: '2023-10-05',
    dueDate: '2023-11-04',
    status: InvoiceStatus.PENDING,
    type: InvoiceType.VAT_NORMAL
  },
  {
    id: 'INV-003',
    invoiceNo: '20231012-03',
    clientName: 'Soylent Corp',
    amount: 8500.00,
    taxAmount: 765.00,
    date: '2023-10-12',
    dueDate: '2023-11-11',
    status: InvoiceStatus.OVERDUE,
    type: InvoiceType.VAT_SPECIAL
  },
  {
    id: 'INV-004',
    invoiceNo: '20231015-04',
    clientName: 'Umbrella Corp',
    amount: 12000.00,
    taxAmount: 1080.00,
    date: '2023-10-15',
    dueDate: '2023-11-14',
    status: InvoiceStatus.DRAFT,
    type: InvoiceType.GENERAL
  },
  {
    id: 'INV-005',
    invoiceNo: '20231020-05',
    clientName: 'Stark Ind',
    amount: 50000.00,
    taxAmount: 4500.00,
    date: '2023-10-20',
    dueDate: '2023-11-19',
    status: InvoiceStatus.PAID,
    type: InvoiceType.VAT_SPECIAL
  },
];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { name: 'Jan', income: 4000, expense: 2400, profit: 1600 },
  { name: 'Feb', income: 3000, expense: 1398, profit: 1602 },
  { name: 'Mar', income: 2000, expense: 9800, profit: -7800 },
  { name: 'Apr', income: 2780, expense: 3908, profit: -1128 },
  { name: 'May', income: 1890, expense: 4800, profit: -2910 },
  { name: 'Jun', income: 2390, expense: 3800, profit: -1410 },
  { name: 'Jul', income: 3490, expense: 4300, profit: -810 },
  { name: 'Aug', income: 8000, expense: 2400, profit: 5600 },
  { name: 'Sep', income: 9500, expense: 2800, profit: 6700 },
  { name: 'Oct', income: 11000, expense: 3200, profit: 7800 },
];

export const MOCK_METRICS: FinancialMetric[] = [
  { name: 'Total Revenue', value: 128500.00, change: 12.5, trend: 'up' },
  { name: 'Total Expenses', value: 43200.00, change: -5.2, trend: 'down' }, // down expense is good
  { name: 'Net Profit', value: 85300.00, change: 24.8, trend: 'up' },
  { name: 'Outstanding', value: 12700.50, change: 2.1, trend: 'up' }, // up outstanding is bad usually
];

export const SYSTEM_INSTRUCTION = `
You are FinAI, an expert financial assistant for a B2B SaaS platform. 
You have access to the user's current financial data (provided in the prompt context).
Your goal is to help the user understand their financial health, analyze trends, and provide tax-related advice based on general accounting principles.
- Be concise, professional, and helpful.
- If asked about specific invoices, refer to the data provided.
- If asked about tax regulations, provide general advice but disclaim that you are an AI.
- Format numbers as currency (e.g., $1,234.56).
`;
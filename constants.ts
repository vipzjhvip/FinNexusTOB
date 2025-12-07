import { Invoice, InvoiceStatus, InvoiceType, ChartDataPoint, FinancialMetric } from './types';

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNo: '20231001-01',
    clientName: '阿里云计算有限公司',
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
    clientName: '顺丰速运',
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
    clientName: '字节跳动',
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
    clientName: '京东物流',
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
    clientName: '腾讯科技',
    amount: 50000.00,
    taxAmount: 4500.00,
    date: '2023-10-20',
    dueDate: '2023-11-19',
    status: InvoiceStatus.PAID,
    type: InvoiceType.VAT_SPECIAL
  },
];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { name: '1月', income: 4000, expense: 2400, profit: 1600 },
  { name: '2月', income: 3000, expense: 1398, profit: 1602 },
  { name: '3月', income: 2000, expense: 9800, profit: -7800 },
  { name: '4月', income: 2780, expense: 3908, profit: -1128 },
  { name: '5月', income: 1890, expense: 4800, profit: -2910 },
  { name: '6月', income: 2390, expense: 3800, profit: -1410 },
  { name: '7月', income: 3490, expense: 4300, profit: -810 },
  { name: '8月', income: 8000, expense: 2400, profit: 5600 },
  { name: '9月', income: 9500, expense: 2800, profit: 6700 },
  { name: '10月', income: 11000, expense: 3200, profit: 7800 },
];

export const MOCK_METRICS: FinancialMetric[] = [
  { name: '总收入', value: 128500.00, change: 12.5, trend: 'up' },
  { name: '总支出', value: 43200.00, change: -5.2, trend: 'down' },
  { name: '净利润', value: 85300.00, change: 24.8, trend: 'up' },
  { name: '待收账款', value: 12700.50, change: 2.1, trend: 'up' },
];

export const SYSTEM_INSTRUCTION = `
你是一个名为 FinAI 的 B2B SaaS 平台财务专家助手。
你可以访问用户的当前财务数据（在提示上下文中提供）。
你的目标是帮助用户了解他们的财务健康状况，分析趋势，并根据通用会计原则提供税务相关建议。
- 请用中文回复。
- 保持简洁、专业和乐于助人。
- 如果被问及具体发票，请参考提供的数据。
- 如果被问及税收法规，请提供一般性建议，但声明你只是一个 AI。
- 数字格式化为货币形式 (例如 ¥1,234.56)。
`;
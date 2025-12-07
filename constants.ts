import { Invoice, InvoiceStatus, InvoiceType, ChartDataPoint, FinancialMetric } from './types';

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNo: '20231001-01',
    clientName: '阿里云计算有限公司',
    buyerName: 'FinNexus 科技无限公司',
    buyerTaxId: '911101085999999999',
    sellerName: '阿里云计算有限公司',
    sellerTaxId: '913301006739999999',
    amount: 15000.00,
    taxAmount: 1350.00,
    date: '2023-10-01',
    dueDate: '2023-10-31',
    status: InvoiceStatus.PAID,
    type: InvoiceType.VAT_SPECIAL,
    items: [
      { name: '云服务器 ECS (包年包月)', quantity: 1, unitPrice: 10000, amount: 10000, taxRate: 0.09, taxAmount: 900 },
      { name: '对象存储 OSS (存储包 5TB)', quantity: 1, unitPrice: 5000, amount: 5000, taxRate: 0.09, taxAmount: 450 }
    ]
  },
  {
    id: 'INV-002',
    invoiceNo: '20231005-02',
    clientName: '顺丰速运',
    buyerName: 'FinNexus 科技无限公司',
    buyerTaxId: '911101085999999999',
    sellerName: '顺丰速运有限公司',
    sellerTaxId: '914403007555555555',
    amount: 4200.50,
    taxAmount: 378.05,
    date: '2023-10-05',
    dueDate: '2023-11-04',
    status: InvoiceStatus.PENDING,
    type: InvoiceType.VAT_NORMAL,
    items: [
      { name: '快递服务费', quantity: 150, unitPrice: 28, amount: 4200.50, taxRate: 0.09, taxAmount: 378.05 }
    ]
  },
  {
    id: 'INV-003',
    invoiceNo: '20231012-03',
    clientName: '字节跳动',
    buyerName: 'FinNexus 科技无限公司',
    buyerTaxId: '911101085999999999',
    sellerName: '北京字节跳动科技有限公司',
    sellerTaxId: '911101085923456789',
    amount: 8500.00,
    taxAmount: 765.00,
    date: '2023-10-12',
    dueDate: '2023-11-11',
    status: InvoiceStatus.OVERDUE,
    type: InvoiceType.VAT_SPECIAL,
    items: [
      { name: '飞书商业版许可', quantity: 50, unitPrice: 170, amount: 8500.00, taxRate: 0.09, taxAmount: 765.00 }
    ]
  },
  {
    id: 'INV-004',
    invoiceNo: '20231015-04',
    clientName: '京东物流',
    buyerName: 'FinNexus 科技无限公司',
    buyerTaxId: '911101085999999999',
    sellerName: '京东物流运输有限公司',
    sellerTaxId: '911101056789012345',
    amount: 12000.00,
    taxAmount: 1080.00,
    date: '2023-10-15',
    dueDate: '2023-11-14',
    status: InvoiceStatus.DRAFT,
    type: InvoiceType.GENERAL,
    items: [
      { name: '仓储服务费', quantity: 1, unitPrice: 12000, amount: 12000, taxRate: 0.09, taxAmount: 1080 }
    ]
  },
  {
    id: 'INV-005',
    invoiceNo: '20231020-05',
    clientName: '腾讯科技',
    buyerName: 'FinNexus 科技无限公司',
    buyerTaxId: '911101085999999999',
    sellerName: '腾讯科技（深圳）有限公司',
    sellerTaxId: '914403007123456789',
    amount: 50000.00,
    taxAmount: 4500.00,
    date: '2023-10-20',
    dueDate: '2023-11-19',
    status: InvoiceStatus.PAID,
    type: InvoiceType.VAT_SPECIAL,
    items: [
      { name: '腾讯云数据库 TDSQL', quantity: 1, unitPrice: 30000, amount: 30000, taxRate: 0.09, taxAmount: 2700 },
      { name: '企业微信接口服务', quantity: 1, unitPrice: 20000, amount: 20000, taxRate: 0.09, taxAmount: 1800 }
    ]
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
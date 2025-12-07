import React, { useState, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  FileCheck,
  AlertCircle,
  Loader2,
  X,
  Check,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Invoice, InvoiceStatus, InvoiceType } from '../types';
import { extractInvoiceData } from '../services/geminiService';

interface InvoiceListProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onAddInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  
  // OCR & Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<Partial<Invoice>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Error/Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '全部' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-800 border-green-200';
      case InvoiceStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-800 border-red-200';
      case InvoiceStatus.DRAFT: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(',')[1];
        const mimeType = file.type;
        
        if (base64Data) {
          try {
            const extracted = await extractInvoiceData(base64Data, mimeType);
            
            // Populate review data with extracted values or defaults
            setReviewData({
              id: `INV-${Date.now()}`,
              invoiceNo: extracted.invoiceNo || '',
              clientName: extracted.clientName || '',
              amount: extracted.amount || 0,
              taxAmount: extracted.taxAmount || 0,
              date: extracted.date || new Date().toISOString().split('T')[0],
              dueDate: extracted.dueDate || new Date().toISOString().split('T')[0],
              status: InvoiceStatus.DRAFT,
              type: InvoiceType.GENERAL,
              // Default empty for extended fields as OCR currently implies basic
              items: [],
              buyerName: '本公司',
              sellerName: extracted.clientName || '',
            });
            setErrors({}); // Clear any previous errors
            setShowReviewModal(true);
          } catch (error) {
            alert("发票处理失败，请重试。");
          }
        }
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert("读取文件错误。");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!reviewData.invoiceNo?.trim()) {
      newErrors.invoiceNo = '发票号码不能为空';
      isValid = false;
    }
    if (!reviewData.clientName?.trim()) {
      newErrors.clientName = '客户名称不能为空';
      isValid = false;
    }
    if ((reviewData.amount || 0) <= 0) {
      newErrors.amount = '金额必须大于0';
      isValid = false;
    }
    if ((reviewData.taxAmount || 0) < 0) {
      newErrors.taxAmount = '税额不能为负数';
      isValid = false;
    }
    if (!reviewData.date) {
      newErrors.date = '开票日期不能为空';
      isValid = false;
    }
    if (!reviewData.dueDate) {
      newErrors.dueDate = '到期日不能为空';
      isValid = false;
    }
    
    // Check due date is after or same as issue date
    if (reviewData.date && reviewData.dueDate && new Date(reviewData.dueDate) < new Date(reviewData.date)) {
      newErrors.dueDate = '到期日不能早于开票日期';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveInvoice = () => {
    if (validateForm()) {
      onAddInvoice(reviewData as Invoice);
      setShowReviewModal(false);
      setReviewData({});
      setErrors({});
    }
  };

  const handleReviewChange = (field: keyof Invoice, value: any) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear specific error when user types
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Helper to check if invoice is due soon (within 7 days) and not paid
  const isDueSoon = (invoice: Invoice) => {
    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.VOID || invoice.status === InvoiceStatus.DRAFT) return false;
    
    const today = new Date();
    const due = new Date(invoice.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">发票管理</h2>
          <p className="text-sm text-slate-500 mt-1">管理进项和销项发票</p>
        </div>
        <div className="flex gap-3">
           {/* File Upload */}
           <label className={`
             cursor-pointer bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium 
             hover:bg-slate-50 flex items-center shadow-sm transition-colors
             ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
           `}>
             {isUploading ? (
               <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
             ) : (
               <Download className="w-4 h-4 mr-2" />
             )}
             {isUploading ? '识别中...' : 'OCR 导入发票'}
             <input 
               ref={fileInputRef}
               type="file" 
               accept="image/*,application/pdf"
               className="hidden" 
               onChange={handleFileUpload}
               disabled={isUploading}
             />
           </label>
           
           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm">
             <Plus className="w-4 h-4 mr-2" />
             新建发票
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="搜索发票号或客户..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-slate-400 h-4 w-4" />
          <select 
            className="border border-slate-300 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="全部">全部状态</option>
            {Object.values(InvoiceStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  发票号码
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  客户/供应商
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  金额
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  税额
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredInvoices.map((inv) => (
                <React.Fragment key={inv.id}>
                  <tr 
                    className={`
                      transition-all duration-200 ease-in-out cursor-pointer
                      hover:bg-blue-50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:relative hover:z-10
                      ${expandedInvoiceId === inv.id ? 'bg-blue-50/50' : 'bg-white'}
                    `}
                    onClick={() => toggleExpand(inv.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {inv.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      开票: {inv.date} <br/>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">到期: {inv.dueDate}</span>
                        {isDueSoon(inv) && (
                          <div className="flex items-center text-orange-500" title="7天内到期">
                            <AlertTriangle className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      ¥{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      ¥{inv.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(inv.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 ml-auto"
                      >
                        {expandedInvoiceId === inv.id ? (
                           <>收起 <ChevronUp className="h-4 w-4" /></>
                        ) : (
                           <>查看详情 <ChevronDown className="h-4 w-4" /></>
                        )}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expandable Detail Row */}
                  {expandedInvoiceId === inv.id && (
                    <tr className="bg-slate-50/60 shadow-inner">
                      <td colSpan={7} className="p-0 border-b border-slate-200">
                         <div className="overflow-hidden animate-expand-detail">
                            <div className="p-6">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                                       销售方信息
                                     </h4>
                                     <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-900">{inv.sellerName || inv.clientName || '-'}</p>
                                        <p className="text-sm text-slate-500"><span className="text-slate-400 mr-2">税号:</span>{inv.sellerTaxId || '-'}</p>
                                     </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                                       购买方信息
                                     </h4>
                                     <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-900">{inv.buyerName || '本公司'}</p>
                                        <p className="text-sm text-slate-500"><span className="text-slate-400 mr-2">税号:</span>{inv.buyerTaxId || '-'}</p>
                                     </div>
                                  </div>
                               </div>
                               
                               {/* Items Table */}
                               <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                  <table className="min-w-full divide-y divide-slate-200">
                                     <thead className="bg-slate-100">
                                        <tr>
                                           <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">货物或应税劳务名称</th>
                                           <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">数量</th>
                                           <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">单价</th>
                                           <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">金额</th>
                                           <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">税率</th>
                                           <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">税额</th>
                                        </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-200">
                                        {inv.items && inv.items.length > 0 ? (
                                          inv.items.map((item, idx) => (
                                             <tr key={idx}>
                                                <td className="px-4 py-2 text-sm text-slate-900">{item.name}</td>
                                                <td className="px-4 py-2 text-sm text-slate-500 text-right">{item.quantity}</td>
                                                <td className="px-4 py-2 text-sm text-slate-500 text-right">¥{item.unitPrice.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-sm text-slate-500 text-right">¥{item.amount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-sm text-slate-500 text-right">{(item.taxRate * 100).toFixed(0)}%</td>
                                                <td className="px-4 py-2 text-sm text-slate-500 text-right">¥{item.taxAmount.toLocaleString()}</td>
                                             </tr>
                                          ))
                                        ) : (
                                           <tr>
                                             <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                                               无明细数据
                                             </td>
                                           </tr>
                                        )}
                                     </tbody>
                                  </table>
                               </div>
                            </div>
                         </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredInvoices.length === 0 && (
                 <tr>
                   <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                     <div className="flex flex-col items-center justify-center">
                       <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
                       <p>未找到符合条件的发票。</p>
                     </div>
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                复核识别结果
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">发票号码 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={reviewData.invoiceNo || ''} 
                    onChange={(e) => handleReviewChange('invoiceNo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.invoiceNo ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {errors.invoiceNo && <p className="text-xs text-red-500 mt-1">{errors.invoiceNo}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">客户名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={reviewData.clientName || ''} 
                    onChange={(e) => handleReviewChange('clientName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.clientName ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">金额 <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={reviewData.amount || 0} 
                    onChange={(e) => handleReviewChange('amount', parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.amount ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">税额</label>
                  <input 
                    type="number" 
                    value={reviewData.taxAmount || 0} 
                    onChange={(e) => handleReviewChange('taxAmount', parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.taxAmount ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {errors.taxAmount && <p className="text-xs text-red-500 mt-1">{errors.taxAmount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">开票日期 <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={reviewData.date || ''} 
                    onChange={(e) => handleReviewChange('date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.date ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">到期日 <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={reviewData.dueDate || ''} 
                    onChange={(e) => handleReviewChange('dueDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.dueDate ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">发票类型</label>
                <select 
                  value={reviewData.type || InvoiceType.GENERAL}
                  onChange={(e) => handleReviewChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {Object.values(InvoiceType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="p-6 pt-2 flex gap-3">
              <button 
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveInvoice}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
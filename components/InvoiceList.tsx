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
  Check
} from 'lucide-react';
import { Invoice, InvoiceStatus, InvoiceType } from '../types';
import { extractInvoiceData } from '../services/geminiService';

interface InvoiceListProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onAddInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // OCR & Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<Partial<Invoice>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
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
              type: InvoiceType.GENERAL
            });
            setShowReviewModal(true);
          } catch (error) {
            alert("Failed to process invoice. Please try again.");
          }
        }
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert("Error reading file.");
    }
  };

  const handleSaveInvoice = () => {
    onAddInvoice(reviewData as Invoice);
    setShowReviewModal(false);
    setReviewData({});
  };

  const handleReviewChange = (field: keyof Invoice, value: any) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
          <p className="text-sm text-slate-500 mt-1">Manage incoming and outgoing invoices</p>
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
             {isUploading ? 'Processing...' : 'Import OCR'}
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
             Create Invoice
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search invoice # or client..." 
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
            <option value="All">All Status</option>
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
                  Invoice No.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tax
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {inv.invoiceNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {inv.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    Issued: {inv.date} <br/>
                    <span className="text-xs">Due: {inv.dueDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    ${inv.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                 <tr>
                   <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                     <div className="flex flex-col items-center justify-center">
                       <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
                       <p>No invoices found matching your criteria.</p>
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
                Review Extracted Data
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Invoice No</label>
                  <input 
                    type="text" 
                    value={reviewData.invoiceNo || ''} 
                    onChange={(e) => handleReviewChange('invoiceNo', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Client Name</label>
                  <input 
                    type="text" 
                    value={reviewData.clientName || ''} 
                    onChange={(e) => handleReviewChange('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount</label>
                  <input 
                    type="number" 
                    value={reviewData.amount || 0} 
                    onChange={(e) => handleReviewChange('amount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tax Amount</label>
                  <input 
                    type="number" 
                    value={reviewData.taxAmount || 0} 
                    onChange={(e) => handleReviewChange('taxAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Issue Date</label>
                  <input 
                    type="date" 
                    value={reviewData.date || ''} 
                    onChange={(e) => handleReviewChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={reviewData.dueDate || ''} 
                    onChange={(e) => handleReviewChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
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
                Cancel
              </button>
              <button 
                onClick={handleSaveInvoice}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
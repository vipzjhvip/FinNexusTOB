import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import InvoiceList from './components/InvoiceList';
import AIAssistant from './components/AIAssistant';
import { Menu } from 'lucide-react';
import { MOCK_INVOICES, MOCK_CHART_DATA, MOCK_METRICS } from './constants';
import { Invoice } from './types';

const App: React.FC = () => {
  // Simple state-based routing instead of HashRouter to keep it entirely self-contained without external router deps for this demo,
  // though prompts allows HashRouter, state routing is often cleaner for these "All-in-one" code demos.
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State for invoices to allow adding new ones via OCR
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
  };

  // We pass this context to the AI
  const appData = {
    metrics: MOCK_METRICS,
    invoices: invoices,
    charts: MOCK_CHART_DATA
  };

  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardHome metrics={MOCK_METRICS} chartData={MOCK_CHART_DATA} />;
      case 'invoices':
        return <InvoiceList invoices={invoices} onAddInvoice={handleAddInvoice} />;
      case 'ai-assistant':
        return <AIAssistant contextData={appData} />;
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <p className="text-xl font-medium">Reports Module</p>
            <p className="text-sm">Under development for this demo.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <p className="text-xl font-medium">Settings</p>
            <p className="text-sm">Configure Tenant, Users, and Roles here.</p>
          </div>
        );
      default:
        return <DashboardHome metrics={MOCK_METRICS} chartData={MOCK_CHART_DATA} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar 
        currentRoute={currentRoute} 
        onChangeRoute={(route) => {
          setCurrentRoute(route);
          setIsSidebarOpen(false); // Close mobile sidebar on navigate
        }}
        isOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center px-4 justify-between z-40">
           <span className="font-bold text-lg text-slate-800">FinNexus</span>
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
           >
             <Menu className="w-6 h-6" />
           </button>
        </header>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
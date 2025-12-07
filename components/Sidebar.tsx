import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PieChart, 
  Settings, 
  Bot, 
  LogOut,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onChangeRoute: (route: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onChangeRoute, isOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices & Tax', icon: FileText },
    { id: 'reports', label: 'Financial Reports', icon: PieChart },
    { id: 'ai-assistant', label: 'AI Financial Insight', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <Building2 className="w-8 h-8 text-blue-400 mr-2" />
          <span className="text-xl font-bold tracking-tight">FinNexus</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeRoute(item.id)}
                className={`
                  w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
              JD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-slate-400">Admin</p>
            </div>
          </div>
          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-slate-800 rounded-md">
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
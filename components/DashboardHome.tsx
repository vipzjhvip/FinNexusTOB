import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard 
} from 'lucide-react';
import { ChartDataPoint, FinancialMetric } from '../types';

interface DashboardHomeProps {
  metrics: FinancialMetric[];
  chartData: ChartDataPoint[];
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ metrics, chartData }) => {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-900">财务总览</h2>
        <p className="text-sm text-slate-500">实时数据 • 最后同步: 2 分钟前</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const isPositive = metric.trend === 'up';
          // Logic: "Expenses" going up is bad (red), "Revenue" going up is good (green)
          const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          let Icon = DollarSign;
          if (index === 1) Icon = CreditCard;
          
          return (
            <div key={metric.name} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">{metric.name}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    ¥{metric.value.toLocaleString()}
                  </h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendIcon className={`w-4 h-4 mr-1 ${trendColor}`} />
                <span className={`text-sm font-medium ${trendColor}`}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-sm text-slate-400 ml-2">环比上月</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">现金流分析</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `¥${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [`¥${value}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="收入" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="支出" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">净利润</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: '#f1f5f9'}}
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                   formatter={(value: number) => [`¥${value}`, '']}
                />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="利润" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
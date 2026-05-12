import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Calendar,
  DollarSign,
  Download,
  Filter,
  Plus,
  Users,
  PieChart,
  Zap,
  Box,
  Construction,
  Wallet
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

import { PermissionGate } from '../../components/admin/PermissionGate';

const paymentHistory = [
  { id: '1', recipient: 'Ahmed Hassan', amount: 3200, date: '2026-05-08', type: 'Labor Salary', status: 'Completed' },
  { id: '2', recipient: 'Concrete Supplies Inc', amount: 15400, date: '2026-05-07', type: 'Materials', status: 'Processing' },
  { id: '3', recipient: 'Elite Electricals', amount: 4800, date: '2026-05-06', type: 'Subcontractor', status: 'Completed' },
  { id: '4', recipient: 'John Doe', amount: 2900, date: '2026-05-05', type: 'Labor Salary', status: 'Completed' },
];

const categoryData = [
  { name: 'Labor', value: 42000, color: '#ea580c' },
  { name: 'Materials', value: 18500, color: '#2563eb' },
  { name: 'Utilities', value: 4800, color: '#9333ea' },
];

const chartData = [
  { name: 'Mon', amount: 12000 },
  { name: 'Tue', amount: 18000 },
  { name: 'Wed', amount: 15000 },
  { name: 'Thu', amount: 24000 },
  { name: 'Fri', amount: 32000 },
  { name: 'Sat', amount: 9000 },
  { name: 'Sun', amount: 4000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-gray-700 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
        <p className="text-sm font-black text-white">{payload[0].value.toLocaleString()} FCFA</p>
        <p className="text-[8px] text-orange-600 font-bold uppercase tracking-widest mt-1">Transaction Volume: High</p>
      </div>
    );
  }
  return null;
};

export default function AdminPayments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState(paymentHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredPayments = payments.filter(p => 
    p.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Recipient', 'Amount', 'Date', 'Type', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(p => [
        p.id,
        `"${p.recipient}"`,
        p.amount,
        p.date,
        `"${p.type}"`,
        p.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MADECC_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Payment transaction recorded in ledger.');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Financial Ledger</h2>
          <p className="text-gray-400 mt-1">Track labor costs, material payments, and overhead.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl font-bold uppercase tracking-widest text-xs hover:text-white transition-all shadow-md active:scale-95"
          >
            <Download size={16} />
            Export CSV
          </button>
        <PermissionGate allowedRoles={['CEO', 'FINANCIAL_OFFICER', 'ACCOUNTANT']}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
          >
            <Plus size={18} />
            Record Payment
          </button>
        </PermissionGate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance & Monthly Breakdown */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-8 rounded-3xl text-white shadow-xl shadow-orange-600/20 outline outline-4 outline-orange-600/10 flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Wallet size={24} />
                </div>
                <img src="/logo.png" alt="MADECC" className="h-8 w-auto brightness-0 invert opacity-50" />
              </div>
              <p className="text-orange-100 text-[10px] uppercase font-black tracking-[0.3em] mb-1">Corporate Balance</p>
              <p className="text-4xl font-black tracking-tighter mb-8">842,500.00 FCFA</p>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-200">
                <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                  <ArrowUpRight size={14} /> +12.5%
                </span>
                this quarter
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 text-white/5 group-hover:text-white/10 transition-colors">
              <Wallet size={180} />
            </div>
          </div>

          <div className="bg-black/40 border border-gray-800 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase text-gray-500 tracking-[0.2em]">Monthly Summary</h3>
                <span className="text-[9px] font-black text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">Oct 2026</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="w-full sm:w-1/2 h-[140px] relative">
                  {isMounted && (
                    <ResponsiveContainer width="99.9%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  {[
                    { label: 'Labor', amount: '42,000 FCFA', color: '#ea580c', icon: <Construction size={14} /> },
                    { label: 'Materials', amount: '18,500 FCFA', color: '#2563eb', icon: <Box size={14} /> },
                    { label: 'Utilities', amount: '4,800 FCFA', color: '#9333ea', icon: <Zap size={14} /> }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 group-hover:text-white transition-colors" style={{ color: item.color }}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-black text-white">{item.amount}</p>
                        </div>
                      </div>
                      <ArrowUpRight size={14} className="text-gray-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Outflow</p>
              <p className="text-xl font-black text-white">65,300 FCFA</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-black/40 border border-gray-800 p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase text-white tracking-widest">Weekly Outflow</h3>
            <select className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-orange-600">
              <option>7D</option>
              <option>30D</option>
            </select>
          </div>
          <div className="h-[200px] w-full relative">
            {isMounted && (
              <ResponsiveContainer width="99.9%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#ea580c" strokeWidth={3} dot={false} />
              </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black/40 border border-gray-800 rounded-3xl overflow-hidden">
         <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-black uppercase text-white tracking-widest">Transaction History</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search recipients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-all w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-8 py-5">Recipient</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Dated</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-orange-600/5 transition-colors cursor-pointer group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        {p.recipient.charAt(0)}
                      </div>
                      <span className="font-bold text-white text-sm">{p.recipient}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-white italic tracking-tight">-{p.amount.toLocaleString()} FCFA</span>
                  </td>
                  <td className="px-8 py-5 text-gray-500 text-xs font-medium">{p.date}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                      {p.type.includes('Labor') ? <Users size={12} /> : <CreditCard size={12} />}
                      {p.type}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded inline-block text-[9px] font-black uppercase tracking-widest ${
                      p.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-gray-900 border border-gray-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white uppercase italic mb-6">Record New Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Recipient</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                  placeholder="Employee or Supplier name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Amount (FCFA)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Category</label>
                  <select className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors appearance-none">
                    <option>Labor Salary</option>
                    <option>Materials</option>
                    <option>Subcontractor</option>
                    <option>Overhead</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Payment Date</label>
                <input 
                  required
                  type="date" 
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-orange-600 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-800 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all font-black"
                >
                  Execute Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

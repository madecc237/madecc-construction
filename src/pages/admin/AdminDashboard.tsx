import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  FileText, 
  Users, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  LayoutGrid,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

const monthlyData = [
  { name: 'Jan', costs: 45000, revenue: 65000, profit: 20000, efficiency: '88%' },
  { name: 'Feb', costs: 52000, revenue: 72000, profit: 20000, efficiency: '85%' },
  { name: 'Mar', costs: 48000, revenue: 68000, profit: 20000, efficiency: '91%' },
  { name: 'Apr', costs: 61000, revenue: 89000, profit: 28000, efficiency: '82%' },
  { name: 'May', costs: 55000, revenue: 78000, profit: 23000, efficiency: '89%' },
  { name: 'Jun', costs: 67000, revenue: 95000, profit: 28000, efficiency: '84%' },
];

const quarterlyData = [
  { name: 'Q1 2026', costs: 145000, revenue: 205000, profit: 60000, efficiency: '88%' },
  { name: 'Q2 2026', costs: 183000, revenue: 262000, profit: 79000, efficiency: '85%' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-gray-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs font-bold text-gray-400 capitalize">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-white">{entry.value.toLocaleString()} FCFA</span>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-8">
            <span className="text-[10px] font-black text-orange-600 uppercase">Gross Profit</span>
            <span className="text-xs font-black text-orange-600">
              {(payload[0].payload.revenue - payload[0].payload.costs).toLocaleString()} FCFA
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-[10px] font-black text-blue-500 uppercase">Efficiency</span>
            <span className="text-xs font-black text-blue-500">{payload[0].payload.efficiency}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const stats = [
  { label: 'Active Projects', value: '12', change: '+2', trend: 'up', icon: <Briefcase /> },
  { label: 'Contracts Value', value: '2.4M FCFA', change: '+12%', trend: 'up', icon: <FileText /> },
  { label: 'Total Workforce', value: '84', change: '+5', trend: 'up', icon: <Users /> },
  { label: 'Monthly Expenses', value: '67k FCFA', change: '-2%', trend: 'down', icon: <CreditCard /> },
];

export default function AdminDashboard() {
  const [filter, setFilter] = useState<'all' | '30days'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly'>('monthly');
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeDataBeforeFilter = timeframe === 'monthly' ? monthlyData : quarterlyData;
  const activeData = filter === 'all' ? activeDataBeforeFilter : activeDataBeforeFilter.slice(-3);

  const renderChart = () => {
    const commonProps = {
      data: activeData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k FCFA`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#ea580c" radius={[4, 4, 0, 0]} />
            <Bar dataKey="costs" fill="#4b5563" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k FCFA`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} dot={{ fill: '#ea580c', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="costs" stroke="#4b5563" strokeWidth={3} dot={{ fill: '#4b5563', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        );
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k FCFA`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#ea580c" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
            <Area type="monotone" dataKey="costs" stroke="#4b5563" fill="transparent" strokeWidth={3} strokeDasharray="5 5" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Management Terminal</h2>
          <p className="text-gray-400 mt-1">Holistic data aggregation from MADECC field operations.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-[10px] font-black rounded-lg uppercase tracking-widest transition-all ${
              filter === 'all' ? 'text-white bg-orange-600 shadow-lg shadow-orange-600/20' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Full Archive
          </button>
          <button 
            onClick={() => setFilter('30days')}
            className={`px-4 py-2 text-[10px] font-black rounded-lg uppercase tracking-widest transition-all ${
              filter === '30days' ? 'text-white bg-orange-600 shadow-lg shadow-orange-600/20' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Recent 30D
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/40 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-colors group relative overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="p-3 bg-gray-900 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all shadow-xl">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} bg-gray-900/50 px-2 py-1 rounded-full backdrop-blur-sm`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
              <p className="text-3xl font-black text-white mt-1 uppercase tracking-tighter italic">{stat.value}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-600/10 transition-colors"></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-black/40 border border-gray-800 p-8 rounded-3xl relative group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600/20 text-orange-600 rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-[0.2em] text-xs text-white">Financial Velocity</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Revenue vs Operational Costs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Timeframe Toggle */}
                <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800">
                  <button 
                    onClick={() => setTimeframe('monthly')}
                    className={`px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${
                      timeframe === 'monthly' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setTimeframe('quarterly')}
                    className={`px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${
                      timeframe === 'quarterly' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Quarterly
                  </button>
                </div>

                {/* Chart Type Toggle */}
                <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800">
                  <button 
                    onClick={() => setChartType('area')}
                    className={`p-1.5 rounded-lg transition-all ${
                      chartType === 'area' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                    title="Area Chart"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button 
                    onClick={() => setChartType('bar')}
                    className={`p-1.5 rounded-lg transition-all ${
                      chartType === 'bar' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                    title="Bar Chart"
                  >
                    <BarChart3 size={14} />
                  </button>
                  <button 
                    onClick={() => setChartType('line')}
                    className={`p-1.5 rounded-lg transition-all ${
                      chartType === 'line' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                    title="Line Chart"
                  >
                    <LineChartIcon size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full min-w-0 relative">
              {isMounted && (
                <ResponsiveContainer width="99.9%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Project Updates Section */}
          <div className="bg-black/40 border border-gray-800 p-8 rounded-3xl">
            <h3 className="font-black uppercase tracking-[0.2em] text-xs flex items-center gap-2 mb-8 text-white">
              <Clock size={16} className="text-orange-600" />
              Real-Time Project Feed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'District 9 Infrastructure', update: 'Foundation pouring complete', status: 'On Track', progress: 42, time: '2h ago' },
                { name: 'South Marina Bridge', update: 'Steel reinforcement inspection', status: 'Critical', progress: 18, time: '5h ago' },
                { name: 'Skyview Penthouse', update: 'Interior finishing phase started', status: 'Accelerated', progress: 88, time: 'Yesterday' },
                { name: 'Eco-Park Drainage', update: 'Environment permit approved', status: 'New', progress: 5, time: '2 days ago' }
              ].map((update, i) => (
                <div key={i} className="p-5 bg-gray-950/50 rounded-2xl border border-gray-800 hover:border-orange-600/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-white font-black text-sm tracking-tight group-hover:text-orange-600 transition-colors uppercase italic">{update.name}</h4>
                      <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest mt-1">{update.update}</p>
                    </div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase">{update.time}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className={`${
                        update.status === 'Critical' ? 'text-red-500' : 
                        update.status === 'On Track' ? 'text-green-500' : 
                        'text-blue-500'
                      } uppercase tracking-widest`}>
                        {update.status}
                      </span>
                      <span className="text-gray-400">{update.progress}%</span>
                    </div>
                    <div className="h-2 bg-black rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${update.progress}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full relative overflow-hidden ${
                          update.status === 'Critical' ? 'bg-red-500' : 'bg-orange-600'
                        }`}
                      >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/polyester-lite.png')] opacity-20"></div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Widget: Recent Projects */}
        <div className="bg-black/40 border border-gray-800 p-8 rounded-3xl flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600/20 text-blue-600 rounded-lg">
              <Briefcase size={20} />
            </div>
            <h3 className="font-black uppercase tracking-[0.2em] text-xs text-white">Project Queue</h3>
          </div>

          <div className="space-y-8 flex-1">
            {[
              { id: '1', name: 'Al-Rayyan Towers', client: 'Q-Holdings', status: 'In Progress', progress: 65, value: '12.5M FCFA' },
              { id: '2', name: 'Marina Sky Bridge', client: 'Gov of Dubai', status: 'Planning', progress: 15, value: '8.2M FCFA' },
              { id: '3', name: 'Eco-Villa Series 1', client: 'Private', status: 'In Progress', progress: 92, value: '3.1M FCFA' },
              { id: '4', name: 'Downtown Hub', client: 'City Dev Ltd', status: 'On Hold', progress: 5, value: '24.0M FCFA' }
            ].map((project) => (
              <div key={project.id} className="group cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-black text-sm group-hover:text-orange-600 transition-colors uppercase tracking-tight italic">{project.name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{project.client}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                    project.status === 'In Progress' ? 'bg-orange-600/10 text-orange-600' :
                    project.status === 'Planning' ? 'bg-blue-600/10 text-blue-600' :
                    'bg-red-600/10 text-red-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden mb-2 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-orange-600"
                  ></motion.div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black">
                  <span className="text-gray-500 italic uppercase">Cmp: {project.progress}%</span>
                  <span className="text-white bg-gray-950 px-2 py-1 rounded border border-gray-800">{project.value}</span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/admin/projects')}
            className="mt-10 w-full py-4 bg-gray-950 border border-gray-800 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-xl active:scale-95 group"
          >
            Management Portal
            <ArrowUpRight size={14} className="inline-block ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}


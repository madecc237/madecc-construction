import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Mail,
  FileText,
  ExternalLink,
  Info,
  Download
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';

import { PermissionGate } from '../../components/admin/PermissionGate';

const API_KEY = 
  process.env.GOOGLE_MAPS_PLATFORM_KEY || 
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'MY_GEMINI_API_KEY';

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  location: string;
  client: string;
  status: 'In Progress' | 'Planning' | 'Completed' | 'Delayed';
  budget: number;
  spent: number;
  deadline: string;
  progress: number;
  contractId?: string;
  milestones?: Milestone[];
  coordinates?: { lat: number; lng: number };
}

const mockProjects: Project[] = [
  { 
    id: '1', 
    name: 'Metropolis Plaza', 
    location: 'Yaoundé Centre', 
    client: 'Skyline Dev', 
    status: 'In Progress', 
    budget: 12500000, 
    spent: 8200000, 
    deadline: '2026-12-15', 
    progress: 65,
    contractId: '1',
    coordinates: { lat: 3.8667, lng: 11.5167 },
    milestones: [
      { id: 'm1', title: 'Excavation & Piling', dueDate: '2025-06-01', completed: true },
      { id: 'm2', title: 'Foundation Slab', dueDate: '2025-10-15', completed: true },
      { id: 'm3', title: 'Superstructure L10', dueDate: '2026-05-20', completed: false }
    ]
  },
  { 
    id: '2', 
    name: 'Horizon Ocean Villas', 
    location: 'Kribi Resort Zone', 
    client: 'Azure Living', 
    status: 'Planning', 
    budget: 4800000, 
    spent: 200000, 
    deadline: '2027-03-20', 
    progress: 5,
    contractId: '2',
    coordinates: { lat: 2.9333, lng: 9.9167 },
    milestones: [
      { id: 'm4', title: 'Site Clearance', dueDate: '2026-06-15', completed: false },
      { id: 'm5', title: 'Utility Connection', dueDate: '2026-08-01', completed: false }
    ]
  },
  { 
    id: '3', 
    name: 'TechHub Data Center', 
    location: 'Douala IT Park', 
    client: 'DataFirst Ltd', 
    status: 'Delayed', 
    budget: 24000000, 
    spent: 19500000, 
    deadline: '2026-08-10', 
    progress: 80,
    contractId: '3',
    coordinates: { lat: 4.05, lng: 9.7 },
    milestones: [
      { id: 'm6', title: 'Cooling Plant Installation', dueDate: '2026-04-15', completed: true },
      { id: 'm7', title: 'Server Rack Mounts', dueDate: '2026-05-30', completed: false }
    ]
  },
  { 
    id: '4', 
    name: 'Central Rail Station', 
    location: 'Mbankolo Terminal', 
    client: 'Gov Authority', 
    status: 'Completed', 
    budget: 65000000, 
    spent: 64500000, 
    deadline: '2025-12-01', 
    progress: 100,
    coordinates: { lat: 3.8833, lng: 11.5 },
    milestones: [
      { id: 'm8', title: 'Grand Opening', dueDate: '2025-12-01', completed: true }
    ]
  }
];

const mockAccessRequests = [
  { id: 'req_1', name: 'Zaid Al-Sayed', role: 'Foundation Engineer', email: 'zaid.s@madecc.com', date: '2026-05-09' },
  { id: 'req_2', name: 'Layla Mansour', role: 'Site Inspector', email: 'layla.m@madecc.com', date: '2026-05-08' }
];

interface ProjectMarkerProps {
  project: Project;
  onClick: (id: string) => void;
  key?: React.Key;
}

function ProjectMarker({ project, onClick }: ProjectMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={project.coordinates!}
        onClick={() => setShowInfo(true)}
      >
        <Pin 
          background={project.status === 'Completed' ? '#16a34a' : project.status === 'Delayed' ? '#dc2626' : '#ea580c'} 
          borderColor="#fff" 
          glyphColor="#fff" 
        />
      </AdvancedMarker>
      {showInfo && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setShowInfo(false)}
        >
          <div className="p-2 min-w-[180px] text-gray-900">
            <h4 className="font-black text-[10px] uppercase italic mb-1">{project.name}</h4>
            <p className="text-[8px] text-gray-500 font-bold tracking-widest mb-2 uppercase">{project.location}</p>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="text-[9px] font-black text-orange-600 uppercase italic">{project.progress}%</span>
              <button 
                onClick={() => onClick(project.id)}
                className="text-[8px] font-black uppercase tracking-widest text-gray-900 bg-gray-100 px-2 py-1 rounded"
              >
                Inspect
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function AdminProjects() {
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [projects] = useState<Project[]>(mockProjects);
  const [requests, setRequests] = useState(mockAccessRequests);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    location: '',
    budget: '',
    deadline: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleExportCSV = () => {
    const headers = ['ID', 'Project Name', 'Location', 'Client', 'Status', 'Budget', 'Spent', 'Deadline', 'Progress'];
    const csvContent = [
      headers.join(','),
      ...filteredProjects.map(p => [
        p.id,
        `"${p.name}"`,
        `"${p.location}"`,
        `"${p.client}"`,
        p.status,
        p.budget,
        p.spent,
        p.deadline,
        `${p.progress}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MADECC_Portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const handleApproveRequest = (id: string, name: string) => {
    setRequests(requests.filter(r => r.id !== id));
    // Simulate email notification
    console.log(`CEO Command executed: Approval sent. Email notification triggered to admin for ${name}.`);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const errors: Record<string, string> = {};
    if (!newProject.name.trim()) errors.name = 'Project Name is required';
    if (!newProject.client.trim()) errors.client = 'Client Organization is required';
    if (!newProject.budget || Number(newProject.budget) <= 0) errors.budget = 'Valid Total Budget is required';
    if (!newProject.deadline) errors.deadline = 'Project Deadline is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Success logic
    alert('Project configuration deployed to system.');
    setIsModalOpen(false);
    setNewProject({ name: '', client: '', location: '', budget: '', deadline: '' });
    setFormErrors({});
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (selectedProject) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-500 hover:text-white transition-all"
          >
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">{selectedProject.name}</h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              selectedProject.status === 'In Progress' ? 'bg-orange-600 text-white' :
              selectedProject.status === 'Completed' ? 'bg-green-600 text-white' :
              selectedProject.status === 'Delayed' ? 'bg-red-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {selectedProject.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-black/40 border border-gray-800 rounded-3xl p-8 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">Location</p>
                  <p className="text-sm font-bold text-white flex items-center gap-2 italic">
                    <MapPin size={16} className="text-orange-600" />
                    {selectedProject.location}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">Client</p>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 size={16} className="text-orange-600" />
                    {selectedProject.client}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">Deadline</p>
                  <p className={`text-sm font-bold flex items-center gap-2 ${isOverdue(selectedProject.deadline) ? 'text-red-500' : 'text-white'}`}>
                    <Calendar size={16} className="text-orange-600" />
                    {selectedProject.deadline}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-xs font-black uppercase text-white tracking-[0.2em]">Overall Progress</h4>
                  <span className="text-xl font-black text-orange-600 italic">{selectedProject.progress}%</span>
                </div>
                <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedProject.progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-orange-600 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  </motion.div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-800">
                <h4 className="text-xs font-black uppercase text-white tracking-[0.2em] mb-6">Key Milestones Tracking</h4>
                <div className="space-y-4">
                  {selectedProject.milestones?.map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-gray-900/30 border border-gray-800 rounded-2xl group hover:border-orange-600/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${m.completed ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-800 text-gray-600'}`}>
                          {m.completed ? <CheckCircle2 size={20} /> : <div className="text-xs font-black">{idx + 1}</div>}
                        </div>
                        <div>
                          <p className={`font-black uppercase tracking-tight ${m.completed ? 'text-gray-400 line-through' : 'text-white'}`}>{m.title}</p>
                          <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-0.5">TARGET: {m.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOverdue(m.dueDate) && !m.completed && (
                          <span className="px-2 py-1 bg-red-600/10 border border-red-600/20 text-red-500 text-[8px] font-black uppercase rounded tracking-widest">At Risk</span>
                        )}
                        <span className={`text-[10px] font-black tracking-widest uppercase ${m.completed ? 'text-green-500' : 'text-gray-700'}`}>
                          {m.completed ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <div className="bg-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-600/20 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-6">Financial Artifacts</h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Total Allocated Budget</p>
                    <p className="text-3xl font-black italic tracking-tighter">{(selectedProject.budget / 1000000).toFixed(2)}M FCFA</p>
                  </div>
                  <div className="h-px bg-white/20" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Cumulative Spend</p>
                    <p className="text-3xl font-black italic tracking-tighter">{(selectedProject.spent / 1000000).toFixed(2)}M FCFA</p>
                    <div className="mt-2 flex items-center gap-2 overflow-hidden bg-white/10 rounded-full h-1">
                      <div className="h-full bg-white" style={{ width: `${Math.min((selectedProject.spent / selectedProject.budget) * 100, 100)}%` }} />
                    </div>
                  </div>
                  {selectedProject.spent > selectedProject.budget && (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase bg-black/20 p-2 rounded-lg text-white">
                      <AlertCircle size={14} />
                      Budget Overrun Detected
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <DollarSign size={80} />
              </div>
            </div>

            <div className="bg-black/40 border border-gray-800 rounded-3xl p-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Associated Legal Artifact</h4>
              {selectedProject.contractId ? (
                <Link to="/admin/contracts" className="group flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-orange-600/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">Active Framework Agreement</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 italic">Click to Inspect</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-900/20 border border-dashed border-gray-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-700">
                    <FileText size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic text-center flex-1">No Contract Linked</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Project Portfolio</h2>
          <p className="text-gray-400 mt-1">Lifecycle tracking and site management logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setView('map')}
              className={`p-2 rounded-lg transition-all ${view === 'map' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <MapPin size={18} />
            </button>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl font-bold uppercase tracking-widest text-xs hover:text-white transition-all shadow-md active:scale-95"
          >
            <Download size={16} />
            Export CSV
          </button>
          <PermissionGate allowedRoles={['CEO', 'PROJECT_MANAGER', 'SECRETARY']}>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
            >
              <Plus size={18} />
              New Project
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* CEO COMMAND SECTION - ACCESS REQUESTS */}
      <PermissionGate allowedRoles={['CEO']}>
        {requests.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-orange-600/10 border border-orange-600/30 rounded-3xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg text-white">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">CEO Control Command: Access Requests</h3>
                  <p className="text-orange-600 font-bold text-[10px] uppercase tracking-tighter">System Approval Required for New Foundation Staff</p>
                </div>
              </div>
              <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded italic uppercase">{requests.length} Pending</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-black/40 border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                      <UserPlus size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase">{req.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest">{req.role}</p>
                        <span className="text-gray-700">•</span>
                        <p className="text-[10px] text-orange-600/70 font-medium">{req.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleApproveRequest(req.id, req.name)}
                      className="px-4 py-2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-500 transition-all"
                    >
                      Approve & Notify Admin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </PermissionGate>

      <div className="flex items-center gap-4 bg-black/40 border border-gray-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search projects by name, location or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/50 border border-transparent focus:border-orange-600/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          {['All', 'In Progress', 'Planning', 'Delayed', 'Completed'].map((status) => (
            <button 
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                selectedStatus === status 
                  ? 'bg-orange-600 text-white border-orange-600' 
                  : 'border-gray-800 text-gray-500 hover:text-white hover:border-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-black/40 border border-gray-800 rounded-3xl overflow-hidden hover:border-orange-600/50 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                <div className="absolute top-4 left-4 z-20">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    project.status === 'In Progress' ? 'bg-orange-600 text-white' :
                    project.status === 'Completed' ? 'bg-green-600 text-white' :
                    project.status === 'Delayed' ? 'bg-red-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <button 
                    onClick={() => setSelectedProjectId(project.id)}
                    className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight hover:text-orange-500 transition-colors text-left"
                  >
                    {project.name}
                  </button>
                  <p className="text-gray-400 text-xs flex items-center gap-1 font-medium italic mt-1">
                    <MapPin size={12} className="text-orange-600" />
                    {project.location}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Client</p>
                    <p className="text-white font-black">{project.client}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Deadline</p>
                    <p className={`font-black ${isOverdue(project.deadline) ? 'text-red-500' : 'text-white'}`}>{project.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-orange-600 border border-gray-800">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Legal Artifact</p>
                      {project.contractId ? (
                        <Link to="/admin/contracts" className="text-[11px] font-black text-white uppercase hover:text-orange-500 transition-colors flex items-center gap-1">
                          View Contract <ExternalLink size={10} />
                        </Link>
                      ) : (
                        <span className="text-[11px] font-black text-gray-700 uppercase">Unlinked</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Milestones Section */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Key Milestones</p>
                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">{project.milestones.filter(m => m.completed).length}/{project.milestones.length} Done</span>
                    </div>
                    <div className="space-y-2">
                      {project.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between group/ms">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-sm border ${milestone.completed ? 'bg-orange-600 border-orange-600 flex items-center justify-center' : 'border-gray-700 bg-black/20'}`}>
                              {milestone.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <p className={`text-[10px] font-bold tracking-tight ${milestone.completed ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                              {milestone.title}
                            </p>
                          </div>
                          <p className={`text-[8px] font-mono ${isOverdue(milestone.dueDate) && !milestone.completed ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                            {milestone.dueDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pb-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                      <p className="text-gray-500 font-black uppercase tracking-[0.15em] text-[8px]">Project Velocity</p>
                    </div>
                    <p className="text-white font-black text-[10px] tracking-widest italic">{project.progress}%</p>
                  </div>
                  <div className="relative h-1.5 bg-gray-900/80 rounded-full overflow-hidden border border-gray-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-orange-600 rounded-full relative shadow-[0_0_10px_rgba(234,88,12,0.3)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800 mt-auto">
                  <div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-1">Budget</p>
                    <p className="text-sm font-black text-white tracking-tight">{(project.budget / 1000000).toFixed(1)}M FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-1">Spent</p>
                    <p className={`text-sm font-black tracking-tight ${project.spent > project.budget ? 'text-red-500' : 'text-white'}`}>
                      {(project.spent / 1000000).toFixed(1)}M FCFA
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : view === 'list' ? (
        <div className="bg-black/40 border border-gray-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-8 py-5">Project Name</th>
                <th className="px-8 py-5">Client</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Budget</th>
                <th className="px-8 py-5">Spent</th>
                <th className="px-8 py-5">Deadline</th>
                <th className="px-8 py-5">Artifacts</th>
                <th className="px-8 py-5">Milestones</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-800/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div>
                      <button 
                        onClick={() => setSelectedProjectId(project.id)}
                        className="font-bold text-white uppercase tracking-tight hover:text-orange-500 transition-colors text-left"
                      >
                        {project.name}
                      </button>
                      <p className="text-[10px] text-gray-500 font-medium italic">PID: {project.id} • {project.location}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-400 font-medium text-sm">{project.client}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                      project.status === 'In Progress' ? 'text-orange-600 bg-orange-600/10' :
                      project.status === 'Completed' ? 'text-green-500 bg-green-500/10' :
                      'text-red-500 bg-red-500/10'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-white font-black text-xs">{(project.budget / 1000000).toFixed(1)}M FCFA</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`font-black text-xs ${project.spent > project.budget ? 'text-red-500' : 'text-white'}`}>
                      {(project.spent / 1000000).toFixed(1)}M FCFA
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`font-black text-sm ${isOverdue(project.deadline) ? 'text-red-500' : 'text-white'}`}>
                      {project.deadline}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {project.contractId ? (
                      <Link to="/admin/contracts" className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-orange-600 hover:text-white hover:bg-orange-600 transition-all flex items-center justify-center w-fit">
                        <FileText size={16} />
                      </Link>
                    ) : (
                      <span className="text-gray-800"><FileText size={16} /></span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-black text-white italic uppercase tracking-widest">
                        {project.milestones?.filter(m => m.completed).length || 0}/{project.milestones?.length || 0}
                      </p>
                      <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-600" 
                           style={{ width: `${(project.milestones?.filter(m => m.completed).length || 0) / (project.milestones?.length || 1) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-white text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full w-24">
                        <div className="h-full bg-orange-600" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-orange-600">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-600 hover:text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[600px] bg-black/40 border border-gray-800 rounded-3xl overflow-hidden relative">
          {!hasValidKey ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-30 p-12">
               <div className="max-w-md text-center space-y-6">
                <div className="w-20 h-20 bg-orange-600/10 border border-orange-600/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} className="text-orange-600" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Security Clearance Required</h3>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest leading-relaxed">
                  Google Maps API Key configuration required. CEO authority must configure the <code className="text-orange-600 font-black">GOOGLE_MAPS_PLATFORM_KEY</code> in terminal secrets and ensure <strong>BILLING IS ENABLED</strong> in the Google Cloud Console. <span className="text-orange-500 italic">(The map will not load without an active billing account)</span>.
                </p>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-left space-y-4">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Setup Instructions:</p>
                   <ul className="text-[9px] text-gray-500 font-bold uppercase tracking-widest space-y-2">
                     <li className="flex items-start gap-2">
                        <span className="text-orange-600">01.</span>
                        <span>Acquire key from Google Cloud Console</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-orange-600">02.</span>
                        <span>Access Settings → Secrets Panel</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-orange-600">03.</span>
                        <span>Input identifier and paste sequence</span>
                     </li>
                   </ul>
                </div>
              </div>
            </div>
          ) : (
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{ lat: 3.8667, lng: 11.5167 }}
                defaultZoom={7}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                colorScheme="DARK"
                disableDefaultUI={true}
              >
                {filteredProjects.filter(p => !!p.coordinates).map(project => (
                  <ProjectMarker 
                    key={project.id} 
                    project={project} 
                    onClick={(id) => setSelectedProjectId(id)} 
                  />
                ))}
              </Map>
              <div className="absolute bottom-4 left-4 z-40 bg-black/60 backdrop-blur-sm border border-gray-800 p-2 px-3 rounded-lg flex items-center gap-2 pointer-events-none">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Map Terminal Active</span>
              </div>
              <div className="absolute top-4 right-4 z-40">
                <button 
                  onClick={() => alert("Billing Error? If you see a 'BillingNotEnabledMapError', ensure your Cloud Project has a linked billing account. Map ID is set to dynamic fallback.")}
                  className="p-2 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg text-gray-500 hover:text-white transition-all shadow-xl"
                  title="Map Diagnostics"
                >
                  <Info size={16} />
                </button>
              </div>
            </APIProvider>
          )}
        </div>
      )}

      {/* Modal Placeholder */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Initialize New Project</h3>
                  <p className="text-gray-400 text-sm font-medium">Define parameters for a new construction site.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleCreateProject}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                      Project Name <span className="text-orange-600">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Burj Azizi" 
                      value={newProject.name}
                      onChange={(e) => {
                        setNewProject({ ...newProject, name: e.target.value });
                        if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                      }}
                      className={`w-full bg-black/50 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium ${
                        formErrors.name ? 'border-red-500' : 'border-gray-800 focus:border-orange-600'
                      }`} 
                    />
                    {formErrors.name && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                      Client Organization <span className="text-orange-600">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Emaar" 
                      value={newProject.client}
                      onChange={(e) => {
                        setNewProject({ ...newProject, client: e.target.value });
                        if (formErrors.client) setFormErrors({ ...formErrors, client: '' });
                      }}
                      className={`w-full bg-black/50 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium ${
                        formErrors.client ? 'border-red-500' : 'border-gray-800 focus:border-orange-600'
                      }`} 
                    />
                    {formErrors.client && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{formErrors.client}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Location Site</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Discovery Gardens" 
                      value={newProject.location}
                      onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                      className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-600 transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                      Total Budget (FCFA) <span className="text-orange-600">*</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="5,000,000" 
                      value={newProject.budget}
                      onChange={(e) => {
                        setNewProject({ ...newProject, budget: e.target.value });
                        if (formErrors.budget) setFormErrors({ ...formErrors, budget: '' });
                      }}
                      className={`w-full bg-black/50 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium ${
                        formErrors.budget ? 'border-red-500' : 'border-gray-800 focus:border-orange-600'
                      }`} 
                    />
                    {formErrors.budget && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{formErrors.budget}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                      Deadline <span className="text-orange-600">*</span>
                    </label>
                    <input 
                      type="date" 
                      value={newProject.deadline}
                      onChange={(e) => {
                        setNewProject({ ...newProject, deadline: e.target.value });
                        if (formErrors.deadline) setFormErrors({ ...formErrors, deadline: '' });
                      }}
                      className={`w-full bg-black/50 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium ${
                        formErrors.deadline ? 'border-red-500' : 'border-gray-800 focus:border-orange-600'
                      }`} 
                    />
                    {formErrors.deadline && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{formErrors.deadline}</p>}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 border border-gray-800 text-gray-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-800 transition-all"
                  >
                    Discard Draft
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-orange-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98]"
                  >
                    Confirm & Deploy Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

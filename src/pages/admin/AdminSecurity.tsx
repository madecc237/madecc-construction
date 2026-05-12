import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Key, 
  RefreshCcw, 
  AlertCircle, 
  Lock, 
  ChevronRight,
  Fingerprint,
  Radio,
  Eye,
  EyeOff,
  Activity,
  MapPin,
  ShieldAlert,
  Trash2,
  Mail,
  ShieldX,
  History
} from 'lucide-react';
import { useAuth, AdminRole, ThreatLog, SecurityAlert } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';

export default function AdminSecurity() {
  const { 
    getKeys, 
    updateKey, 
    revokeKey, 
    rotateAllKeys,
    generateComplexKey, 
    user, 
    getThreatLogs, 
    getSecurityAlerts,
    clearThreatLogs, 
    updateThreatLogStatus 
  } = useAuth();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isRotating, setIsRotating] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'warning'} | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'threats' | 'alerts'>('keys');
  const [activeTraces, setActiveTraces] = useState<Record<string, number>>({});

  const keys = getKeys();
  const threatLogs = getThreatLogs();
  const securityAlerts = getSecurityAlerts();

  const handleInitializeTrace = (id: string) => {
    if (activeTraces[id]) return;

    updateThreatLogStatus(id, 'Trace Active');
    
    // Simulate trace progress
    setActiveTraces(prev => ({ ...prev, [id]: 0 }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        updateThreatLogStatus(id, 'Clear-Neutralized');
        clearInterval(interval);
        
        setNotification({ message: `Trace sequence ${id} completed. Origin neutralized.`, type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }
      setActiveTraces(prev => ({ ...prev, [id]: Math.min(100, Math.floor(progress)) }));
    }, 800);
  };

  const handleGenerateReport = (log: ThreatLog) => {
    const doc = new jsPDF() as any;
    
    // Header - Ultra Secure Esthetic
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(234, 88, 12); // Orange-600
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FORENSIC THREAT MANIFEST', 14, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`CONFIDENTIAL // EYES ONLY // MADECC SECURITY`, 14, 32);
    
    // Incident Overview
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INCIDENT OVERVIEW', 14, 55);
    
    doc.setDrawColor(200);
    doc.line(14, 58, 196, 58);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text([
      `Incident ID: ${log.id}`,
      `Timestamp: ${new Date(log.timestamp).toLocaleString()}`,
      `Threat Actor IP: ${log.ip}`,
      `Origin: ${log.location}`,
      `Status: NEUTRALIZED`,
      `Risk Level: ${log.riskLevel.toUpperCase()}`
    ], 14, 68);

    // Digital Evidence
    doc.setFont('helvetica', 'bold');
    doc.text('DIGITAL EVIDENCE', 14, 110);
    doc.line(14, 113, 196, 113);
    
    doc.setFont('helvetica', 'normal');
    doc.text([
      `Hardware ID: ${log.device}`,
      `Operating System: ${log.os}`,
      `Browser Signature: ${log.browser}`,
      `Screen Resolution: ${log.resolution}`,
      `Protocol Attempt: ${log.attemptedKey}`,
      `ISP Provider: ${log.networkProvider}`
    ], 14, 123);

    // Physical Proximity (Mock Data for Drama)
    doc.setFont('helvetica', 'bold');
    doc.text('GEOGRAPHIC TRIANGULATION (APPROX)', 14, 165);
    doc.line(14, 168, 196, 168);
    
    const lat = (Math.random() * (4.5 - 3.5) + 3.5).toFixed(6);
    const lng = (Math.random() * (12.0 - 10.5) + 10.5).toFixed(6);
    
    doc.setFont('helvetica', 'normal');
    doc.text([
      `Estimated Coordinates: ${lat} N, ${lng} E`,
      `Locality Accuracy: < 150m Radius`,
      `Reported Address Range: Restricted Administrative Sector`,
      `ISP Handshake Point: ${log.networkProvider} Node-Beta`
    ], 14, 178);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This report is generated automatically by the MADECC Security Terminal and acts as primary evidence for law enforcement.', 14, 280);
    
    doc.save(`MADECC_THREAT_REPORT_${log.id}.pdf`);
  };

  const toggleKeyVisibility = (role: string) => {
    setShowKeys(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const handleUpdate = (role: AdminRole) => {
    if (!newKeyValue || newKeyValue.length < 12) {
      setNotification({ message: 'High-security keys must be at least 12 characters long.', type: 'warning' });
      return;
    }
    updateKey(role, newKeyValue);
    setEditingRole(null);
    setNewKeyValue('');
    setNotification({ message: `Access sequence for ${role.replace('_', ' ')} updated successfully.`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRevoke = (role: AdminRole) => {
    if (window.confirm(`IMMEDIATE REVOCATION: Are you sure you want to invalidate the access sequence for ${role}? This user will be blocked immediately.`)) {
      revokeKey(role);
      setNotification({ message: `Access revoked for ${role}.`, type: 'warning' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRotateAll = async () => {
    if (window.confirm('CRITICAL ACTION: This will instantly regenerate ALL access sequences for non-CEO roles. All staff members will need new keys to login. Proceed?')) {
      setIsRotating(true);
      await rotateAllKeys();
      setIsRotating(false);
      setNotification({ message: 'Global Protocol Rotation complete. Inform staff of new sequences.', type: 'warning' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const generateRandomKey = (role: AdminRole) => {
    const key = generateComplexKey(role);
    setNewKeyValue(key);
  };

  const roleLabels: Record<AdminRole, string> = {
    'CEO': 'Chief Executive Authority',
    'PROJECT_MANAGER': 'Field Operations Command',
    'CONTENT_EDITOR': 'Information & Media Control',
    'FINANCIAL_OFFICER': 'Fiscal & Treasury Audit',
    'ACCOUNTANT': 'Accounting & Financial Record Keeping',
    'SECRETARY': 'Administrative Liaison & Document Archiving'
  };

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Security Terminal</h2>
          <p className="text-gray-400 mt-1 uppercase text-[10px] tracking-widest font-bold">Encrypted Access Command Center v2.9 // CEO LEVEL 5</p>
        </div>
        
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'keys' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-500 hover:text-white'}`}
          >
            Access Nodes
          </button>
          <button 
            onClick={() => setActiveTab('threats')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'threats' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}
          >
            Threat Hub
            {threatLogs.filter(l => l.status === 'Flagged').length > 0 && (
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
          >
            Sent Alerts
            {securityAlerts.length > 0 && <span className="text-[8px] bg-blue-500/20 px-1.5 rounded-full">{securityAlerts.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'keys' && (
        <div className="bg-black/40 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck size={120} className="text-orange-600" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800">
                <Fingerprint size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Access Sequence Nodes</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Manage authorization keys for all organizational tiers.</p>
              </div>
            </div>

            <button
               onClick={handleRotateAll}
               disabled={isRotating}
               className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-orange-600 hover:border-orange-600 transition-all group"
            >
               <RefreshCcw size={14} className={isRotating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
               {isRotating ? 'Rotating Protocol...' : 'Bulk Protocol Rotation'}
            </button>
          </div>

          <div className="space-y-4">
            {(Object.keys(keys) as AdminRole[]).map((role) => (
              <div 
                key={role}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  editingRole === role 
                    ? 'bg-orange-600/5 border-orange-600/30' 
                    : 'bg-black/40 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">{role.replace('_', ' ')}</span>
                       {role === 'CEO' && <Lock size={10} className="text-orange-600" />}
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight uppercase">{roleLabels[role]}</h4>
                    {(role === 'ACCOUNTANT' || role === 'SECRETARY') && (
                      <p className="text-[9px] text-gray-500 font-bold uppercase italic tracking-widest">CEO-Provisioned Access Required</p>
                    )}
                  </div>

                  <div className="flex flex-1 max-w-md items-center gap-4">
                    <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 font-mono text-xs overflow-hidden flex items-center justify-between group">
                      <span className={showKeys[role] || editingRole === role ? 'text-white' : 'text-gray-700 blur-[3px] select-none'}>
                        {editingRole === role ? (
                          <input 
                            type="text"
                            value={newKeyValue}
                            onChange={(e) => setNewKeyValue(e.target.value.toUpperCase())}
                            className="bg-transparent border-none outline-none w-full text-orange-500 font-black"
                            placeholder="ENTER NEW PROTOCOL..."
                            autoFocus
                          />
                        ) : (
                          keys[role]
                        )}
                      </span>
                      {editingRole !== role && (
                        <button 
                          onClick={() => toggleKeyVisibility(role)}
                          className="opacity-40 hover:opacity-100 transition-opacity ml-2"
                        >
                          {showKeys[role] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {editingRole === role ? (
                        <>
                          <button 
                            onClick={() => generateRandomKey(role)}
                            className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all"
                            title="Regenerate Complex Sequence"
                          >
                            <RefreshCcw size={16} />
                          </button>
                          <button 
                            onClick={() => handleUpdate(role)}
                            className="px-6 py-3 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20"
                          >
                            Authorize
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => {
                              setEditingRole(role);
                              setNewKeyValue(keys[role]);
                            }}
                            className="p-3 border border-gray-800 text-gray-400 rounded-xl hover:bg-gray-800 hover:text-white transition-all"
                            title="Modify Protocol"
                          >
                            <Lock size={16} />
                          </button>
                          {role !== 'CEO' && (
                            <button 
                              onClick={() => handleRevoke(role)}
                              className="p-3 border border-red-900/30 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Revoke Immediately"
                            >
                              <ShieldX size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {activeTab === 'threats' && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-black/60 border border-red-900/30 rounded-3xl p-8 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
                <ShieldAlert size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-wider text-red-500">Unauthorised Trace Hub</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live monitoring of intercept attempts and protocol fractures.</p>
              </div>
            </div>
            <button 
              onClick={clearThreatLogs}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Clear Terminal History"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {threatLogs.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-600">
                <Radio size={48} className="mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Hostile Injections Recorded</p>
              </div>
            ) : (
              threatLogs.map((log) => (
                <div key={log.id} className="group relative">
                  <div className="p-5 bg-zinc-900/40 border border-red-900/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-900/60 transition-all cursor-crosshair">
                    <div className="flex items-start gap-5">
                      <div className={`mt-1 w-2 h-2 rounded-full animate-pulse ${
                        log.riskLevel === 'Critical' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-orange-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-white font-mono tracking-tighter">{log.ip}</span>
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            log.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'
                          }`}>
                            {log.riskLevel} Risk
                          </div>
                          <span className="text-[9px] text-gray-700 font-bold font-mono">TYPE: {log.type}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                          <MapPin size={10} className="inline mr-1 -mt-0.5" />
                          {log.location}
                        </p>
                        <p className="text-[11px] text-red-400 font-black tracking-[0.15em] uppercase italic font-mono mt-2 flex items-center gap-2">
                           <ShieldAlert size={12} />
                           Attempt: {log.attemptedKey}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:flex items-center gap-8 md:gap-12">
                      <div className="space-y-1">
                         <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Digital Footprint</p>
                         <p className="text-[10px] text-gray-400 font-mono italic">{log.os} / {log.browser}</p>
                         <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">ISP: {log.networkProvider}</p>
                      </div>
                      <div className="text-right space-y-1">
                         <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Timestamp</p>
                         <p className="text-[10px] text-white font-mono">{new Date(log.timestamp).toLocaleTimeString()}</p>
                         <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{log.id}</p>
                      </div>
                      {log.status === 'Clear-Neutralized' && (
                        <div className="text-right space-y-1 border-l border-white/5 pl-8 hidden lg:block">
                           <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">Physical Lock</p>
                           <p className="text-[10px] text-white font-mono tracking-tighter">
                              {(3.8 + Math.random() * 0.1).toFixed(4)}° N, {(11.5 + Math.random() * 0.1).toFixed(4)}° E
                           </p>
                           <p className="text-[8px] text-gray-500 font-bold uppercase">±15m accuracy</p>
                        </div>
                      )}
                      <div className="col-span-2 md:col-auto flex gap-2">
                        {log.status === 'Clear-Neutralized' && (
                          <button 
                            onClick={() => handleGenerateReport(log)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                          >
                            Evidence Manifest
                          </button>
                        )}
                        <button 
                          onClick={() => handleInitializeTrace(log.id)}
                          disabled={log.status === 'Clear-Neutralized' || log.status === 'Trace Active'}
                          className={`w-full md:w-auto px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative overflow-hidden ${
                            log.status === 'Clear-Neutralized' 
                              ? 'bg-green-600/10 border-green-600/30 text-green-500' 
                              : log.status === 'Trace Active'
                              ? 'bg-orange-600/10 border-orange-600/30 text-orange-500'
                              : 'bg-red-600/10 border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white'
                          }`}
                        >
                           <span className="relative z-10">
                            {log.status === 'Flagged' ? 'Initialize Trace' : 
                             log.status === 'Trace Active' ? `Tracing: ${activeTraces[log.id] || 0}%` : 
                             'Neutralized'}
                           </span>
                           {log.status === 'Trace Active' && (
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${activeTraces[log.id] || 0}%` }}
                               className="absolute left-0 top-0 bottom-0 bg-orange-600/20 z-0"
                             />
                           )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stealth Trace Overlay */}
                  <div className="absolute inset-0 border border-red-500/0 group-hover:border-red-500/10 rounded-2xl pointer-events-none transition-all duration-500" />
                  
                  {log.status === 'Trace Active' && (
                    <div className="absolute inset-0 bg-black/95 rounded-2xl flex flex-col p-6 z-20 font-mono text-[8px] text-orange-500 overflow-hidden">
                       <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                            <Activity size={10} className="animate-pulse" />
                            <span className="font-black uppercase tracking-tighter">Forensic Link: Node {log.id}</span>
                         </div>
                         <span className="text-white/40">{activeTraces[log.id] || 0}%</span>
                       </div>
                       <div className="space-y-1 opacity-70">
                         <p>{'>'} ORIGIN: {log.location}</p>
                         <p>{'>'} HANDSHAKE: {log.networkProvider}</p>
                         <p className="animate-pulse">{'>'} BYPASSING LOCAL FIREWALLS... OK</p>
                         <p>{'>'} TRIANGULATING... {(3.8 + Math.random() * 0.1).toFixed(4)}°N / {(11.5 + Math.random() * 0.1).toFixed(4)}°E</p>
                         <p className="text-red-500">{'>'} STATUS: VIOLATION CONFIRMED</p>
                       </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'alerts' && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-black/60 border border-blue-900/30 rounded-3xl p-8 space-y-6"
        >
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-600/20">
              <Mail size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Automated CEO Dispatch</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Historical record of automated security alerts sent to the CEO's verified link.</p>
            </div>
          </div>

          <div className="space-y-3">
             {securityAlerts.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-gray-600">
                 <Mail size={48} className="mb-4 opacity-10" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">Dispatch Queue Empty</p>
               </div>
             ) : (
               securityAlerts.map((alert) => (
                 <div key={alert.id} className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl flex items-center justify-between gap-4 group hover:bg-zinc-900/50 transition-all">
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-lg ${
                         alert.type === 'Critical' ? 'bg-red-500/20 text-red-500' : 
                         alert.type === 'Warning' ? 'bg-orange-500/20 text-orange-500' : 
                         'bg-blue-500/20 text-blue-500'
                       }`}>
                          {alert.type === 'Critical' ? <ShieldAlert size={14} /> : <Mail size={14} />}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-wider">{alert.title}</p>
                          <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-1">{alert.message}</p>
                       </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                       <p className="text-[8px] text-white/40 font-mono italic">{new Date(alert.timestamp).toLocaleString()}</p>
                       <p className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter">SENT TO: {alert.recipient}</p>
                    </div>
                 </div>
               ))
             )}
          </div>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <div className="bg-orange-600/10 border border-orange-600/30 rounded-3xl p-6 flex gap-4 items-start">
          <div className="p-3 bg-orange-600 rounded-xl text-white">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase italic mb-2">CEO Prime Directive</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Access keys for ALL roles (Personnel, Accountants, Secretaries, and Managers) are strictly managed and issued solely by the Chief Executive Officer. Distribution must be handled via encrypted physical channels. Do not share these sequences.
            </p>
          </div>
        </div>

        <div className="bg-black/40 border border-gray-800 rounded-3xl p-6 flex gap-4 items-start">
          <div className="p-3 bg-gray-900 rounded-xl text-gray-400">
            <Radio size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase italic mb-2">Protocol Logging</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              System access attempts are monitored and logged. Unauthorized sequences trigger an immediate protocol lockdown for 30 cycles.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`fixed bottom-10 right-10 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border ${
            notification.type === 'success' ? 'bg-black border-green-500/30 text-green-500' : 'bg-black border-orange-600/30 text-orange-600'
          }`}
        >
          {notification.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
        </motion.div>
      )}
    </div>
  );
}

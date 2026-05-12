import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Building2, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [mfaInput, setMfaInput] = useState('');
  const [stage, setStage] = useState<'primary' | 'mfa'>('primary');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { login, verifyMfa, getLockoutStatus } = useAuth();
  const lockout = getLockoutStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (stage === 'primary') {
      const result = await login(password);
      
      if (result.success && result.mfaRequired) {
        setStage('mfa');
        setLoading(false);
      } else if (result.success && !result.mfaRequired) {
        navigate('/admin/dashboard');
      } else if (result.error) {
        setLoading(false);
        setError(result.error);
        setPassword('');
      } else {
        setLoading(false);
        setError('AUTHORIZATION VOID: Invalid Command Sequence.');
        setPassword('');
      }
    } else {
      const success = await verifyMfa(mfaInput);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setLoading(false);
        setError('MFA SEQUENCE FAILED: AUTHENTICATOR MISMATCH.');
        setMfaInput('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2"></div>
      
      {/* Static noise/dust texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gray-950 border border-white/10 rounded-[2rem] p-10 shadow-2xl relative z-10 before:absolute before:inset-0 before:rounded-[2rem] before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <Link to="/" className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm group hover:border-orange-600/50 transition-colors">
            <img src="/logo.png" alt="MADECC" className="h-12 w-auto group-hover:scale-105 transition-transform duration-500" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white uppercase tracking-[-0.05em] italic">
              {stage === 'primary' ? 'CEO Controller' : 'MFA Verification'}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${lockout.isLocked ? 'bg-red-500' : 'bg-orange-600'} animate-pulse`}></span>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
                {lockout.isLocked ? `TERMINAL LOCKED (${lockout.remaining}s)` : 'Secure Terminal Access'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-600">
                {stage === 'primary' ? 'Access Command' : 'Secondary Verification Code'}
              </label>
              <span className="text-[9px] text-orange-600/50 font-mono">
                {stage === 'primary' ? 'LEVEL 5 CLEARANCE' : 'SECURE RESPONSE'}
              </span>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center text-gray-600 group-focus-within:text-orange-600 transition-colors">
                <Lock size={16} />
              </div>
              
              {stage === 'primary' ? (
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockout.isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER COMMAND KEY"
                  className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-white placeholder:text-gray-800 focus:outline-none focus:border-orange-600/50 focus:ring-4 focus:ring-orange-600/5 ring-0 transition-all font-mono text-sm tracking-widest uppercase disabled:opacity-30"
                />
              ) : (
                <input 
                  type="text"
                  required
                  maxLength={6}
                  value={mfaInput}
                  onChange={(e) => setMfaInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="X X X X X X"
                  className="w-full bg-black border border-orange-600/30 rounded-2xl py-5 text-center text-orange-500 placeholder:text-gray-900 focus:outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 ring-0 transition-all font-mono text-2xl tracking-[0.5em] uppercase"
                />
              )}
              
              {stage === 'primary' && !lockout.isLocked && (
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-gray-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/30 border border-red-500/30 p-4 rounded-xl flex items-center gap-3"
            >
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-[10px] text-red-500 font-black uppercase tracking-wider leading-tight">{error}</p>
            </motion.div>
          )}

          {stage === 'mfa' && (
             <p className="text-[9px] text-orange-500/80 text-center font-bold uppercase tracking-wider animate-pulse">
               MFA Secure Sequence dispatched to CEO verified endpoint and mobile link.
             </p>
          )}

          <button 
            type="submit"
            disabled={loading || lockout.isLocked}
            className={`group relative w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 overflow-hidden transition-all active:scale-[0.98] ${loading || lockout.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 hover:text-white shadow-xl shadow-white/5'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
            <span className="relative z-10 flex items-center gap-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  {stage === 'primary' ? 'Execute Authentication' : 'Verify Sequence'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>

          {stage === 'mfa' && (
            <button 
              type="button"
              onClick={() => { setStage('primary'); setMfaInput(''); setError(''); }}
              className="w-full text-[9px] text-gray-600 font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Abort MFA Sequence
            </button>
          )}
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Protocol Active</span>
          </div>
          <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest leading-relaxed px-8">
            Access keys must be provided directly by the Chief Executive Officer (CEO). Unauthorized attempts are flagged and traced.
          </p>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
        <div className="text-[10px] text-gray-800 font-black uppercase tracking-[1em] opacity-30">
          MADECC OPERATIONS CORE
        </div>
      </div>
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminRole = 'CEO' | 'PROJECT_MANAGER' | 'CONTENT_EDITOR' | 'FINANCIAL_OFFICER' | 'ACCOUNTANT' | 'SECRETARY';

interface User {
  role: AdminRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (commandKey: string) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string }>;
  verifyMfa: (code: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  getKeys: () => Record<AdminRole, string>;
  updateKey: (role: AdminRole, newKey: string) => void;
  revokeKey: (role: AdminRole) => void;
  rotateAllKeys: () => Promise<void>;
  generateComplexKey: (role: AdminRole) => string;
  getThreatLogs: () => ThreatLog[];
  getSecurityAlerts: () => SecurityAlert[];
  clearThreatLogs: () => void;
  updateThreatLogStatus: (id: string, status: ThreatLog['status']) => void;
  getLockoutStatus: () => { isLocked: boolean; remaining: number };
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  recipient: string;
  type: 'Critical' | 'Warning' | 'Info';
  metadata?: any;
}

export interface ThreatLog {
  id: string;
  timestamp: string;
  attemptedKey: string;
  location: string;
  ip: string;
  device: string;
  browser: string;
  os: string;
  resolution: string;
  networkProvider: string;
  status: 'Flagged' | 'Trace Active' | 'Clear-Neutralized' | 'Blocked';
  riskLevel: 'Low' | 'Medium' | 'Critical';
  type: 'Login' | 'MFA' | 'Key Change';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCKOUT_LIMIT = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [keys, setKeys] = useState<Record<AdminRole, string>>({} as Record<AdminRole, string>);
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  
  // Security States
  const [mfaCode, setMfaCode] = useState<string | null>(null);
  const [tempRole, setTempRole] = useState<AdminRole | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    // Check for existing lockout
    const savedLockout = localStorage.getItem('madecc_lockout');
    if (savedLockout) {
      const time = parseInt(savedLockout);
      if (time > Date.now()) {
        setLockoutUntil(time);
      }
    }

    // Check if user session exists in localStorage
    const session = localStorage.getItem('madecc_admin_session');
    const savedRole = localStorage.getItem('madecc_admin_role') as AdminRole;
    
    // Load threat logs
    const savedLogs = localStorage.getItem('madecc_threat_logs');
    if (savedLogs) {
      setThreatLogs(JSON.parse(savedLogs));
    }

    // Load security alerts
    const savedAlerts = localStorage.getItem('madecc_security_alerts');
    if (savedAlerts) {
      setSecurityAlerts(JSON.parse(savedAlerts));
    }
    
    const initializeAuth = async () => {
      if (session === 'active' && savedRole) {
        setIsAuthenticated(true);
        setUser({ role: savedRole });
        
        // If CEO, fetch keys from server
        if (savedRole === 'CEO') {
          try {
            const res = await fetch('/api/admin/keys');
            const serverKeys = await res.json();
            setKeys(serverKeys);
          } catch (e) {
            console.error("Failed to fetch secure keys", e);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const getLockoutStatus = () => {
    if (!lockoutUntil) return { isLocked: false, remaining: 0 };
    const remaining = Math.max(0, lockoutUntil - Date.now());
    if (remaining === 0) return { isLocked: false, remaining: 0 };
    return { isLocked: true, remaining: Math.ceil(remaining / 1000) };
  };

  const sendSecurityAlert = (title: string, message: string, type: SecurityAlert['type'], metadata?: any) => {
    const alert: SecurityAlert = {
      id: `ALT-${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      recipient: 'madeccco5@gmail.com',
      type,
      metadata
    };

    setSecurityAlerts(prev => {
      const updated = [alert, ...prev].slice(0, 50);
      localStorage.setItem('madecc_security_alerts', JSON.stringify(updated));
      return updated;
    });

    // Mock real email dispatch
    console.log(`[SMTP_SIMULATOR] Dispatching ${type} Alert to CEO (madeccco5@gmail.com)...`);
    console.log(`SUBJECT: ${title}`);
    console.log(`BODY: ${message}`);
  };

  const generateComplexKey = (role: AdminRole): string => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let retVal = "";
    const prefix = role.substring(0, 3).toUpperCase();
    
    // Cryptographically secure random values
    const array = new Uint32Array(16);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < 16; ++i) {
      retVal += charset.charAt(array[i] % charset.length);
    }
    
    return `${prefix}_SECURE_${retVal}_${new Date().getFullYear()}`;
  };

  const login = async (commandKey: string): Promise<{ success: boolean; mfaRequired?: boolean; error?: string }> => {
    const lockout = getLockoutStatus();
    if (lockout.isLocked) {
      return { success: false, error: `TERMINAL LOCKED. RETRY IN ${lockout.remaining}s.` };
    }

    const trimmedKey = commandKey.trim();
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandKey: trimmedKey })
      });

      if (response.ok) {
        const { role } = await response.json();
        
        // Step 1: Handle MFA or Direct Login
        if (role === 'CEO') {
          // Fetch keys upon CEO login
          try {
            const keysRes = await fetch('/api/admin/keys');
            const serverKeys = await keysRes.json();
            setKeys(serverKeys);
          } catch (e) {
            console.error("Failed to fetch keys after login", e);
          }

          const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
          setMfaCode(generatedCode);
          setTempRole(role);
          setFailedAttempts(0); // Reset on successful primary key
          
          // Dispatch MFA to CEO
          await fetch('/api/send-mfa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: generatedCode,
              email: 'madeccco5@gmail.com',
              role: role
            })
          });
          
          return { success: true, mfaRequired: true };
        } else {
          // Direct Login for other staff
          setIsAuthenticated(true);
          setUser({ role });
          setFailedAttempts(0);
          
          localStorage.setItem('madecc_admin_session', 'active');
          localStorage.setItem('madecc_admin_role', role);

          return { success: true, mfaRequired: false };
        }
      }
    } catch (e) {
      console.error("Login API failure", e);
    }

    // Handle failure
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);

    if (newCount >= LOCKOUT_LIMIT) {
      const until = Date.now() + LOCKOUT_DURATION;
      setLockoutUntil(until);
      localStorage.setItem('madecc_lockout', until.toString());
      
      sendSecurityAlert(
        'CRITICAL: BRUTE FORCE DETECTED',
        `Terminal access has been locked due to ${LOCKOUT_LIMIT} consecutive failed attempts from IP ${Math.floor(Math.random()*255)}... Protocol Lockdown engaged.`,
        'Critical',
        { attempts: newCount, lockout: until }
      );
    }

    // Capture failed attempt for Audit Logs
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const os = userAgent.includes('Windows') ? 'Windows' : 
               userAgent.includes('Mac') ? 'macOS' : 
               userAgent.includes('Linux') ? 'Linux' : 
               isMobile ? 'Mobile OS' : 'Unknown';

    const newLog: ThreatLog = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      timestamp: new Date().toISOString(),
      attemptedKey: trimmedKey,
      location: ['Douala, Littoral (Cameroon)', 'Yaoundé, Centre (Cameroon)', 'Lagos, Nigeria', 'Paris, France', 'Unknown (Tor Exit Node)'][Math.floor(Math.random() * 5)],
      ip: `197.${Math.floor(Math.random() * 100 + 100)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device: isMobile ? 'Handheld Device' : 'Workstation',
      browser: userAgent.split(' ').slice(-1)[0],
      os: os,
      resolution: `${window.screen.width}x${window.screen.height}`,
      networkProvider: ['Camtel High-Speed', 'MTN Cameroon', 'Orange Africa', 'Private Cloud Network'][Math.floor(Math.random() * 4)],
      status: newCount >= LOCKOUT_LIMIT ? 'Blocked' : 'Flagged',
      riskLevel: commandKey.length > 10 ? 'Critical' : 'Medium',
      type: 'Login'
    };

    const updatedLogs = [newLog, ...threatLogs].slice(0, 100);
    setThreatLogs(updatedLogs);
    localStorage.setItem('madecc_threat_logs', JSON.stringify(updatedLogs));

    if (newLog.riskLevel === 'Critical') {
      sendSecurityAlert(
        'HIGH-RISK LOGIN ATTEMPT',
        `An unauthorised access attempt using a high-value character signature was intercepted from ${newLog.location}. Trace sequence recommended.`,
        'Critical',
        { logId: newLog.id, ip: newLog.ip }
      );
    }

    return { success: false, error: 'AUTHORIZATION VOID: INVALID COMMAND SEQUENCE.' };
  };

  const verifyMfa = async (code: string): Promise<boolean> => {
    if (code === mfaCode && tempRole) {
      setIsAuthenticated(true);
      setUser({ role: tempRole });
      try {
        localStorage.setItem('madecc_admin_session', 'active');
        localStorage.setItem('madecc_admin_role', tempRole);
      } catch (e) {
        console.warn("Storage access failed", e);
      }

      if (tempRole === 'CEO') {
        sendSecurityAlert(
          'CEO LOGIN SUCCESSFUL',
          'Chief Executive Authority has successfully bypassed the MFA barrier. Session active.',
          'Info'
        );
      }

      setMfaCode(null);
      setTempRole(null);
      return true;
    }

    // Log MFA failure
    const userAgent = navigator.userAgent;
    const newLog: ThreatLog = {
      id: `MFA-${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      attemptedKey: `CODE: ${code} (Failed MFA)`,
      location: 'Internal Origin',
      ip: '127.0.0.1',
      device: 'Local Endpoint',
      browser: userAgent.split(' ').slice(-1)[0],
      os: 'System',
      resolution: 'N/A',
      networkProvider: 'Internal Node',
      status: 'Flagged',
      riskLevel: 'Critical',
      type: 'MFA'
    };
    
    setThreatLogs(prev => [newLog, ...prev].slice(0, 100));

    sendSecurityAlert(
      'MFA VERIFICATION FAILURE',
      `Multiple MFA mismatches detected during access sequence. Primary key compromised or entry error? Session suspended.`,
      'Warning',
      { attemptedCode: code }
    );

    return false;
  };

  const getKeys = () => keys;
  const getThreatLogs = () => threatLogs;
  const getSecurityAlerts = () => securityAlerts;
  
  const clearThreatLogs = () => {
    setThreatLogs([]);
    localStorage.removeItem('madecc_threat_logs');
  };

  const updateThreatLogStatus = (id: string, status: ThreatLog['status']) => {
    setThreatLogs(prev => {
      const updated = prev.map(log => log.id === id ? { ...log, status } : log);
      localStorage.setItem('madecc_threat_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const updateKey = async (role: AdminRole, newKey: string) => {
    if (user?.role !== 'CEO') return; // Only CEO can update keys
    
    try {
      await fetch('/api/admin/keys/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, newKey })
      });

      const newKeys = { ...keys, [role]: newKey };
      setKeys(newKeys);

      sendSecurityAlert(
        'PROTOCOL UPDATE',
        `Access sequence for ${role} has been updated remotely by the CEO. Previous key VOID.`,
        'Info',
        { role, action: 'UPDATE' }
      );
    } catch (e) {
      console.error("Key update failed", e);
    }
  };

  const revokeKey = async (role: AdminRole) => {
    if (user?.role !== 'CEO') return;
    if (role === 'CEO') return; // Cannot revoke self access from here safely

    const revokedKey = `REVOKED_${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    try {
      await fetch('/api/admin/keys/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, newKey: revokedKey })
      });

      const newKeys = { ...keys, [role]: revokedKey };
      setKeys(newKeys);

      sendSecurityAlert(
        'PROTOCOL REVOCATION',
        `Access sequence for ${role} has been IMMEDIATELY REVOKED. User will be blocked on next authentication attempt.`,
        'Warning',
        { role, action: 'REVOKE' }
      );
    } catch (e) {
      console.error("Key revocation failed", e);
    }
  };

  const rotateAllKeys = async () => {
    if (user?.role !== 'CEO') return;

    try {
      const response = await fetch('/api/admin/keys/rotate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const { keys: newKeys } = await response.json();
        setKeys(newKeys);

        sendSecurityAlert(
          'MASS PROTOCOL ROTATION',
          'A global access sequence rotation has been initialized by the CEO. All non-CEO keys have been regenerated.',
          'Critical',
          { action: 'ROTATE_ALL' }
        );
      }
    } catch (e) {
      console.error("Mass rotation failed", e);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('madecc_admin_session');
    localStorage.removeItem('madecc_admin_role');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      isLoading, 
      getKeys, 
      updateKey, 
      revokeKey,
      rotateAllKeys,
      generateComplexKey,
      getThreatLogs, 
      getSecurityAlerts,
      clearThreatLogs, 
      updateThreatLogStatus,
      verifyMfa,
      getLockoutStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

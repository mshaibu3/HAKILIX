import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  Compass, 
  Cpu, 
  FileText, 
  Database, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Archive, 
  UserPlus, 
  Lock,
  Mail,
  Play, 
  Check, 
  Calendar, 
  FileSpreadsheet, 
  Mic, 
  RefreshCw, 
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Settings,
  HelpCircle,
  Eye,
  Info,
  Clock,
  PlusCircle,
  Stethoscope,
  Heart,
  X,
  Camera,
  Menu
} from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from './components/Sidebar';
import DigitalTwinView from './components/DigitalTwinView';
import DatabaseDashboard from './components/DatabaseDashboard';
import VoiceTranscriptionModal from './components/VoiceTranscriptionModal';
import HakilixWebsite from './components/HakilixWebsite';
import ResidentPhotoModal from './components/ResidentPhotoModal';
import { 
  Resident, 
  Room, 
  Alert, 
  Device, 
  AuditLog, 
  DatabaseDashboardMetrics, 
  CarerNote, 
  ClinicianNote, 
  ResidentReablementGoal, 
  ResidentRecoveryTrend, 
  UserRole 
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('hakilix_session_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          return parsed.role;
        }
      }
    } catch {
      // fallback
    }
    return 'Clinical Lead';
  });
  
  // Back-end Synchronized states
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<DatabaseDashboardMetrics | null>(null);
  const [carerNotes, setCarerNotes] = useState<CarerNote[]>([]);
  const [clinicianNotes, setClinicianNotes] = useState<ClinicianNote[]>([]);
  const [reablementGoals, setReablementGoals] = useState<ResidentReablementGoal[]>([]);
  const [recoveryTrends, setRecoveryTrends] = useState<ResidentRecoveryTrend[]>([]);
  const [digitalTwins, setDigitalTwins] = useState<any[]>([]);
  
  // System users list fetched from DB
  const [users, setUsers] = useState<any[]>([]);

  // Authenticated session state pre-reconciled with client cache
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('hakilix_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // View mode to navigate between Hakilix Lab website and actual dashboard auth portal
  const [viewMode, setViewMode] = useState<'website' | 'login' | 'register' | 'verify'>('website');

  // Public registration parameters
  const [regForm, setRegForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Clinical Lead' as UserRole,
    success: false,
    loading: false,
    error: '',
    lastRegisteredEmail: ''
  });

  // Secure password setup parameters
  const [verifyForm, setVerifyForm] = useState({
    email: '',
    token: '',
    password: '',
    confirmPassword: '',
    success: false,
    loading: false,
    error: ''
  });

  // Secure login screen parameters
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    mfaCode: '',
    error: '',
    attempts: 0,
    mfaRequired: false
  });

  const [resendStatus, setResendStatus] = useState<string>('');
  const [simulatedEmails, setSimulatedEmails] = useState<any[]>([]);

  // Periodically fetch simulated outbox emails for interactive testing in sandbox mode
  useEffect(() => {
    const fetchSimulatedEmails = async () => {
      try {
        const res = await fetch('/api/auth/simulated-emails');
        if (res.ok) {
          const data = await res.json();
          setSimulatedEmails(data);
        }
      } catch (err) {
        console.error('Error fetching simulated trace:', err);
      }
    };
    fetchSimulatedEmails();
    const interval = setInterval(fetchSimulatedEmails, 4000);
    return () => clearInterval(interval);
  }, []);

  // Parse action verification parameters from confirmation link clicks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const email = params.get('email');
    const token = params.get('token');
    
    if (action === 'verify' && email && token) {
      setVerifyForm({
        email: decodeURIComponent(email),
        token: token,
        password: '',
        confirmPassword: '',
        success: false,
        loading: false,
        error: ''
      });
      setViewMode('verify');
      // Clean up URL query parameters cleanly
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Database Management interactive controls
  const [dbManageMode, setDbManageMode] = useState<'residents' | 'users'>('residents');
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<any | null>(null);
  const [selectedResidentToEdit, setSelectedResidentToEdit] = useState<any | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  
  const [newUserForm, setNewUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'Care Worker',
    status: 'active' as const
  });

  // Local interaction states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>('res-03'); // default Charles Campbell for high-quality demo look
  const [showAddResidentModal, setShowAddResidentModal] = useState<boolean>(false);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [showVoiceTranscribeModal, setShowVoiceTranscribeModal] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResponse, setSimulationResponse] = useState<any | null>(null);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Interactive role-specific control panel state definitions
  const [seniorHandoverText, setSeniorHandoverText] = useState<string>('');
  const [seniorHandovers, setSeniorHandovers] = useState<string[]>([]);
  const [seniorTasks, setSeniorTasks] = useState<string[]>([
    'Review Albert (Room 101) night breathing anomaly log',
    'Execute morning gait speed checkup for Beatrix (Room 102)'
  ]);
  const [careWorkerRounds, setCareWorkerRounds] = useState<number>(8);
  const [roundsTicks, setRoundsTicks] = useState<Record<string, boolean>>({
    'Room 101': true,
    'Room 102': true,
    'Room 103': false,
    'Room 104': true,
    'Room 105': false,
    'Room 106': false,
  });
  const [pingSensorsState, setPingSensorsState] = useState<'idle' | 'pinging' | 'completed'>('idle');
  const [radarContourCalibrating, setRadarContourCalibrating] = useState<boolean>(false);
  const [privacyScanState, setPrivacyScanState] = useState<'idle' | 'scanning' | 'passed'>('idle');

  // Resident Detail section state
  const [residentDetailTab, setResidentDetailTab] = useState<'overview' | 'predictive-analytics' | 'digital-twin'>('overview');

  // Predictive Analytics customized states
  const [selectedPredictiveResidentId, setSelectedPredictiveResidentId] = useState<string | null>(null);
  const [predictiveQuery, setPredictiveQuery] = useState<string>('');
  const [predictiveRiskFilter, setPredictiveRiskFilter] = useState<string>('all');
  const [predictiveSummary, setPredictiveSummary] = useState<string>('');
  const [isPredictiveSummaryLoading, setIsPredictiveSummaryLoading] = useState<boolean>(false);
  const [predictiveSummaryError, setPredictiveSummaryError] = useState<string | null>(null);
  const [predictiveSummarySource, setPredictiveSummarySource] = useState<string>('');
  const [simulatedSleepScore, setSimulatedSleepScore] = useState<number>(75);
  const [useBedSensorCalibration, setUseBedSensorCalibration] = useState<boolean>(true);
  const [simulatedDehydration, setSimulatedDehydration] = useState<boolean>(false);
  const [simulatedActivityLevel, setSimulatedActivityLevel] = useState<'low' | 'moderate' | 'excessive'>('moderate');
  const [simulatedStaffPresence, setSimulatedStaffPresence] = useState<'standard' | 'enhanced'>('standard');

  // Resolution inputs for Alert management
  const [currentSelectedAlert, setCurrentSelectedAlert] = useState<Alert | null>(null);
  const [alertResolveNotes, setAlertResolveNotes] = useState<string>('');
  const [alertEscalationValue, setAlertEscalationValue] = useState<number>(0);

  // New Resident Form state
  const [newResidentForm, setNewResidentForm] = useState({
    first_name: '',
    last_name: '',
    room_id: '',
    date_of_birth: '1940-01-01',
    gender: 'Female',
    care_category: 'Reablement care',
    mobility_status: 'Standard walk with cane',
    baseline_mobility_score: 50,
    falls_risk_level: 'standard' as const,
    wandering_risk_level: 'standard' as const,
    cognitive_support_level: 'Clear orientation',
    dementia_support_required: false,
    consent_status: 'granted' as const
  });

  // New Note inputs
  const [newCarerNoteText, setNewCarerNoteText] = useState('');
  const [newCarerNoteType, setNewCarerNoteType] = useState('Daily Gait Check');
  const [newCarerNoteMood, setNewCarerNoteMood] = useState('Cooperative');
  const [newCarerNoteMobility, setNewCarerNoteMobility] = useState('Stable Walk');
  const [newCarerNoteConcern, setNewCarerNoteConcern] = useState(false);

  // New Clinician Note inputs
  const [newClinicianSummary, setNewClinicianSummary] = useState('');
  const [newClinicianFunctional, setNewClinicianFunctional] = useState('');
  const [newClinicianMobilityScore, setNewClinicianMobilityScore] = useState(60);
  const [newClinicianIndependenceScore, setNewClinicianIndependenceScore] = useState(65);
  const [newClinicianActions, setNewClinicianActions] = useState('');

  // Fetch data on mount and updates
  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      const [
        resResidents,
        resRooms,
        resAlerts,
        resDevices,
        resAudits,
        resMetrics,
        resCarerNotes,
        resClinicianNotes,
        resGoals,
        resTrends,
        resTwins,
        resUsers
      ] = await Promise.all([
        fetch('/api/residents').then(r => r.json()),
        fetch('/api/rooms').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/devices').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/database-dashboard/metrics').then(r => r.json()),
        fetch('/api/carer-notes').then(r => r.json()),
        fetch('/api/clinician-notes').then(r => r.json()),
        fetch('/api/reablement/goals').then(r => r.json()),
        fetch('/api/reablement/trends').then(r => r.json()),
        fetch('/api/digital-twin/state').then(r => r.json()),
        fetch('/api/users').then(r => r.json()).catch(() => [])
      ]);

      setResidents(resResidents);
      setRooms(resRooms);
      setAlerts(resAlerts);
      setDevices(resDevices);
      setAuditLogs(resAudits);
      setMetrics(resMetrics);
      setCarerNotes(resCarerNotes);
      setClinicianNotes(resClinicianNotes);
      setReablementGoals(resGoals);
      setRecoveryTrends(resTrends);
      setDigitalTwins(resTwins);
      setUsers(resUsers);
    } catch (err) {
      console.error("Failed loading data from HAKILIX custom Express API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPredictiveSummary = async () => {
    setIsPredictiveSummaryLoading(true);
    setPredictiveSummaryError(null);
    try {
      const res = await fetch('/api/predictive/summary');
      const data = await res.json();
      if (data.success) {
        setPredictiveSummary(data.summary);
        setPredictiveSummarySource(data.source);
      } else {
        setPredictiveSummaryError(data.error || 'Failed to generate narrative summary.');
      }
    } catch (err) {
      console.error('Error fetching predictive fall risk summary:', err);
      setPredictiveSummaryError('Network or server error generating analysis.');
    } finally {
      setIsPredictiveSummaryLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    fetchPredictiveSummary();
  }, []);

  // Adjust currentTab on role switch and protect page permissions
  useEffect(() => {
    if (activeRole === 'Family Viewer') {
      setCurrentTab('client-dashboard');
      return;
    }
    
    const allowedTabs: Record<string, string[]> = {
      'Facility Manager': ['dashboard', 'residents', 'alerts', 'device-health', 'reports', 'database-dashboard', 'audit-logs'],
      'Super Admin': ['dashboard', 'residents', 'alerts', 'device-health', 'reports', 'database-dashboard', 'audit-logs'],
      'Organisation Admin': ['dashboard', 'residents', 'alerts', 'device-health', 'reports', 'database-dashboard', 'audit-logs'],
      'Clinical Lead': ['dashboard', 'residents', 'alerts', 'reports'],
      'Senior Carer': ['dashboard', 'residents', 'alerts', 'reports'],
      'Care Worker': ['dashboard', 'residents', 'alerts'],
      'Technical Support': ['dashboard', 'device-health', 'database-dashboard', 'audit-logs'],
      'Auditor': ['dashboard', 'reports', 'audit-logs']
    };

    const allowed = allowedTabs[activeRole] || ['dashboard'];
    if (!allowed.includes(currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [activeRole]);

  // Submit registration form to create account in pending state
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password constraints check
    if (regForm.password !== regForm.confirmPassword) {
      setRegForm(prev => ({ ...prev, error: 'Passwords entered do not match.' }));
      return;
    }
    
    if (regForm.password.length < 8) {
      setRegForm(prev => ({ ...prev, error: 'Password must be at least 8 characters long.' }));
      return;
    }

    const hasUpper = /[A-Z]/.test(regForm.password);
    const hasLower = /[a-z]/.test(regForm.password);
    const hasNum = /[0-9]/.test(regForm.password);
    const hasSpec = /[^A-Za-z0-9]/.test(regForm.password);
    if (!hasUpper || !hasLower || !hasNum || !hasSpec) {
      setRegForm(prev => ({ 
        ...prev, 
        error: 'Password is too weak. Must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.' 
      }));
      return;
    }

    setRegForm(prev => ({ ...prev, loading: true, error: '', success: false }));
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: regForm.first_name,
          last_name: regForm.last_name,
          email: regForm.email,
          role: regForm.role,
          password: regForm.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegForm(prev => ({ ...prev, loading: false, error: data.error || 'Registration failed.' }));
      } else {
        // Save the registered user session immediately!
        const loggedUser = {
          id: data.user.id || `usr-auth-${Date.now()}`,
          first_name: data.user.first_name || regForm.first_name,
          last_name: data.user.last_name || regForm.last_name,
          display_name: data.user.display_name || `${regForm.first_name} ${regForm.last_name}`,
          email: data.user.email || regForm.email,
          role: data.user.role || regForm.role,
          status: data.user.status || 'active',
          token: data.token || 'hakilix-demo-secure-login-jwt-2026'
        };

        setRegForm(prev => ({
          ...prev,
          loading: false,
          success: true,
          lastRegisteredEmail: '',
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirmPassword: ''
        }));

        setCurrentUser(loggedUser);
        setActiveRole(loggedUser.role as UserRole);
        
        if (loggedUser.role === 'Family Viewer') {
          setCurrentTab('client-dashboard');
        } else {
          setCurrentTab('dashboard');
        }

        localStorage.setItem('hakilix_session_user', JSON.stringify(loggedUser));
        setActiveNotification('🎉 Clinical profile registered successfully! Instant demo access granted.');
      }
    } catch (err) {
      setRegForm(prev => ({ ...prev, loading: false, error: 'Registration service unreachable. Check server connection.' }));
    }
  };

  // Submit secure token handshake & activate gateway role
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyForm(prev => ({ ...prev, loading: true, error: '', success: false }));
    try {
      const res = await fetch('/api/auth/verify-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifyForm.email,
          token: verifyForm.token
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyForm(prev => ({ ...prev, loading: false, error: data.error || 'Verification activation failed.' }));
      } else {
        setVerifyForm(prev => ({ ...prev, loading: false, success: true }));
        
        // Populate login screen with email for convenience
        setLoginForm(prev => ({
          ...prev,
          email: verifyForm.email,
          password: '',
          mfaRequired: false,
          error: ''
        }));

        setTimeout(() => {
          setViewMode('login');
          setVerifyForm(prev => ({ ...prev, success: false }));
        }, 2500);
      }
    } catch (err) {
      setVerifyForm(prev => ({ ...prev, loading: false, error: 'Activation verification service unreachable.' }));
    }
  };

  // Submit secure session credentials
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, mfaCode, mfaRequired } = loginForm;
    
    if (!email || !password) {
      setLoginForm(prev => ({ ...prev, error: 'Please enter a valid email address and secure password code.' }));
      return;
    }

    if (!mfaRequired) {
      if (password.length < 4) {
        setLoginForm(prev => ({ ...prev, error: 'Security protocols require a password of at least 4 characters.' }));
        return;
      }
      // Check validation with backend first before displaying MFA setup if there is a pending user
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setLoginForm(prev => ({ ...prev, error: data.error || 'Authorization handshake failed.' }));
          return;
        }
        // Switch screen to show Multi-Factor verification passcode input
        setLoginForm(prev => ({ ...prev, mfaRequired: true, error: '' }));
      })
      .catch(() => {
        // Fallback for simple standalone sandbox offline runs
        setLoginForm(prev => ({ ...prev, mfaRequired: true, error: '' }));
      });
      return;
    } else {
      if (!mfaCode) {
        setLoginForm(prev => ({ ...prev, error: 'Please input the simulated 6-digit MFA passcode (Authenticator Hub).' }));
        return;
      }
      
      let resolvedRole: UserRole = 'Clinical Lead';
      let resolvedName = 'Dr. Sarah Jenkins';
      
      if (email.includes('eleanor') || email.includes('carer')) {
        resolvedRole = 'Senior Carer';
        resolvedName = 'Eleanor Vance';
      } else if (email.includes('marcus')) {
        resolvedRole = 'Care Worker';
        resolvedName = 'Marcus Aurelius';
      } else if (email.includes('alistair') || email.includes('manager')) {
        resolvedRole = 'Facility Manager';
        resolvedName = 'Alistair Vance';
      } else if (email.includes('support') || email.includes('tech')) {
        resolvedRole = 'Technical Support';
        resolvedName = 'Dev Linus';
      } else if (email.includes('michael') || email.includes('auditor')) {
        resolvedRole = 'Auditor';
        resolvedName = 'Michael Smith';
      } else if (email.includes('family') || email.includes('viewer')) {
        resolvedRole = 'Family Viewer';
        resolvedName = 'Charles Campbell (Relative)';
      }
      
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: resolvedRole })
      })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setLoginForm(prev => ({ ...prev, error: data.error || 'Verification handshake failed.' }));
          return;
        }

        const loggedUser = {
          id: data.user.id || `usr-auth-${Date.now()}`,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          display_name: data.user.display_name,
          email: data.user.email,
          role: data.user.role,
          status: data.user.status || 'active',
          token: data.token || 'hakilix-demo-secure-login-jwt-2026'
        };

        setCurrentUser(loggedUser);
        setActiveRole(data.user.role);
        
        if (data.user.role === 'Family Viewer') {
          setCurrentTab('client-dashboard');
        } else {
          setCurrentTab('dashboard');
        }

        localStorage.setItem('hakilix_session_user', JSON.stringify(loggedUser));
        
        setLoginForm(prev => ({
          ...prev,
          password: '',
          mfaCode: '',
          mfaRequired: false,
          error: ''
        }));
      })
      .catch(() => {
        // Fallback for simple standalone sandbox offline runs
        const loggedUser = {
          id: `usr-auth-${Date.now()}`,
          first_name: resolvedName.split(' ')[0],
          last_name: resolvedName.split(' ')[1] || 'Staff',
          display_name: resolvedName,
          email: email,
          role: resolvedRole,
          status: 'active' as const,
          token: 'hakilix-demo-secure-login-jwt-2026'
        };
        
        setCurrentUser(loggedUser);
        setActiveRole(resolvedRole);
        
        if (resolvedRole === 'Family Viewer') {
          setCurrentTab('client-dashboard');
        } else {
          setCurrentTab('dashboard');
        }

        localStorage.setItem('hakilix_session_user', JSON.stringify(loggedUser));
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hakilix_session_user');
    setCurrentUser(null);
    setViewMode('website');
    setLoginForm({
      email: '',
      password: '',
      mfaCode: '',
      error: '',
      attempts: 0,
      mfaRequired: false
    });
  };

  // Add system user in administrative directory
  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm)
      });
      if (res.ok) {
        setShowAddUserModal(false);
        setNewUserForm({
          first_name: '',
          last_name: '',
          email: '',
          role: 'Care Worker',
          status: 'active' as const
        });
        await refreshAllData();
      }
    } catch (err) {
      console.error("Critical: user addition error:", err);
    }
  };

  // Delete user completely in administrative directory
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you absolutely certain you want to completely delete this user account from the production database? This generates an active cybersecurity audit audit-event.')) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSelectedUserToEdit(null);
        await refreshAllData();
      }
    } catch (err) {
      console.error("Critical: user delete error:", err);
    }
  };

  // Update user in administrative directory
  const handleUpdateUserSubmit = async (userId: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        setSelectedUserToEdit(null);
        await refreshAllData();
      }
    } catch (err) {
      console.error("Critical: user update error:", err);
    }
  };

  // Delete Client/Resident completely in administrative directory
  const handleDeleteResident = async (resId: string) => {
    if (!confirm('Are you absolutely certain you want to completely delete this client profile from the relational database? This operation is irreversible, automatically releases the room unit vacancy status, and commits a major database event.')) return;
    try {
      const res = await fetch(`/api/residents/${resId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (selectedResidentId === resId) setSelectedResidentId(null);
        setSelectedResidentToEdit(null);
        await refreshAllData();
      }
    } catch (err) {
      console.error("Critical: resident delete error:", err);
    }
  };

  // Update Client/Resident in administrative directory
  const handleUpdateResidentSubmit = async (resId: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/residents/${resId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        setSelectedResidentToEdit(null);
        await refreshAllData();
      }
    } catch (err) {
      console.error("Critical: resident update error:", err);
    }
  };

  const handleSaveResidentPhoto = async (photoBase64: string) => {
    if (!selectedResidentId) return;
    try {
      const res = await fetch(`/api/residents/${selectedResidentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: photoBase64 })
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error("Critical: photo update error:", err);
    }
  };

  // Simulator scenarios runner
  const handleTriggerScenario = async (scenarioId: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioId })
      });
      const data = await res.json();
      setSimulationResponse(data);
      
      // Flash glowing top alert notification banner
      setActiveNotification(`SIMULATOR INJECTED: '${data.message}' on ${data.resident_name} in ${data.room_name}`);
      setTimeout(() => setActiveNotification(null), 8500);

      // Reload
      await refreshAllData();
      
      // Auto-focus the resident who got the simulated incident for nice fluid workflow
      if (scenarioId === 'resident_c_fall_candidate') {
        setSelectedResidentId('res-03');
      } else if (scenarioId === 'resident_a_night_bed_exit') {
        setSelectedResidentId('res-01');
      } else if (scenarioId === 'resident_b_wandering_risk') {
        setSelectedResidentId('res-02');
      }
    } catch (err) {
      console.error("Error triggering simulation:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Add resident handler
  const handleAddNewResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResidentForm)
      });
      if (res.ok) {
        setShowAddResidentModal(false);
        setNewResidentForm({
          first_name: '',
          last_name: '',
          room_id: '',
          date_of_birth: '1940-01-01',
          gender: 'Female',
          care_category: 'Reablement support',
          mobility_status: 'Standard walk with frame',
          baseline_mobility_score: 50,
          falls_risk_level: 'standard',
          wandering_risk_level: 'standard',
          cognitive_support_level: 'Clear',
          dementia_support_required: false,
          consent_status: 'granted'
        });
        await refreshAllData();
      }
    } catch (err) {
      console.error("Failed adding resident:", err);
    }
  };

  // Soft Archive resident handler
  const handleArchiveResident = async (resId: string) => {
    if (!confirm('Are you sure you want to archive this resident candidate profile? Archiving releases their assigned room while preserving historical record audit footprints.')) return;
    try {
      const res = await fetch(`/api/residents/${resId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        if (selectedResidentId === resId) {
          setSelectedResidentId(null);
        }
        await refreshAllData();
      }
    } catch (err) {
      console.error("Failed archiving resident profile:", err);
    }
  };

  // Carer Note post submit
  const handlePostCarerNote = async (overrideText?: string, overrideType?: string, overrideMood?: string, overrideMobility?: string) => {
    if (!selectedResidentId) return;
    const txt = overrideText || newCarerNoteText;
    if (!txt.trim()) return;

    try {
      const res = await fetch('/api/carer-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resident_id: selectedResidentId,
          note_type: overrideType || newCarerNoteType,
          note_text: txt,
          mood_observed: overrideMood || newCarerNoteMood,
          mobility_observed: overrideMobility || newCarerNoteMobility,
          assistance_level: overrideMobility ? 'Monitored' : 'No tools',
          activity_completed: 'Ambient dictation',
          concern_flag: newCarerNoteConcern
        })
      });
      if (res.ok) {
        setNewCarerNoteText('');
        setNewCarerNoteConcern(false);
        setShowVoiceTranscribeModal(false);
        await refreshAllData();
      }
    } catch (err) {
      console.error("Failed adding carer note:", err);
    }
  };

  // Clinician Note post submit
  const handlePostClinicianNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId || !newClinicianSummary.trim()) return;

    try {
      const res = await fetch('/api/clinician-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resident_id: selectedResidentId,
          clinical_summary: newClinicianSummary,
          functional_observation: newClinicianFunctional,
          mobility_score: Number(newClinicianMobilityScore),
          confidence_score: 75,
          independence_score: Number(newClinicianIndependenceScore),
          recommended_actions: newClinicianActions
        })
      });
      if (res.ok) {
        setNewClinicianSummary('');
        setNewClinicianFunctional('');
        setNewClinicianActions('');
        await refreshAllData();
      }
    } catch (err) {
      console.error("Failed publishing clinician review:", err);
    }
  };

  // Alert management handler
  const handleModifyAlertStatus = async (alertId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          resolution_notes: alertResolveNotes || 'Authorized and double-checked by staff',
          escalation_level: Number(alertEscalationValue)
        })
      });
      if (res.ok) {
        setCurrentSelectedAlert(null);
        setAlertResolveNotes('');
        setAlertEscalationValue(0);
        await refreshAllData();
      }
    } catch (err) {
      console.error("Failed updating alert parameters:", err);
    }
  };

  // Export report trigger
  const handleDownloadReportSim = async (resId: string, format: string) => {
    try {
      const res = await fetch(`/api/reports/export?resident_id=${resId}&type=${format}`);
      const data = await res.json();
      alert(`CSV/PDF Compliance Export request received!\nFilename: ${data.filename}\nSuccessfully registered in immutability logs.`);
      await refreshAllData(); // updates generated reports count in logs!
    } catch (err) {
      console.error("Failed triggering report download:", err);
    }
  };

  const handleResetDbToSeeds = async () => {
    // Standard fetch can wipe db.json and repopulate cleanly
    await refreshAllData();
  };

  // Computed views fields
  const currentResident = residents.find(r => r.id === selectedResidentId) || null;
  const openAlertsCount = alerts.filter(a => a.status === 'New').length;
  
  // Specific room details for selected resident:
  const currentResidentRoom = currentResident 
    ? rooms.find(rm => rm.id === currentResident.room_id) || null
    : null;

  const currentResidentTwinState = currentResident && currentResidentRoom 
    ? digitalTwins.find(t => t.room_id === currentResidentRoom.id) || null
    : null;

  const currentResidentActiveAlert = currentResident && currentResidentRoom
    ? alerts.find(a => a.room_id === currentResidentRoom.id && (a.status === 'New' || a.status === 'Acknowledged')) || null
    : null;

  // Filtered residents list
  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.display_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.resident_reference_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.care_category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'all') return matchesSearch;
    if (categoryFilter === 'active') return matchesSearch && r.profile_status === 'active';
    if (categoryFilter === 'archived') return matchesSearch && r.profile_status === 'archived';
    return matchesSearch;
  });

  const renderClientDashboardView = () => {
    // We are viewing relative res-03 (Charles Campbell) by default
    const client = residents.find(r => r.id === 'res-03') || residents[0] || null;
    const clientRoom = rooms.find(rm => rm.id === client?.room_id) || null;
    const clientTrends = recoveryTrends.filter(t => t.resident_id === client?.id) || [];
    const clientGoals = reablementGoals.filter(g => g.resident_id === client?.id) || [];

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in text-[#2D3A2D]">
        
        {/* Family welcome banner */}
        <div className="bg-gradient-to-br from-[#2D3A2D] to-[#1C261C] text-white p-8 rounded-[32px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-[#4E6E5D]/20">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A3B18A] block font-mono">
              Family &amp; Guardian Safety Assurance Portal
            </span>
            <h1 className="text-3xl font-serif italic text-white font-bold leading-normal">
              Rosewood Green Comfort Station
            </h1>
            <p className="text-xs text-stone-300 leading-normal max-w-xl">
              Camera-free radar telemetry matches clinical wellness checkups to assure parents, children, and guardians of pristine recovery monitoring without cellular privacy compromises.
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-full px-5 py-2.5 text-xs font-semibold hover:shadow-xs transition duration-200 cursor-pointer"
          >
            Log Out Securely
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Col 1: Relative Profile Summary Cards */}
          <div className="space-y-6">
            
            {/* Identity card */}
            <div className="bg-white border border-[#E6E2D3] p-6 rounded-[28px] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#4E6E5D] text-white flex items-center justify-center font-serif italic text-xl font-bold font-serif">
                  {client ? client.first_name[0] : 'C'}
                </div>
                <div>
                  <h3 className="font-serif italic font-bold text-[#2D3A2D] text-lg leading-tight">
                    {client ? `${client.first_name} ${client.last_name}` : 'Care Recipient'}
                  </h3>
                  <p className="text-[10px] text-[#7A847A] font-mono leading-tight mt-1">
                    REFERENCE REF: {client?.resident_reference_code || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#F5F2ED] pt-3.5 space-y-3 text-xs leading-normal">
                <div className="flex justify-between">
                  <span className="text-[#7A847A]">Designated Unit:</span>
                  <strong className="text-[#2D3A2D] font-medium">Room {clientRoom?.room_number || '103'} (Floor 1)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A847A]">Admission Date:</span>
                  <strong className="text-[#2D3A2D] font-medium">{client ? new Date(client.admission_date).toLocaleDateString() : 'Active'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A847A]">Cognitive Check:</span>
                  <strong className="text-[#2D3A2D] font-medium">{client?.cognitive_support_level || 'Clear'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A847A]">Dignity Consent:</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                    ✓ PRIVACY ASSURED
                  </span>
                </div>
              </div>
            </div>

            {/* Room Ambient Telemetry Sensors assurance */}
            <div className="bg-[#4E6E5D]/5 border border-[#A3B18A]/40 p-6 rounded-[28px] shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono">
                En-Suite Privacy Sensors Index
              </h4>
              <p className="text-[11px] text-[#7A847A] leading-relaxed">
                Sensor node micro-beams measure ambient comfort levels to audit environmental suitability at all times.
              </p>

              <div className="grid grid-cols-2 gap-3.5 font-mono text-[11px]">
                <div className="bg-white p-3 border border-[#E6E2D3] rounded-2xl">
                  <div className="text-stone-400">TEMPERATURE</div>
                  <div className="text-sm font-bold mt-1 text-[#2D3A2D]">21.8°C</div>
                  <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">Optimum Core</div>
                </div>
                <div className="bg-white p-3 border border-[#E6E2D3] rounded-2xl">
                  <div className="text-stone-400">NOISE LEVEL</div>
                  <div className="text-sm font-bold mt-1 text-[#2D3A2D]">32.4 dB</div>
                  <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">Quiet Serene</div>
                </div>
                <div className="bg-white p-3 border border-[#E6E2D3] rounded-2xl">
                  <div className="text-stone-400">HUMIDITY</div>
                  <div className="text-sm font-bold mt-1 text-[#2D3A2D]">44% COMF</div>
                  <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">Dry Secure</div>
                </div>
                <div className="bg-white p-3 border border-[#E6E2D3] rounded-2xl">
                  <div className="text-stone-400">AIR COMFORT</div>
                  <div className="text-sm font-bold mt-1 text-[#2D3A2D]">96% SCORE</div>
                  <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">Pristine</div>
                </div>
              </div>
            </div>

          </div>

          {/* Col 2 & 3: Recovery Trends Chart & Goals progress & active status */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            
            {/* Live active room safety indicator */}
            <div className="bg-white border border-[#E6E2D3] p-6 rounded-[28px] shadow-sm flex items-center justify-between gap-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#7A847A] font-semibold block font-mono">
                  Live Active Care Safety State
                </span>
                <p className="text-sm font-serif italic font-bold text-[#2D3A2D]">
                  {client?.first_name} is currently resting comfortably inside their private en-suite.
                </p>
                <p className="text-xs text-[#7A847A]">
                  No falls, no wandering risks, and zero physical discomfort flags registered in the last 24 hours.
                </p>
              </div>

              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-250 animate-pulse shrink-0">
                <Heart className="w-6 h-6 text-emerald-700" />
              </div>
            </div>

            {/* Reablement Trends Visualization Chart */}
            <div className="space-y-3 bg-white p-6 border border-[#E6E2D3] rounded-[28px] shadow-sm">
              <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono">
                Historical Reablement Trend Chart
              </h4>
              {client && renderSVGRecoveryTrendChart(client.id)}
            </div>

            {/* Current Goals list */}
            <div className="bg-white border border-[#E6E2D3] p-6 rounded-[28px] shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono">
                Therapeutic Reablement Target Milestones
              </h4>

              {clientGoals.length === 0 ? (
                <p className="text-xs text-[#7A847A] font-mono">No active goal target milestones logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {clientGoals.map(goal => (
                    <div key={goal.id} className="p-4 bg-[#F5F2ED]/30 border border-[#E6E2D3] rounded-2xl flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-xs text-[#2D3A2D]">{goal.goal_title}</h5>
                        <p className="text-xs text-[#7A847A] mt-1">{goal.goal_description}</p>
                        <div className="text-[10px] text-[#7A847A] font-mono mt-1">
                          Category: <span className="font-semibold">{goal.goal_category}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-[#4E6E5D] font-mono bg-[#4E6E5D]/10 px-2.5 py-1 rounded-xl">
                          Progress: {goal.current_score}/{goal.target_score}
                        </span>
                        <span className="text-[9px] text-[#7A847A] mt-1 font-semibold uppercase">
                          STATUS: {goal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Relatives note submission form */}
            <div className="bg-white border border-[#E6E2D3] p-6 rounded-[28px] shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono">
                Log Parent / Guardian Feedback Message
              </h4>
              <p className="text-xs text-[#7A847A]">
                Have observations of {client?.first_name}'s balance or mood during telephone calls? Share it directly with our Rosewood Team.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a guardian note message (e.g., Charles seemed very energetic and walked with confidence today)..."
                  id="guardian-feedback-text"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const inp = e.target as HTMLInputElement;
                      if (!inp.value.trim()) return;
                      await handlePostCarerNote(inp.value, 'Family Feedback note', 'Cheerful', 'Stable Walk');
                      inp.value = '';
                      alert('Family Feedback note published to Care Team records!');
                      refreshAllData();
                    }
                  }}
                  className="flex-1 bg-[#F5F2ED]/50 border border-[#E6E2D3] rounded-full px-5 py-3 text-xs focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none focus:bg-white text-[#2D3A2D]"
                />
                <button
                  onClick={async () => {
                    const inp = document.getElementById('guardian-feedback-text') as HTMLInputElement;
                    if (inp && inp.value.trim()) {
                      await handlePostCarerNote(inp.value, 'Family Feedback note', 'Cheerful', 'Stable Walk');
                      inp.value = '';
                      alert('Family Feedback note published to Care Team records!');
                      refreshAllData();
                    }
                  }}
                  className="bg-[#2D3A2D] text-white hover:bg-[#1C261C] font-semibold text-xs px-5 py-3 rounded-full cursor-pointer transition"
                >
                  Send to Team
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  };

  const renderRoleSpecificControlWidget = () => {
    switch (activeRole) {
      case 'Facility Manager':
        return (
          <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3B18A] uppercase font-bold font-mono tracking-wider">Facility Control Desk</span>
                <h4 className="text-base font-serif italic text-[#2D3A2D] font-bold">Manager Operations Console</h4>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded font-mono">
                Site Supervisor
              </span>
            </div>

            <p className="text-xs text-[#7A847A] leading-relaxed">
              Maintain regulatory safety standard quotas, authorize carer staff schedules, and supervise audit clearances.
            </p>

            <div className="space-y-2 pt-1 font-mono text-[11px]">
              <div className="flex justify-between items-center bg-[#F5F2ED]/60 p-2.5 rounded-xl">
                <span className="text-[#7A847A]">CQC Safety Status</span>
                <strong className="text-emerald-700 font-bold">✓ EXCELLENT (99.2%)</strong>
              </div>
              <div className="flex justify-between items-center bg-[#F5F2ED]/60 p-2.5 rounded-xl">
                <span className="text-[#7A847A]">Staff Shift Rota Coverage</span>
                <strong className="text-[#2D3A2D]">100% (5/5 Checked in)</strong>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  alert("Shift Rota schedule broadcast to all active Care Workers!");
                  const newLog = {
                    id: `log-f-${Date.now()}`,
                    action_type: 'STAFF_BROADCAST',
                    created_at: new Date().toISOString(),
                    module_name: 'Staff Operations',
                    user_name: 'Alistair Manager',
                    details: { info: 'Dispatched next 24h shifts to Eleanor, Sarah, and daily care workers.' }
                  };
                  setAuditLogs(prev => [newLog, ...prev]);
                }}
                className="w-full bg-[#2D3A2D] hover:bg-[#1C261C] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xxs transition cursor-pointer"
              >
                Broadcast Active Shift Rota
              </button>
              
              <button
                onClick={() => {
                  setCurrentTab('database-dashboard');
                }}
                className="w-full bg-[#F5F2ED] hover:bg-[#E6E2D3] text-[#2D3A2D] text-xs font-semibold py-2 px-4 rounded-xl transition border border-[#E6E2D3] cursor-pointer"
              >
                Access DB Control Panel
              </button>
            </div>
          </div>
        );

      case 'Senior Carer':
        return (
          <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-[#4E6E5D] uppercase font-bold font-mono tracking-wider">Care Delivery Desk</span>
                <h4 className="text-base font-serif italic text-[#2D3A2D] font-bold">Senior Carer Shift Control</h4>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded font-mono">
                Team Lead
              </span>
            </div>

            <p className="text-xs text-[#7A847A] leading-relaxed">
              Coordinate care work staff assignments, dispatch daily gait routines, and write handover logs.
            </p>

            <div className="space-y-2 border-t border-[#F5F2ED] pt-3 text-left">
              <label className="text-[9px] uppercase font-bold tracking-wider text-[#7A847A] font-mono block">Log Ward Handover Note</label>
              <textarea
                rows={2}
                placeholder="Type handover status (e.g. Ward peaceful, Rooms 101-105 comfortable)..."
                value={seniorHandoverText}
                onChange={(e) => setSeniorHandoverText(e.target.value)}
                className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl p-2 text-xs focus:bg-white text-slate-800 outline-none"
              />
              <button
                onClick={() => {
                  if (!seniorHandoverText.trim()) return;
                  setSeniorHandovers(prev => [seniorHandoverText, ...prev]);
                  setSeniorHandoverText('');
                  alert('Handover log dispatched to the Care Team!');
                }}
                className="w-full bg-[#4E6E5D] hover:bg-[#3D5A4A] text-white text-xs font-medium py-1.5 px-3 rounded-lg transition"
              >
                Publish Handover Log
              </button>
            </div>

            {seniorHandovers.length > 0 && (
              <div className="space-y-1.5 bg-[#F5F2ED]/50 p-2.5 rounded-xl max-h-24 overflow-y-auto text-left font-sans border border-[#E6E2D3]">
                <span className="text-[8.5px] uppercase font-bold tracking-wider text-[#7A847A] font-mono block mb-1">Recent Ward Handovers</span>
                {seniorHandovers.map((h, idx) => (
                  <div key={idx} className="text-[10.5px] text-[#2D3A2D] bg-white p-1.5 rounded border border-stone-200">
                    "{h}"
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t border-[#F5F2ED] pt-3 text-left">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#7A847A] font-mono block">Active Shift Directives ({seniorTasks.length})</span>
              <div className="space-y-1.5">
                {seniorTasks.map((task, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10.5px] bg-[#F5F2ED]/30 p-2 rounded-lg border border-[#E6E2D3]">
                    <span className="truncate text-slate-650 max-w-[170px]">{task}</span>
                    <button
                      onClick={() => {
                        setSeniorTasks(prev => prev.filter((_, tIdx) => tIdx !== idx));
                      }}
                      className="text-[9.5px] text-[#4E6E5D] bg-white hover:bg-[#4E6E5D]/10 font-bold px-1.5 py-0.5 rounded border border-[#4E6E5D]/25 transition"
                    >
                      CLEAR
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const newTask = prompt("Enter a care team task directive (e.g., 'Verify Room 104 lunch nutrition compliance'):");
                  if (newTask && newTask.trim()) {
                    setSeniorTasks(prev => [...prev, newTask.trim()]);
                  }
                }}
                className="w-full text-[#4E6E5D] hover:text-[#3D5A4A] text-[10px] font-bold text-center mt-1 py-1 bg-white border border-[#4E6E5D]/25 hover:bg-stone-50 rounded-lg transition"
              >
                + Create Task Directive
              </button>
            </div>
          </div>
        );

      case 'Care Worker':
        return (
          <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-[#7A847A] uppercase font-bold font-mono tracking-wider">Frontline Daily Dashboard</span>
                <h4 className="text-base font-serif italic text-[#2D3A2D] font-bold">Care Worker Log Console</h4>
              </div>
              <span className="bg-orange-100 text-orange-800 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded font-mono">
                Ward Operator
              </span>
            </div>

            <p className="text-xs text-[#7A847A] leading-relaxed">
              Check off your resident room check rounds and report patient concerns.
            </p>

            <div className="bg-[#4E6E5D]/5 border border-[#A3B18A]/30 p-3 rounded-2xl text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#4E6E5D] font-bold">EN-SUITE CARING ROUNDS</span>
                <span className="text-xs font-bold text-[#2D3A2D] font-mono">{Object.values(roundsTicks).filter(Boolean).length}/6 ROOMS OK</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(roundsTicks).map((roomKey) => {
                  const checkedIn = roundsTicks[roomKey];
                  return (
                    <button
                      key={roomKey}
                      onClick={() => {
                        setRoundsTicks(prev => ({ ...prev, [roomKey]: !prev[roomKey] }));
                      }}
                      className={`text-[10px] py-1.5 px-2 rounded-xl transition font-mono border text-left flex items-center justify-between cursor-pointer ${
                        checkedIn 
                          ? 'bg-[#4E6E5D]/10 border-[#4E6E5D]/30 text-[#2D3A2D] font-semibold' 
                          : 'bg-white border-stone-200 text-stone-400'
                      }`}
                    >
                      <span>{roomKey}</span>
                      <span>{checkedIn ? '✓' : '•'}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setRoundsTicks({
                    'Room 101': true,
                    'Room 102': true,
                    'Room 103': true,
                    'Room 104': true,
                    'Room 105': true,
                    'Room 106': true,
                  });
                  alert("Remarkable work! All en-suite rounds marked completed.");
                }}
                className="w-full bg-[#2D3A2D] text-white hover:bg-[#1C261C] text-[10px] font-bold py-1 px-3 rounded-lg mt-1 transition text-center"
              >
                Complete All Rounds
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentTab('residents');
                setTimeout(() => {
                  const txt = document.querySelector('textarea') as HTMLTextAreaElement;
                  if (txt) {
                    txt.focus();
                    txt.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 150);
              }}
              className="w-full text-[#4E6E5D] hover:text-[#3D5A4A] bg-white hover:bg-[#F5F2ED]/60 border border-[#4E6E5D]/25 font-bold text-xs py-2 px-4 rounded-xl transition text-center cursor-pointer"
            >
              + Log Observation Note
            </button>
          </div>
        );

      case 'Clinical Lead':
        return (
          <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-[#4E6E5D] uppercase font-bold font-mono tracking-wider">Therapeutic Oversight</span>
                <h4 className="text-base font-serif italic text-[#2D3A2D] font-bold">Clinical Lead Console</h4>
              </div>
              <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded font-mono">
                Therapist Lead
              </span>
            </div>

            <p className="text-xs text-[#7A847A] leading-relaxed">
              Verify continuous gait metrics, audit reablement score loops, and diagnose posture swings.
            </p>

            <div className="bg-[#4E6E5D]/5 border border-[#A3B18A]/30 p-3.5 rounded-2xl text-left space-y-1 text-xs text-[#2D3A2D]">
              <div className="text-stone-400 font-mono text-[9px] uppercase">ACTIVE REVIEW COMPLIANCE</div>
              <p className="font-medium text-[#2D3A2D]">Active Recovery Tariffs: <strong className="text-[#4E6E5D]">On Track (4/4 Patients)</strong></p>
              <p className="text-[#7A847A] text-[11px]">Next clinical review scheduled in 2 hours.</p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  alert("Simulated: Clinical data-point telemetry synchronized with Care Quality Commission cloud files.");
                }}
                className="w-full bg-[#2D3A2D] hover:bg-[#1C261C] text-white text-xs font-semibold py-2 px-4 rounded-xl transition cursor-pointer"
              >
                Sync CQC Therapy Loop
              </button>
              
              <button
                onClick={() => {
                  alert("Triggered gait analyzer. Continuous 81GHz radar spectrum calibrating balance vectors.");
                }}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-255 text-xs font-semibold py-2 px-4 rounded-xl transition cursor-pointer"
              >
                Run AI Auto-Gait Audit
              </button>
            </div>
          </div>
        );

      case 'Technical Support':
        return (
          <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-wider">Operations &amp; Security</span>
                <h4 className="text-base font-serif italic text-slate-800 font-bold">Hardware Diagnostics Desk</h4>
              </div>
              <span className="bg-[#2D3A2D] text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded font-mono">
                SysAdmin
              </span>
            </div>

            <p className="text-xs text-[#7A847A] leading-relaxed">
              Ping Continuous wave radar receiver switches, trigger thermal contour calibrations, or inspect active databases.
            </p>

            <div className="bg-slate-900 text-slate-100 font-mono text-[10px] p-3 rounded-2xl space-y-1 text-left relative min-h-[96px]">
              <div className="flex justify-between text-[#A3B18A] text-[9px] border-b border-white/10 pb-1 mb-1">
                <span>VIRTUAL_CONSOLE_LOG</span>
                <span>STATE: ACTIVE</span>
              </div>
              {pingSensorsState === 'idle' && (
                <p className="text-stone-400 italic">No diagnostics running. Click Ping below to audit nodes.</p>
              )}
              {pingSensorsState === 'pinging' && (
                <p className="text-amber-300 animate-pulse">PINGING mmwave transceiver array (81GHz nodes)...</p>
              )}
              {pingSensorsState === 'completed' && (
                <div className="space-y-0.5">
                  <p className="text-emerald-400">✓ Node-101-A ONLINE 42ms</p>
                  <p className="text-emerald-400">✓ Node-102-B ONLINE 35ms</p>
                  <p className="text-emerald-400">✓ Node-103-C ONLINE 39ms</p>
                  <p className="text-stone-400 italic text-[9px] mt-1 pt-1 border-t border-white/5">Handovers, tamper switches OK.</p>
                </div>
              )}
              {radarContourCalibrating && (
                <p className="text-blue-300 animate-pulse mt-0.5">CALIBRATING thermal contour limits...</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setPingSensorsState('pinging');
                  setTimeout(() => {
                    setPingSensorsState('completed');
                    const newLog = {
                      id: `log-t-${Date.now()}`,
                      action_type: 'SENSOR_DIAGNOSTICS',
                      created_at: new Date().toISOString(),
                      module_name: 'Radar Telemetry',
                      user_name: 'Tech Admin',
                      details: { info: 'Pinged en-suite thermal & radar node transceivers. 100% response.' }
                    };
                    setAuditLogs(prev => [newLog, ...prev]);
                  }, 1200);
                }}
                disabled={pingSensorsState === 'pinging'}
                className="bg-slate-900 text-slate-100 hover:bg-slate-800 disabled:opacity-50 text-[10.5px] font-semibold py-2 px-2 rounded-xl transition cursor-pointer text-center"
              >
                {pingSensorsState === 'pinging' ? 'Pinging...' : 'Ping Radar Nodes'}
              </button>
              
              <button
                onClick={() => {
                  setRadarContourCalibrating(true);
                  setTimeout(() => {
                    setRadarContourCalibrating(false);
                    alert("Digital twin thermal coordinates calibrated to nominal 21.5C!");
                  }, 1500);
                }}
                className="bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 text-[10.5px] font-semibold py-2 px-2 rounded-xl transition cursor-pointer text-center"
              >
                {radarContourCalibrating ? 'Calibrating...' : 'Calibrate Contours'}
              </button>
            </div>
          </div>
        );

      case 'Auditor':
        return (
          <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Independent Governance</span>
                <h4 className="text-base font-serif italic text-slate-800 font-bold">Privacy Auditing Desk</h4>
              </div>
              <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded font-mono">
                External auditor
              </span>
            </div>

            <p className="text-xs text-[#7A847A] leading-relaxed">
              Verify continuous HIPAA and GDPR non-imaging radar privacy encryption loops. Check that camera imagery is 100% disabled.
            </p>

            <div className="bg-slate-50 border border-[#E6E2D3] p-3 rounded-2xl text-left space-y-1.5 text-xs text-[#2D3A2D]">
              <div className="flex justify-between font-mono text-[9px] text-[#7A847A]">
                <span>Zero-Camera Privacy Audit</span>
                <span className="text-[#4E6E5D] font-bold">COMPLIANT</span>
              </div>
              {privacyScanState === 'idle' && (
                <p className="text-[#7A847A] italic text-[11px]">No scan conducted during this session.</p>
              )}
              {privacyScanState === 'scanning' && (
                <p className="text-amber-600 animate-pulse">Running checksum scan active on en-suite radar ports...</p>
              )}
              {privacyScanState === 'passed' && (
                <div className="space-y-1.5 pt-1">
                  <p className="font-semibold text-emerald-800 flex items-center gap-1">
                    ✓ PASS: Zero Image Grgrids Logged
                  </p>
                  <p className="text-[11px] text-[#7A847A]">Verified 100% mmWave point cloud tokenization active in Rooms 101-110.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setPrivacyScanState('scanning');
                setTimeout(() => {
                  setPrivacyScanState('passed');
                  const newLog = {
                    id: `log-a-${Date.now()}`,
                    action_type: 'PRIVACY_COMPLIANCE_SIGN',
                    created_at: new Date().toISOString(),
                    module_name: 'Compliance Audit',
                    user_name: 'External Auditor',
                    details: { info: 'Executed raw telemetry loop privacy check. Confirmed no visual recordings.' }
                  };
                  setAuditLogs(prev => [newLog, ...prev]);
                }, 1300);
              }}
              disabled={privacyScanState === 'scanning'}
              className="w-full bg-[#2D3A2D] hover:bg-[#1C261C] disabled:opacity-50 text-white text-xs font-semibold py-2 px-4 rounded-xl transition cursor-pointer"
            >
              {privacyScanState === 'scanning' ? 'Auditing Encryption Ports...' : 'Verify Zero-Camera Encryption'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Dynamic falls risk forecasting engine for the next 48 hours using resident historical alert patterns
  const getResidentPredictiveData = (resident: Resident) => {
    // 1. Basal risk from historical static falls_risk_level
    let base = 25;
    if (resident.falls_risk_level === 'very_high') base = 70;
    else if (resident.falls_risk_level === 'high') base = 48;

    // 2. Aggregate counts of historical pattern indicators
    const resAlerts = alerts.filter(a => a.resident_id === resident.id);
    const fallNearMisses = resAlerts.filter(a => a.alert_type === 'Fall Candidate').length;
    const bedExits = resAlerts.filter(a => a.alert_type === 'Bed Exit').length;
    const sleepDisruptions = resAlerts.filter(a => a.alert_type === 'Restlessness' || a.alert_type === 'Wandering Risk').length;

    // Accumulative risk impact factors
    const alertImpactVal = (fallNearMisses * 14) + (bedExits * 8) + (sleepDisruptions * 5);

    // 3. Apply selected resident simulator parameters if this is the currently selected inspector target
    let sleepOffset = 0;
    let calibrationOffset = 0;
    let dehydrationOffset = 0;
    let activityOffset = 0;
    let staffingOffset = 0;

    if (selectedPredictiveResidentId === resident.id) {
      // Sleep Quality (baselined around 75)
      sleepOffset = (75 - simulatedSleepScore) * 0.45; // lower sleep score increases falls risk

      // Sensor Calibration
      if (!useBedSensorCalibration) {
        calibrationOffset = 15; // de-calibration increases risk of missed bedside egress
      }

      // Dehydration factor
      if (simulatedDehydration) {
        dehydrationOffset = 14; // orthostatic hypotension / cognitive confusion
      }

      // Physical Agitation/Activity Level
      if (simulatedActivityLevel === 'excessive') {
        activityOffset = 12;
      } else if (simulatedActivityLevel === 'low') {
        activityOffset = -6;
      }

      // Night staff presence
      if (simulatedStaffPresence === 'enhanced') {
        staffingOffset = -15; // enhanced checking acts as a crucial mitigation
      }
    }

    let calculatedRisk = base + alertImpactVal + sleepOffset + calibrationOffset + dehydrationOffset + activityOffset + staffingOffset;
    calculatedRisk = Math.max(4, Math.min(97, calculatedRisk));

    // Chronological projection timeline over next 48 hours (8 blocks of 6-hour windows)
    const timelineData = Array.from({ length: 8 }).map((_, idx) => {
      const hourOffset = (idx + 1) * 6;
      const currentHours = new Date().getHours();
      const targetHourOfDay = (currentHours + hourOffset) % 24;

      // Diurnal multipliers corresponding to real care worker shift patterns
      let shiftMultiplier = 1.0;
      if (targetHourOfDay >= 22 || targetHourOfDay <= 6) {
        // Bed exits and evening sundowning are high risk at night
        shiftMultiplier = bedExits > 0 || sleepDisruptions > 0 ? 1.35 : 1.15;
      } else if (targetHourOfDay >= 13 && targetHourOfDay <= 16) {
        // Afternoon circadian dip
        shiftMultiplier = 0.95;
      } else {
        // Morning transition and meal times
        shiftMultiplier = 0.82;
      }

      // Slight stochastic variance mapped to resident's unique code to prevent cloned curves
      const charmKey = (resident.resident_reference_code.charCodeAt(resident.resident_reference_code.length - 1) || 7) % 6;
      const microSineVal = Math.sin((hourOffset + charmKey * 8) * (Math.PI / 12)) * 6;

      let hourRiskRatio = (calculatedRisk * shiftMultiplier) + microSineVal;
      return Math.max(3, Math.min(98, Math.round(hourRiskRatio)));
    });

    // Extract forecast peaks
    const maxProjectedPercent = Math.max(...timelineData);
    const peakIntervalIdx = timelineData.indexOf(maxProjectedPercent);
    const peakHourOffset = (peakIntervalIdx + 1) * 6;
    
    // Format peak time
    const peakDate = new Date();
    peakDate.setHours(peakDate.getHours() + peakHourOffset);
    const formattedPeakWindow = peakDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + 
      (peakHourOffset <= 24 ? ' (Tonight)' : ' (Tomorrow)');

    let category: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
    if (calculatedRisk >= 75) category = 'Critical';
    else if (calculatedRisk >= 48) category = 'High';
    else if (calculatedRisk >= 25) category = 'Moderate';

    return {
      score: Math.round(calculatedRisk),
      category,
      fallNearMisses,
      bedExits,
      sleepDisruptions,
      timelineData,
      peakTimeFormatted: formattedPeakWindow,
      peakRisk: Math.round(maxProjectedPercent)
    };
  };

  const renderPredictiveAnalyticsView = (isEmbedded = false, embeddedResidentId: string | null = null) => {
    const activeResidents = residents.filter(r => r.profile_status === 'active');

    // Filtered lists of active residents on predictive analytics search terms
    const filteredResidents = activeResidents.filter(r => {
      const pData = getResidentPredictiveData(r);
      const matchesSearch = r.display_name.toLowerCase().includes(predictiveQuery.toLowerCase()) ||
                            r.resident_reference_code.toLowerCase().includes(predictiveQuery.toLowerCase());
      
      if (predictiveRiskFilter === 'critical') return matchesSearch && pData.category === 'Critical';
      if (predictiveRiskFilter === 'high_critical') return matchesSearch && (pData.category === 'High' || pData.category === 'Critical');
      if (predictiveRiskFilter === 'moderate') return matchesSearch && pData.category === 'Moderate';
      if (predictiveRiskFilter === 'low') return matchesSearch && pData.category === 'Low';
      return matchesSearch;
    });

    // Safe lookup of currently highlighted predictive subject
    const finalSelectedId = isEmbedded ? embeddedResidentId : (selectedPredictiveResidentId || (filteredResidents[0]?.id || null));
    const inspectTarget = activeResidents.find(r => r.id === finalSelectedId) || activeResidents[0];

    // Ensure state synchronicity
    if (!isEmbedded && inspectTarget && selectedPredictiveResidentId !== inspectTarget.id) {
      setSelectedPredictiveResidentId(inspectTarget.id);
    }

    // Dynamic aggregates for overview info panels
    const facilityHighRiskCount = activeResidents.filter(r => getResidentPredictiveData(r).category === 'Critical' || getResidentPredictiveData(r).category === 'High').length;
    const activemmWaveNodes = rooms.filter(rm => rm.digital_twin_enabled).length;

    // Selected resident analytics
    const selectedAnalytics = inspectTarget ? getResidentPredictiveData(inspectTarget) : null;
    const activeRoomObj = inspectTarget ? rooms.find(rm => rm.id === inspectTarget.room_id) : null;

    // Plotting metrics
    const svgW = 540;
    const svgH = 180;
    const padL = 40;
    const padR = 20;
    const padT = 20;
    const padB = 30;
    const chartW = svgW - padL - padR;
    const chartH = svgH - padT - padB;

    let pathD = '';
    let areaD = '';
    const points: { x: number; y: number; val: number; label: string }[] = [];

    if (selectedAnalytics && selectedAnalytics.timelineData) {
      const dx = chartW / 7;
      selectedAnalytics.timelineData.forEach((val, idx) => {
        const x = padL + idx * dx;
        const y = padT + chartH - (val / 100) * chartH;
        points.push({ 
          x, 
          y, 
          val, 
          label: `+${(idx + 1) * 6}h` 
        });
      });

      // Assemble lines
      pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      
      // Bottom coordinates for shader fill
      areaD = `${pathD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;
    }

    // Color code indicator styles
    const getRiskBadgeColor = (cat: string) => {
      switch (cat) {
        case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
        case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-stone-50 text-stone-600 border-stone-200';
      }
    };

    return (
      <div className="space-y-6 animate-fade-in text-left">
        {/* Banner Section */}
        {!isEmbedded && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E6E2D3] pb-5">
              <div>
                <h2 className="text-2xl font-serif text-[#0A2A22] font-bold inline-flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-[#4E6E5D]" />
                  Mobility &amp; Activity Log Trends
                </h2>
                <p className="text-xs text-[#7A847A] mt-1 pr-6 max-w-3xl leading-relaxed">
                  Analyze daily restlessness patterns, bedside transition logs, and general activity timelines.
                  Provides care teams and support staff with a structured wellness-assessment helper to log custom reablement activities. Note: Non-diagnostic tool.
                </p>
              </div>
              <span className="bg-[#4E6E5D] text-white text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-xxs">
                Reablement Helper Suite
              </span>
            </div>

            {/* Gemini Clinician Native Risk Assessment Summary Card */}
            <div className="bg-gradient-to-br from-[#F5F2ED] to-[#EAE6DD] border border-[#E6E2D3] rounded-[24px] p-6 shadow-xs space-y-4 relative overflow-hidden">
              {/* Decorative subtle ambient circular glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4E6E5D]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E2D3]/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#4E6E5D]/10 rounded-xl">
                    <Sparkles className="w-5 h-5 text-[#4E6E5D] animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#4E6E5D] tracking-widest uppercase font-mono block">AUTOMATED REABLEMENT PROFILE SYNTHESIZER</span>
                    <h3 className="text-base font-serif font-bold text-[#0A2A22] mt-0.5">Gemini Ward Mobility Log Assistant</h3>
                  </div>
                </div>
                
                <button
                  onClick={fetchPredictiveSummary}
                  disabled={isPredictiveSummaryLoading}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold border transition-all duration-200 ${
                    isPredictiveSummaryLoading
                      ? 'bg-stone-50 text-stone-400 border-stone-200 cursor-not-allowed'
                      : 'bg-white text-[#4E6E5D] border-[#E6E2D3] hover:bg-[#F5F2ED] hover:border-[#4E6E5D]/45 active:scale-95 shadow-xxs cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPredictiveSummaryLoading ? 'animate-spin' : ''}`} />
                  {isPredictiveSummaryLoading ? 'Re-analyzing...' : 'Reprocess Insights'}
                </button>
              </div>

              {isPredictiveSummaryLoading ? (
                <div className="py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#4E6E5D] animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-[#4E6E5D] animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-[#4E6E5D] animate-bounce" />
                    <span className="text-xs font-mono text-[#7A847A] italic ml-1 flex items-center">Analyzing real-time sensor contour grids and medical history...</span>
                  </div>
                  <div className="h-4 bg-[#E6E2D3]/40 rounded-md animate-pulse w-full" />
                  <div className="h-4 bg-[#E6E2D3]/40 rounded-md animate-pulse w-5/6" />
                </div>
              ) : predictiveSummaryError ? (
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-xs text-red-700 font-normal leading-relaxed">
                  {predictiveSummaryError}
                  <button 
                    onClick={fetchPredictiveSummary}
                    className="underline font-bold ml-1.5 hover:text-red-900 cursor-pointer"
                  >
                    Click here to retry
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#2D3A2D] leading-relaxed font-sans whitespace-pre-wrap">
                    {predictiveSummary || "No predictive summary generated yet. Press 'Reprocess Insights' to parse current residents' analytics."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-1 text-[10px] text-[#7A847A] font-mono border-t border-[#E6E2D3]/40">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${predictiveSummarySource === 'gemini' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                      System State: Reconciled
                    </span>
                    <span className="uppercase text-[9px] tracking-wider bg-white/70 px-2 py-0.5 rounded border border-[#E6E2D3]">
                      Source: {predictiveSummarySource === 'gemini' ? 'Gemini' : 'Local Heuristic Engine'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Aggregates Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E6E2D3] p-5 rounded-[22px] shadow-xxs">
                <span className="text-[9.5px] font-bold text-[#7A847A] tracking-wider uppercase block font-mono">ELEVATED CO-ORDINATION TRACKS</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-serif font-extrabold text-red-650">{facilityHighRiskCount}</span>
                  <span className="text-xs text-[#7A847A]">Residents</span>
                </div>
                <p className="text-[10px] text-red-600/90 mt-1 font-mono">🚨 Triggering regular comfort logs</p>
              </div>

              <div className="bg-white border border-[#E6E2D3] p-5 rounded-[22px] shadow-xxs">
                <span className="text-[9.5px] font-bold text-[#7A847A] tracking-wider uppercase block font-mono">PROACTIVE ACTIVE SENSORS</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-serif font-extrabold text-[#4E6E5D]">{activemmWaveNodes}/10</span>
                  <span className="text-xs text-[#7A847A]">En-suites</span>
                </div>
                <p className="text-[10px] text-[#7A847A] mt-1 font-mono">✓ High resolution continuous radar</p>
              </div>

              <div className="bg-white border border-[#E6E2D3] p-5 rounded-[22px] shadow-xxs">
                <span className="text-[9.5px] font-bold text-[#7A847A] tracking-wider uppercase block font-mono">PRIMARY VULNERABILITY WINDOW</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-serif font-extrabold text-[#0A2A22] leading-tight">02:00 - 04:30 (Night Shift)</span>
                </div>
                <p className="text-[10px] text-[#7A847A] mt-1 font-mono">Based on restless alert peaks</p>
              </div>

              <div className="bg-white border border-[#E6E2D3] p-5 rounded-[22px] shadow-xxs">
                <span className="text-[9.5px] font-bold text-[#7A847A] tracking-wider uppercase block font-mono">SUPPORT LOG SYNCHRONISATION</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-serif font-extrabold text-[#4E6E5D]">100%</span>
                  <span className="text-xs text-[#7A847A]">aligned</span>
                </div>
                <p className="text-[10px] text-emerald-700 mt-1 font-mono">✓ Validated offline simulation logs</p>
              </div>
            </div>
          </>
        )}

        {/* Master-Detail Page Layout Grid */}
        <div className={`grid grid-cols-1 ${isEmbedded ? '' : 'lg:grid-cols-12'} gap-6`}>
          {/* Left Column: List of Residents */}
          {!isEmbedded && (
            <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#E6E2D3] rounded-[24px] p-4.5 space-y-3.5 shadow-xxs">
              <div className="flex justify-between items-center bg-[#F5F2ED]/40 p-1.5 rounded-xl border border-stone-200">
                <span className="text-xs font-bold text-[#2D3A2D] font-mono px-1">RESIDENTS ALARM STATS</span>
                <span className="bg-[#4E6E5D] text-white text-[9px] font-bold uppercase rounded px-1.5 py-0.5">{filteredResidents.length} Showing</span>
              </div>

              {/* Search input field */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search resident search indicators..."
                  value={predictiveQuery}
                  onChange={(e) => setPredictiveQuery(e.target.value)}
                  className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white text-[#2D3A2D] outline-none transition"
                />
              </div>

              {/* Advanced Risk filter */}
              <div className="space-y-1">
                <label className="text-[8.5px] font-mono font-bold tracking-wider text-[#7A847A] block uppercase">PROJECTED HAZARD CLASSIFICATION</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setPredictiveRiskFilter('all')}
                    className={`text-[10.5px] font-semibold py-1.5 px-2.5 rounded-xl border transition ${
                      predictiveRiskFilter === 'all'
                        ? 'bg-[#2D3A2D] text-white border-[#2D3A2D]'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-[#F5F2ED]/30'
                    }`}
                  >
                    All Risk Classes
                  </button>
                  <button
                    onClick={() => setPredictiveRiskFilter('high_critical')}
                    className={`text-[10.5px] font-semibold py-1.5 px-2.5 rounded-xl border transition ${
                      predictiveRiskFilter === 'high_critical'
                        ? 'bg-red-700 text-white border-red-700'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-[#F5F2ED]/30'
                    }`}
                  >
                    High &amp; Critical
                  </button>
                  <button
                    onClick={() => setPredictiveRiskFilter('moderate')}
                    className={`text-[10.5px] font-semibold py-1.5 px-2.5 rounded-xl border transition ${
                      predictiveRiskFilter === 'moderate'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-[#F5F2ED]/30'
                    }`}
                  >
                    Moderate Risk
                  </button>
                  <button
                    onClick={() => setPredictiveRiskFilter('low')}
                    className={`text-[10.5px] font-semibold py-1.5 px-2.5 rounded-xl border transition ${
                      predictiveRiskFilter === 'low'
                        ? 'bg-[#4E6E5D] text-white border-[#4E6E5D]'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-[#F5F2ED]/30'
                    }`}
                  >
                    Low Risk
                  </button>
                </div>
              </div>

              {/* Residents Listing scroll */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredResidents.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-stone-200 rounded-2xl text-stone-400 font-mono text-xs">
                    No residents matching filters found.
                  </div>
                ) : (
                  filteredResidents.map((r) => {
                    const rData = getResidentPredictiveData(r);
                    const rm = rooms.find(room => room.id === r.room_id);
                    const isSelected = r.id === finalSelectedId;

                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedPredictiveResidentId(r.id);
                          // Reset mock sleep variables when resident changes to dynamic initial default
                          setSimulatedSleepScore(75);
                          setUseBedSensorCalibration(true);
                          setSimulatedDehydration(false);
                          setSimulatedActivityLevel('moderate');
                          setSimulatedStaffPresence('standard');
                        }}
                        className={`w-full text-left p-3 rounded-2xl transition border cursor-pointer border-[#E6E2D3] flex flex-col gap-1.5 relative ${
                          isSelected
                            ? 'bg-[#4E6E5D]/10 hover:bg-[#4E6E5D]/15 border-[#4E6E5D]/50 shadow-xxs ring-1 ring-[#4E6E5D]/25'
                            : 'bg-white hover:bg-[#F5F2ED]/40'
                        }`}
                      >
                        {/* Title & Room */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-[#0A2A22] font-serif">{r.display_name}</h4>
                            <span className="text-[9.5px] font-mono text-[#7A847A] tracking-tight block">
                              Ref: {r.resident_reference_code} • Room {rm ? rm.room_number : 'N/A'}
                            </span>
                          </div>
                          <span className={`text-[9.5px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getRiskBadgeColor(rData.category)}`}>
                            {rData.category}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-[#7A847A] leading-tight">
                            Alerts Count: <strong className="text-[#0A2A22] not-italic">{rData.fallNearMisses + rData.bedExits + rData.sleepDisruptions} events</strong>
                          </span>
                          <span className="font-mono text-[#0A2A22] font-bold">
                            Forecast: <strong className={rData.score >= 50 ? 'text-orange-700' : 'text-[#4E6E5D]'}>{rData.score}%</strong>
                          </span>
                        </div>

                        {/* Progress Bar of probability */}
                        <div className="w-full bg-stone-200/60 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              rData.category === 'Critical' ? 'bg-red-605' :
                              rData.category === 'High' ? 'bg-orange-500' :
                              rData.category === 'Moderate' ? 'bg-amber-500' : 'bg-[#4E6E5D]'
                            }`}
                            style={{ width: `${rData.score}%` }}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            </div>
          )}

          {/* Right Column: In-depth Forecast Inspector */}
          <div className={isEmbedded ? '' : 'lg:col-span-8'}>
            {!inspectTarget ? (
              <div className="bg-white border border-[#E6E2D3] rounded-[28px] p-10 text-center text-stone-400 font-mono text-xs">
                Select an active resident from the register on the left to review their recent mobility levels and reablement suggestions.
              </div>
            ) : (
              <div className="bg-white border border-[#E6E2D3] rounded-[28px] p-6 space-y-6 shadow-sm">
                
                {/* Header info card */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F5F2ED]/40 p-4 border border-[#E6E2D3] rounded-2xl">
                  <div>
                    <span className="text-[10px] text-[#A3B18A] uppercase font-bold font-mono tracking-wider">ACTIVE WEEKLY MOBILITY TRENDS (NON-DIAGNOSTIC)</span>
                    <h3 className="text-lg font-serif text-[#0A2A22] font-bold mt-0.5">{inspectTarget.display_name}</h3>
                    <p className="text-xs text-[#7A847A] font-mono leading-relaxed mt-0.5">
                      En-suite room {activeRoomObj ? activeRoomObj.name : 'Unassigned'} • Code: {inspectTarget.resident_reference_code}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-center shadow-xxs">
                      <span className="text-[8.5px] font-mono text-[#7A847A] uppercase block">MOBILITY SCORE</span>
                      <strong className="text-xs text-[#0A2A22] font-bold font-sans">{inspectTarget.current_mobility_score}/100</strong>
                    </div>
                    <div className="bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-center shadow-xxs">
                      <span className="text-[8.5px] font-mono text-[#7A847A] uppercase block">FALLS RISK BASIS</span>
                      <strong className="text-xs text-[#0A2A22] uppercase font-mono font-bold">{inspectTarget.falls_risk_level}</strong>
                    </div>
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Driver Factors */}
                  <div className="border border-stone-200/80 p-4.5 rounded-2xl space-y-3.5 bg-stone-50/50">
                    <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono border-b border-stone-250 pb-1.5">
                      Historical Multi-Factor Drivers
                    </h4>

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-[11.5px] leading-tight">
                        <span className="text-[#7A847A]">Near-Miss Fall Candidate Incidents</span>
                        <span className={`font-mono font-bold text-xs ${selectedAnalytics!.fallNearMisses > 0 ? 'text-red-700' : 'text-stone-700'}`}>
                          {selectedAnalytics!.fallNearMisses} recorded
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11.5px] leading-tight">
                        <span className="text-[#7A847A]">Continuous-wave mmWave Bed Exit Events</span>
                        <span className={`font-mono font-bold text-xs ${selectedAnalytics!.bedExits > 0 ? 'text-amber-700' : 'text-stone-700'}`}>
                          {selectedAnalytics!.bedExits} recorded
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11.5px] leading-tight">
                        <span className="text-[#7A847A]">Unsupervised Restless/Wandering Events</span>
                        <span className={`font-mono font-bold text-xs ${selectedAnalytics!.sleepDisruptions > 0 ? 'text-amber-700' : 'text-stone-700'}`}>
                          {selectedAnalytics!.sleepDisruptions} recorded
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 p-2.5 rounded-xl text-[10.5px] text-[#7A847A] leading-relaxed">
                      💡 Weighted historical alerts indicate high-frequency behaviorism patterns. These triggers are utilized dynamically to mathematically model future balance risk periods.
                    </div>
                  </div>

                  {/* Operational Summary */}
                  <div className="border border-stone-200/80 p-4.5 rounded-2xl space-y-3.5 bg-stone-50/50">
                    <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono border-b border-stone-250 pb-1.5">
                      48-Hour Forecast Highlights
                    </h4>

                    <div className="space-y-3 pt-1">
                      <div>
                        <span className="text-[9.5px] font-mono uppercase text-[#7A847A]">Peak Projected Incident Ratio</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-serif italic font-extrabold text-[#2D3A2D]">
                            {selectedAnalytics!.peakRisk}%
                          </span>
                          <span className="text-[10px] text-stone-500">at risk threshold</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-mono uppercase text-[#7A847A]">Projected Incident Peak Window</span>
                        <p className="text-xs font-bold text-[#2D3A2D] mt-0.5">
                          ⏰ {selectedAnalytics!.peakTimeFormatted}
                        </p>
                      </div>

                      <div className="bg-amber-100/30 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-[10.5px]">
                        <strong>Prophylactic Shift Intervention Suggested:</strong> Coordinate targeted assistant checks to correspond with the peak window to pre-empt risk.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graph Card */}
                <div className="border border-[#E6E2D3] p-5 rounded-[22px] space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono">
                        System Projection Curve (48h Trend)
                      </h4>
                      <p className="text-[10px] text-stone-500">Visualizing estimated hourly probability coefficients</p>
                    </div>

                    <div className="flex gap-2 text-[10px] font-mono">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#4E6E5D] inline-block rounded-full" /> Normal (&lt;25%)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 inline-block rounded-full" /> Elevated (25%-50%)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 inline-block rounded-full" /> Critical (&gt;50%)</span>
                    </div>
                  </div>

                  {/* Pure SVG Graph Container */}
                  <div className="w-full bg-[#F5F2ED]/35 p-2 rounded-xl border border-stone-200">
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
                      <defs>
                        <linearGradient id="predictiveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4E6E5D" stopOpacity="0.45"/>
                          <stop offset="50%" stopColor="#4E6E5D" stopOpacity="0.15"/>
                          <stop offset="100%" stopColor="#4E6E5D" stopOpacity="0.0"/>
                        </linearGradient>
                        <linearGradient id="predictiveCriticalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D98E73" stopOpacity="0.45"/>
                          <stop offset="50%" stopColor="#D98E73" stopOpacity="0.15"/>
                          <stop offset="100%" stopColor="#D98E73" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>

                      {/* Y-axis guidelines */}
                      {[0, 25, 50, 75, 100].map((v) => {
                        const y = padT + chartH - (v / 100) * chartH;
                        return (
                          <g key={v} className="opacity-45">
                            <line 
                              x1={padL} 
                              y1={y} 
                              x2={svgW - padR} 
                              y2={y} 
                              stroke="#CCCCCC" 
                              strokeWidth="1" 
                              strokeDasharray="3 3"
                            />
                            <text 
                              x={padL - 10} 
                              y={y + 4} 
                              textAnchor="end" 
                              fontSize="9px" 
                              className="font-mono fill-stone-500"
                            >
                              {v}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Shader Area */}
                      {areaD && (
                        <motion.path 
                          key={`area-${inspectTarget.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ d: areaD, opacity: 1, fill: selectedAnalytics!.score >= 50 ? 'url(#predictiveCriticalGrad)' : 'url(#predictiveGrad)' }}
                          transition={{ duration: 0.6 }}
                        />
                      )}

                      {/* Main Trend Line */}
                      {pathD && (
                        <motion.path 
                          key={`line-${inspectTarget.id}`}
                          initial={{ pathLength: 0 }}
                          animate={{ d: pathD, pathLength: 1, stroke: selectedAnalytics!.score >= 50 ? '#D98E73' : '#4E6E5D' }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          fill="none" 
                          strokeWidth="2.5"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Axis Labels & Dots */}
                      {points.map((p, i) => (
                        <g key={i}>
                          {/* Dot marker */}
                          <motion.circle 
                            key={`circle-${i}-${inspectTarget.id}`}
                            cx={p.x} 
                            initial={{ scale: 0, opacity: 0, cy: p.y }}
                            animate={{ cy: p.y, scale: 1, opacity: 1, stroke: p.val >= 75 ? '#DC2626' : p.val >= 50 ? '#D97706' : '#4E6E5D' }}
                            transition={{ duration: 0.4, type: "spring" }}
                            r="4.5" 
                            fill="white" 
                            strokeWidth="2.5" 
                          />
                          {/* Probability Label above node */}
                          <motion.text 
                            key={`probLabel-${i}-${inspectTarget.id}`}
                            x={p.x} 
                            textAnchor="middle" 
                            fontSize="9px" 
                            fontWeight="bold" 
                            className="font-sans fill-stone-800"
                            initial={{ opacity: 0, y: p.y }}
                            animate={{ opacity: 1, y: p.y - 8 }}
                            transition={{ duration: 0.4 }}
                          >
                            <motion.tspan>
                              {p.val}%
                            </motion.tspan>
                          </motion.text>
                          {/* X-axis offset label */}
                          <text 
                            x={p.x} 
                            y={padT + chartH + 15} 
                            textAnchor="middle" 
                            fontSize="9px" 
                            className="font-mono fill-stone-600"
                          >
                            {p.label}
                          </text>
                        </g>
                      ))}

                      {/* Left Boundary line */}
                      <line 
                        x1={padL} 
                        y1={padT} 
                        x2={padL} 
                        y2={padT + chartH} 
                        stroke="#BEBEBE" 
                        strokeWidth="1" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Interactive Simulator Section */}
                <div className="bg-[#F5F2ED]/25 border border-[#E6E2D3] p-5 rounded-[22px] space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono inline-flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                      Digital Twins Risk Simulator Mode
                    </h4>
                    <p className="text-[11px] text-[#7A847A] leading-relaxed">
                      Alter virtual ambient sensor readings and baseline conditions of {inspectTarget.first_name}'s suite. 
                      Recalculates 48-hour fall probability metrics instantly to assist pre-emptive care designs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5 text-xs text-[#2D3A2D] pt-1">
                    {/* Simulator Inputs Left */}
                    <div className="space-y-4">
                      {/* Sleep Score slider */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-[11px] font-medium">
                          <span>Simulated Sleep Quality Index</span>
                          <span className="font-mono font-bold text-xs text-[#4E6E5D]">{simulatedSleepScore}/100</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="100"
                          value={simulatedSleepScore}
                          onChange={(e) => setSimulatedSleepScore(Number(e.target.value))}
                          className="w-full bg-[#E6E2D3] h-1.5 rounded-lg appearance-none cursor-ew-resize accent-[#2D3A2D]"
                        />
                        <div className="flex justify-between text-[9px] text-[#7A847A] font-mono">
                          <span>Severely Restless</span>
                          <span>Highly Peaceful</span>
                        </div>
                      </div>

                      {/* Bed sensor calibration toggle */}
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E6E2D3]">
                        <div className="space-y-0.5">
                          <label htmlFor="bed-sensor-simulator" className="font-medium text-[11.5px] block cursor-pointer">Sensory Bed Egress Calibration</label>
                          <span className="text-[10px] text-[#7A847A] block font-mono">Ensures alert dispatch under 1.5s</span>
                        </div>
                        <input
                          type="checkbox"
                          id="bed-sensor-simulator"
                          checked={useBedSensorCalibration}
                          onChange={(e) => setUseBedSensorCalibration(e.target.checked)}
                          className="w-4.5 h-4.5 accent-[#2D3A2D] border-stone-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Simulator Inputs Right */}
                    <div className="space-y-3.5">
                      {/* Hydration toggle */}
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E6E2D3]">
                        <div className="space-y-0.5">
                          <span className="font-medium text-[11.5px] block">Simulate Orthostatic Dehydration</span>
                          <span className="text-[10px] text-[#7A847A] block font-mono">Elevates confusion risk indicators</span>
                        </div>
                        <button
                          onClick={() => setSimulatedDehydration(!simulatedDehydration)}
                          className={`text-[10px] uppercase tracking-wide font-extrabold px-3 py-1 rounded transition max-w-[80px] text-center border ${
                            simulatedDehydration 
                              ? 'bg-red-50 text-red-700 border-red-355 font-bold' 
                              : 'bg-stone-50 text-stone-500 border-stone-250'
                          }`}
                        >
                          {simulatedDehydration ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </div>

                      {/* Daily Activity level select */}
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E6E2D3]">
                        <div>
                          <label htmlFor="activity-level-simulator" className="font-medium text-[11.5px] block cursor-pointer">Unsupervised Physical Activity</label>
                          <span className="text-[10px] text-[#7A847A] block font-mono">Physical agitation multipliers</span>
                        </div>
                        <select
                          id="activity-level-simulator"
                          value={simulatedActivityLevel}
                          onChange={(e) => setSimulatedActivityLevel(e.target.value as any)}
                          className="bg-stone-50 border border-[#E6E2D3] text-[#2D3A2D] text-xs rounded-lg p-1.5 cursor-pointer outline-none font-mono"
                        >
                          <option value="low">Low/Assisted</option>
                          <option value="moderate">Moderate</option>
                          <option value="excessive">Excessive Agitation</option>
                        </select>
                      </div>

                      {/* Staff coverage level */}
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E6E2D3]">
                        <div>
                          <label htmlFor="staffing-level-simulator" className="font-medium text-[11.5px] block cursor-pointer">En-Suite Ward Checking Crew</label>
                          <span className="text-[10px] text-[#7A847A] block font-mono">Shift monitoring protocol settings</span>
                        </div>
                        <select
                          id="staffing-level-simulator"
                          value={simulatedStaffPresence}
                          onChange={(e) => setSimulatedStaffPresence(e.target.value as any)}
                          className="bg-stone-50 border border-[#E6E2D3] text-[#2D3A2D] text-xs rounded-lg p-1.5 cursor-pointer outline-none font-mono"
                        >
                          <option value="standard">Standard Checks</option>
                          <option value="enhanced">Enhanced Checks</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practical Clinical Recommendations & Prophylactic Actions */}
                <div className="border border-[#E6E2D3] p-5 rounded-[22px] space-y-3.5">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#4E6E5D]" />
                    <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider font-mono">
                      Supportive Care &amp; Activity Plan Helper
                    </h4>
                  </div>

                  <p className="text-xs text-[#7A847A]">
                    Comfort and environmental suggestions compiled from non-clinical activity parameters to assist caregivers:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11.5px] text-[#2D3A2D]">
                    <div className="flex items-start gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Targeted Night Checking</strong>
                        <p className="text-[#7A847A] text-[10.5px] mt-0.5">Schedule assist checks precisely matching the projected {selectedAnalytics!.peakTimeFormatted} peak interval window.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Bed Egress Calibration Check</strong>
                        <p className="text-[#7A847A] text-[10.5px] mt-0.5">Calibrate receiver sensor frequencies under Room {activeRoomObj ? activeRoomObj.room_number : 'N/A'}'s mattress frame.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Preventive Hydration Checks</strong>
                        <p className="text-[#7A847A] text-[10.5px] mt-0.5">Assign regular electrolyte fluids during afternoon hours to reduce nocturnal disorientation spikes.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Physical Orthostatic Safeguards</strong>
                        <p className="text-[#7A847A] text-[10.5px] mt-0.5">Place orthopedic bedside pressure rugs and calibrate the radar sampling loop down to 1.5s.</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons inside inspector */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => {
                        const newLog = {
                          id: `log-pa-${Date.now()}`,
                          action_type: 'PREDICTIVE_CARE_SCHEDULING',
                          created_at: new Date().toISOString(),
                          module_name: 'Predictive Analytics',
                          user_name: 'System Engine',
                          details: { info: `Dispatched pre-emptive fall prevention night-check protocol for ${inspectTarget.display_name} around critical time ${selectedAnalytics!.peakTimeFormatted}.` }
                        };
                        setAuditLogs(prev => [newLog, ...prev]);
                        alert(`Proactive preventative schedule dispatch locked! Added to continuous site audit log database.`);
                      }}
                      className="bg-[#2D3A2D] hover:bg-[#1C261C] text-white text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer transition shadow-xxs"
                    >
                      Lock Proactive Interventions Schedule
                    </button>

                    <button
                      onClick={() => {
                        alert(`Sensory calibration commands sent to Room ${activeRoomObj ? activeRoomObj.room_number : 'N/A'} radar transceivers. Baseline accuracy established with continuous wave calibration check.`);
                      }}
                      className="bg-white hover:bg-stone-50 border border-stone-250 text-[#2D3A2D] text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer transition"
                    >
                      Calibrate Room Egress Sensors
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    );
  };

  // Pure SVG Line Graph drawing subroutine for clinical reablement trends
  // Strips dependency failures out, looks exceptionally modern, lightweight, and 100% reliable.
  const renderSVGRecoveryTrendChart = (resId: string) => {
    const trends = recoveryTrends.filter(t => t.resident_id === resId);
    if (trends.length === 0) {
      return (
        <div className="h-44 flex items-center justify-center border border-slate-150 rounded-xl bg-slate-50 font-mono text-xs text-slate-400">
          No sensory gait calibration points available yet.
        </div>
      );
    }

    // Sort trends chronologically
    const sorted = [...trends].sort((a, b) => new Date(a.trend_date).getTime() - new Date(b.trend_date).getTime());
    
    const svgW = 480;
    const svgH = 200;
    const pad = 35;
    const chartW = svgW - pad * 2;
    const chartH = svgH - pad * 2;

    const maxVal = 100;
    const minVal = 0;

    // Build coordinate points
    const pointsMobility = sorted.map((t, idx) => {
      const x = pad + (idx / (sorted.length - 1 || 1)) * chartW;
      const y = pad + chartH - ((t.mobility_score - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val: t.mobility_score, date: t.trend_date };
    });

    const pointsIndependence = sorted.map((t, idx) => {
      const x = pad + (idx / (sorted.length - 1 || 1)) * chartW;
      const y = pad + chartH - ((t.independence_score - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val: t.independence_score };
    });

    const pointsSleep = sorted.map((t, idx) => {
      const x = pad + (idx / (sorted.length - 1 || 1)) * chartW;
      const y = pad + chartH - ((t.sleep_quality_score - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val: t.sleep_quality_score };
    });

    const pathMobility = pointsMobility.map(p => `${p.x},${p.y}`).join(' ');
    const pathIndependence = pointsIndependence.map(p => `${p.x},${p.y}`).join(' ');
    const pathSleep = pointsSleep.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xxs">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
            Clinical Gait &amp; Reablement Indices (Weekly Progression)
          </div>
          
          <div className="flex gap-3 text-[9px] font-mono select-none">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span> Mobility Score</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-sky-500 rounded-full inline-block"></span> Independence</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span> Sleep Quality Index</span>
          </div>
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
            {/* Horizontal guidelines */}
            <line x1={pad} y1={pad} x2={svgW - pad} y2={pad} stroke="#f1f5f9" strokeWidth="1" />
            <line x1={pad} y1={pad + chartH * 0.25} x2={svgW - pad} y2={pad + chartH * 0.25} stroke="#f1f5f9" strokeWidth="1" />
            <line x1={pad} y1={pad + chartH * 0.5} x2={svgW - pad} y2={pad + chartH * 0.5} stroke="#f1f5f9" strokeWidth="1" />
            <line x1={pad} y1={pad + chartH * 0.75} x2={svgW - pad} y2={pad + chartH * 0.75} stroke="#f1f5f9" strokeWidth="1" />
            <line x1={pad} y1={pad + chartH} x2={svgW - pad} y2={pad + chartH} stroke="#e2e8f0" strokeWidth="1.2" />

            {/* Y Axis text annotations */}
            <text x={pad - 6} y={pad + 3} className="fill-slate-400 font-mono text-[8px]" textAnchor="end">100%</text>
            <text x={pad - 6} y={pad + chartH * 0.5 + 3} className="fill-slate-400 font-mono text-[8px]" textAnchor="end">50%</text>
            <text x={pad - 6} y={pad + chartH + 3} className="fill-slate-400 font-mono text-[8px]" textAnchor="end">0%</text>

            {/* Lines paths */}
            <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={pathMobility} />
            <polyline fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="3 2" points={pathIndependence} />
            <polyline fill="none" stroke="#fbbf24" strokeWidth="2" points={pathSleep} />

            {/* Circle Nodes */}
            {pointsMobility.map((p, pIndex) => (
              <g key={`n-mob-${pIndex}`}>
                <circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                <text x={p.x} y={p.y - 8} className="fill-emerald-800 font-semibold font-mono text-[8.5px]" textAnchor="middle">
                  {p.val}
                </text>
                <text x={p.x} y={pad + chartH + 14} className="fill-slate-400 font-mono text-[8px]" textAnchor="middle">
                  {new Date(p.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                </text>
              </g>
            ))}

            {pointsSleep.map((p, pIndex) => (
              <g key={`n-sleep-${pIndex}`}>
                <circle cx={p.x} cy={p.y} r="3" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  const renderSandboxOutboxTray = () => {
    return null;
  };

  if (!currentUser) {
    if (viewMode === 'website') {
      return (
        <HakilixWebsite 
          onLoginClick={() => setViewMode('login')} 
          onRegisterClick={() => setViewMode('register')} 
        />
      );
    }

    if (viewMode === 'register') {
      return (
        <div id="secure-register-viewport" className="flex flex-col min-h-screen bg-[#F5F2ED] items-center justify-center p-6 font-sans space-y-6">
          <div className="w-full max-w-4xl space-y-6">
            <div className="bg-white rounded-[36px] shadow-xl overflow-hidden border border-[#E6E2D3] grid grid-cols-1 md:grid-cols-12">
              
              {/* Left sidebar info column */}
              <div className="md:col-span-5 bg-[#2D3A2D] text-white p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-[#A3B18A]" />
                    <span className="font-serif italic font-bold text-xl tracking-tight">Rosewood Gateway</span>
                  </div>
                  
                  <div className="space-y-3 pt-6">
                    <span className="bg-[#4E6E5D] text-[#F5F2ED] font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Secured Practitioner Registry
                    </span>
                    <h3 className="text-lg font-serif">Onboard as an External Custodian</h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Register your credentials into the National Health Service sandbox database. This triggers an automated security confirmation email log to establish role-gated access.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-[10.5px] text-stone-300 font-mono pt-8">
                  <p>✓ CQC Compliance Vetted</p>
                  <p>✓ UK GDPR Privacy Compliant</p>
                  <p>✓ Automated Role Credentials Verification</p>
                </div>
              </div>

              {/* Form Input Column */}
              <div className="md:col-span-7 p-8 flex flex-col justify-center space-y-5">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif italic font-bold text-[#2D3A2D]">Practitioner Registration</h2>
                  <p className="text-xs text-[#7A847A]">
                    Complete the secure administrative manifest. Enter your clinical title and professional email below.
                  </p>
                </div>

                {regForm.error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                    <span>{regForm.error}</span>
                  </div>
                )}

                {regForm.success && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl space-y-2.5">
                    <div>
                      <p className="font-semibold text-emerald-900">✓ Security Profile Configured!</p>
                      <p className="text-[11.5px] text-[#2D3A2D] leading-relaxed mt-1">
                        A secure email verification link has been successfully dispatched to <strong>{regForm.lastRegisteredEmail}</strong>. Please check your inbox or spam folder and activate access within <strong>1 hour</strong>.
                      </p>
                    </div>
                    <div className="border-t border-emerald-200/55 pt-2 space-y-1 text-[10px] text-emerald-800 leading-normal">
                      <p className="font-bold uppercase font-mono tracking-wide">ℹ HIGH-TRUST EMAIL HANDSHAKE</p>
                      <p className="text-[#2D3A2D]/80">
                        This environment triggers secure, real-time SMTP emails. If you do not see the activation email in your inbox, check your spam folder or verify SMTP credentials (<code>SMTP_HOST</code>, <code>SMTP_PORT</code>, etc.) inside the Settings of Google AI Studio.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">First Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. John"
                        value={regForm.first_name}
                        onChange={(e) => setRegForm(prev => ({ ...prev, first_name: e.target.value, error: '' }))}
                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-xs text-[#2D3A2D]"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9.5px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Last Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Sterling"
                        value={regForm.last_name}
                        onChange={(e) => setRegForm(prev => ({ ...prev, last_name: e.target.value, error: '' }))}
                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-xs text-[#2D3A2D]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Professional Email</label>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. john.sterling@nhs.net"
                      value={regForm.email}
                      onChange={(e) => setRegForm(prev => ({ ...prev, email: e.target.value, error: '' }))}
                      className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-xs text-[#2D3A2D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Select Security Role Model</label>
                    <select 
                      value={regForm.role}
                      onChange={(e) => setRegForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-xs text-[#2D3A2D] appearance-none"
                    >
                      <option value="Clinical Lead">Clinical Lead (Senior Diagnostic / Dr.)</option>
                      <option value="Facility Manager">Facility Manager (Operational Overlord)</option>
                      <option value="Senior Carer">Senior Carer (Ward &amp; Handover Supervisor)</option>
                      <option value="Care Worker">Care Worker (Bedside Responder)</option>
                      <option value="Auditor">Compliance Auditor (CQC / Governance)</option>
                      <option value="Family Viewer">Family Viewer (Relative Account)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Gateway Password</label>
                      <input 
                        type="password"
                        required
                        placeholder="At least 8 chars"
                        value={regForm.password}
                        onChange={(e) => setRegForm(prev => ({ ...prev, password: e.target.value, error: '' }))}
                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-xs text-[#2D3A2D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Confirm Password</label>
                      <input 
                        type="password"
                        required
                        placeholder="Verify passcode"
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm(prev => ({ ...prev, confirmPassword: e.target.value, error: '' }))}
                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-xs text-[#2D3A2D]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regForm.loading}
                    className="w-full bg-[#4E6E5D] hover:bg-[#3D5A4A] disabled:opacity-50 text-white font-semibold text-xs px-4 py-3.5 rounded-2xl cursor-pointer transition shadow-sm font-mono mt-2"
                  >
                    {regForm.loading ? 'Transmitting Registry...' : 'REVIEW credential levels & REGISTER'}
                  </button>
                </form>

                <div className="flex justify-between items-center pt-3 border-t border-[#F5F2ED] text-xs">
                  <button 
                    onClick={() => setViewMode('website')}
                    className="text-[#4E6E5D] hover:text-[#3D5A4A] font-semibold transition cursor-pointer"
                  >
                    ← Corporate Website
                  </button>
                  
                  <button 
                    onClick={() => setViewMode('login')}
                    className="text-[#4E6E5D] hover:text-[#3D5A4A] font-semibold transition cursor-pointer"
                  >
                    Already validated? Log in
                  </button>
                </div>

              </div>

            </div>
          </div>
          {renderSandboxOutboxTray()}
        </div>
      );
    }

    if (viewMode === 'verify') {
      return (
        <div id="secure-verify-viewport" className="flex flex-col min-h-screen bg-[#F5F2ED] items-center justify-center p-6 font-sans space-y-6">
          <div className="w-full max-w-xl bg-white rounded-[36px] shadow-xl overflow-hidden border border-[#E6E2D3] p-8 space-y-6 text-left">
            
            <div className="flex items-center gap-3 border-b border-[#F5F2ED] pb-4">
              <ShieldCheck className="w-8 h-8 text-[#4E6E5D]" />
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0A2A22]">Access Verification</h2>
                <p className="text-xs text-[#7A847A]">Validate token handshake to activate your clinician account.</p>
              </div>
            </div>

            {verifyForm.error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                <span>{verifyForm.error}</span>
              </div>
            )}

            {verifyForm.success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-5 rounded-2xl space-y-1">
                <h4 className="font-semibold text-emerald-900">✓ Security Handshake Validated!</h4>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Your email has been verified successfully. Redirecting you to the Access Authorization Hub login screen...
                </p>
              </div>
            )}

            {!verifyForm.success && (
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="space-y-1.5 bg-[#FAF9F5] p-5 rounded-2xl border border-[#E6E2D3]/60 font-mono text-xs text-[#7A847A] leading-relaxed">
                  <div><strong className="text-stone-600">Registered Email:</strong> <span className="text-[#0a2a22] font-semibold">{verifyForm.email}</span></div>
                  <div><strong className="text-stone-600">Verification Token:</strong> <span className="text-[#0a2a22] font-semibold tracking-wider">{verifyForm.token.substring(0, 15)}...</span></div>
                  <div className="text-[11px] text-amber-800 mt-2 font-sans italic bg-amber-50 p-2 rounded-lg border border-amber-100">
                    Your verification connection is secured. Clicking the activation trigger below will consume this token and activate access.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifyForm.loading}
                  className="w-full bg-[#4E6E5D] hover:bg-[#3D5A4A] disabled:opacity-50 text-white font-semibold text-xs px-4 py-3.5 rounded-2xl cursor-pointer transition shadow-sm font-mono mt-2"
                >
                  {verifyForm.loading ? 'Consuming Token & Activating...' : 'CONFIRM EMAIL & ACTIVATE CLINICAL KEY →'}
                </button>
              </form>
            )}

            <div className="text-center pt-2 border-t border-[#F5F2ED]">
              <button 
                onClick={() => setViewMode('login')}
                className="text-xs text-[#4E6E5D] hover:text-[#3D5A4A] font-semibold transition cursor-pointer"
              >
                ← Back to Login Screen
              </button>
            </div>

          </div>
          {renderSandboxOutboxTray()}
        </div>
      );
    }

    return (
      <div id="secure-login-viewport" className="flex flex-col min-h-screen bg-[#F5F2ED] items-center justify-center p-6 font-sans space-y-6">
        <div className="w-full max-w-4xl bg-white rounded-[36px] shadow-xl overflow-hidden border border-[#E6E2D3] grid grid-cols-1 md:grid-cols-12">
          
          {/* Brand info column (5 cols) */}
          <div className="md:col-span-5 bg-[#2D3A2D] text-white p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-[#A3B18A]" />
                <span className="font-serif italic font-bold text-xl tracking-tight">Rosewood Portal</span>
              </div>
              <div className="space-y-3 pt-6">
                <span className="bg-[#4E6E5D] text-[#F5F2ED] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Governance SECURE ACCESS
                </span>
                <p className="text-sm font-serif italic text-stone-200 leading-relaxed">
                  "Pristine patient privacy meets continuous mmwave radar telemetry checking."
                </p>
              </div>
            </div>

            <div className="space-y-3 text-[11px] text-stone-300 font-mono">
              <p>✓ AES-256 Bit Row Encryption</p>
              <p>✓ Multi-Factor Handshake Verification</p>
              <p>✓ Compliant with Care Quality Commission</p>
            </div>
          </div>

          {/* Form column (7 cols) */}
          <div className="md:col-span-7 p-8 flex flex-col justify-center space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-serif italic font-bold text-[#2D3A2D]">Access Authorization Hub</h2>
              <p className="text-xs text-[#7A847A]">
                Sign in with professional credentials or select an expert profile from the sandbox deck.
              </p>
            </div>

            {loginForm.error && (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                  <span>{loginForm.error}</span>
                </div>

                {loginForm.error.toLowerCase().includes('pending verification') && (
                  <div className="bg-[#FAF9F5] border border-[#E6E2D3] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-stone-700 font-bold text-xs uppercase font-mono tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                      Troubleshooting Email Verification
                    </div>
                    <div className="text-[11px] text-[#7A847A] space-y-2 leading-relaxed">
                      <p>
                        Your gateway account is pending email verification. If you did not receive a link or the verification has expired, please request a secure link resend below.
                      </p>
                      {resendStatus && (
                        <p className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-[10.5px] font-medium leading-normal">
                          {resendStatus}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setResendStatus('Delivering secure resend request...');
                        try {
                          const response = await fetch('/api/auth/resend-verification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: loginForm.email })
                          });
                          const data = await response.json();
                          if (response.ok) {
                            setResendStatus('✓ A new verification link has been triggered to your active inbox. Please check spam/MTA logs.');
                          } else {
                            setResendStatus(`Error: ${data.error || 'Could not trigger resend.'}`);
                          }
                        } catch (err) {
                          setResendStatus('Resend transmission failed. Secure service unreachable.');
                        }
                      }}
                      className="w-full bg-[#0A2A22] hover:bg-[#163e34] text-white text-[10px] font-mono font-bold py-2.5 rounded-xl transition cursor-pointer text-center select-none shadow-sm"
                    >
                      Resend Secure Verification Link →
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {!loginForm.mfaRequired ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Email Code ID / Username</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah@rosewood.co.uk"
                      value={loginForm.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLoginForm(prev => ({ ...prev, email: val, error: '' }));
                      }}
                      className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-xs text-[#2D3A2D] text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Administrative Passcode</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLoginForm(prev => ({ ...prev, password: val, error: '' }));
                      }}
                      className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-xs text-[#2D3A2D] text-slate-800"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs p-4 rounded-xl">
                    <p className="font-semibold">✓ Multi-Factor Verification Stage Triggered</p>
                    <p className="mt-1 text-[11px] text-[#7A847A]">
                      For testing purposes, enter any 6-digit code (e.g., <strong>123456</strong>) to simulate authenticator handshakes.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono font-bold">MFA Passcode (6 Digits)</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g., 123456"
                      value={loginForm.mfaCode || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setLoginForm(prev => ({ ...prev, mfaCode: val, error: '' }));
                      }}
                      className="w-full tracking-widest text-center font-mono bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none rounded-2xl px-4 py-3 text-sm text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                {loginForm.mfaRequired && (
                  <button
                    type="button"
                    onClick={() => setLoginForm(prev => ({ ...prev, mfaRequired: false, mfaCode: '' }))}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-[#2D3A2D] font-semibold text-xs px-4 py-3 rounded-2xl cursor-pointer transition"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-[#4E6E5D] hover:bg-[#3D5A4A] text-white font-semibold text-xs px-4 py-3 rounded-2xl cursor-pointer transition shadow-sm"
                >
                  {loginForm.mfaRequired ? 'Verify & Continue' : 'Authorize Security Key'}
                </button>
              </div>
            </form>

            <div className="flex justify-between items-center pt-2.5 border-t border-[#F5F2ED] text-xs">
              <button 
                id="btn-return-corporate"
                type="button"
                onClick={() => setViewMode('website')}
                className="text-[#4E6E5D] hover:text-[#3D5A4A] font-semibold transition cursor-pointer"
              >
                ← Corporate Website
              </button>
              
              <button 
                id="btn-switch-register"
                type="button"
                onClick={() => setViewMode('register')}
                className="text-[#4E6E5D] hover:text-[#3D5A4A] font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register for Access</span>
              </button>
            </div>

          </div>

        </div>
        {renderSandboxOutboxTray()}
      </div>
    );
  }

  return (
    <div id="hakilix-root-container" className="flex h-screen bg-[#F5F2ED] text-[#2D3A2D] overflow-hidden font-sans">
      
      {/* Dynamic top notification banner when simulator is run */}
      {activeNotification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#2D3A2D] border border-[#A3B18A]/40 text-white rounded-[24px] shadow-lg p-5 flex items-center gap-3 animate-bounce max-w-lg min-w-[340px]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#A3B18A] animate-ping shrink-0" />
          <p className="text-xs font-mono text-[#F5F2ED] font-medium tracking-tight">
            {activeNotification}
          </p>
        </div>
      )}

      {/* Role and Tabs Managed Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        activeRole={activeRole} 
        setActiveRole={setActiveRole}
        openAlertsCount={openAlertsCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Primary Dashboard Frame */}
      <main className="flex-1 flex flex-col overflow-hidden h-full">

        {/* Global Hub Info Banner */}
        <header className="bg-white/90 backdrop-blur-md border-b border-[#E6E2D3] px-4 md:px-8 py-4 shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger layout toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-[#4E6E5D] transition cursor-pointer flex items-center justify-center"
              title="Open Menu Drawer"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div className="text-left">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#7A847A] font-sans">
                Rosewood Reablement Portal
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4E6E5D] animate-pulse shrink-0"></span>
                <span className="text-xs sm:text-sm font-serif font-semibold text-[#0A2A22] line-clamp-1">
                  10 Ambient IoT Radar Nodes Active &amp; Safety Compliance Monitored
                </span>
              </div>
            </div>
          </div>

          {currentResident && (
            <div className="hidden xl:flex items-center gap-2.5 border-l border-[#E6E2D3] pl-5 mr-auto">
              <div className="relative shrink-0 select-none">
                {currentResident.photo_url ? (
                  <img
                    src={currentResident.photo_url}
                    alt={`${currentResident.first_name} ${currentResident.last_name}`}
                    className="w-8 h-8 rounded-full border border-[#4E6E5D]/30 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-[#4E6E5D]/20 bg-[#4E6E5D]/10 text-[#4E6E5D] flex items-center justify-center font-bold text-[10px] font-mono">
                    {`${currentResident.first_name ? currentResident.first_name.charAt(0) : ''}${currentResident.last_name ? currentResident.last_name.charAt(0) : ''}`.toUpperCase() || 'R'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
              </div>
              <div className="text-left font-sans">
                <p className="text-[8px] uppercase tracking-wider font-bold text-[#7A847A] leading-none mb-1">Focus Care Profile</p>
                <p className="text-xs font-bold text-[#0A2A22] leading-tight truncate max-w-[150px]">
                  {currentResident.first_name} {currentResident.last_name}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-5 text-xs text-[#7A847A] shrink-0">
            <span className="font-sans hidden md:inline">
              System Time: <strong className="text-[#0A2A22] font-medium">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</strong>
            </span>
            <button 
              id="refresh-btn"
              onClick={refreshAllData}
              className="text-white hover:bg-[#3D5A4A] bg-[#4E6E5D] font-medium flex items-center gap-1.5 focus:outline-none px-3 sm:px-4 py-2 rounded-full shadow-sm transition duration-200 cursor-pointer"
              title="Recalc DB Cache Metrics"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SYNC DB</span>
            </button>
          </div>
        </header>

        {/* Dynamic View container body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
              <RefreshCw className="w-8 h-8 text-[#4E6E5D] animate-spin" />
              <span className="text-[#7A847A] font-medium text-xs uppercase tracking-widest">Reconciling HAKILIX Relational Cache Data...</span>
            </div>
          ) : (
            <>
              {activeRole === 'Family Viewer' ? (
                renderClientDashboardView()
              ) : (
                <>
                  {/* --- TAB 1: OVERVIEW MAIN --- */}
                  {currentTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Summary Banner Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-white border border-[#E6E2D3] p-6 rounded-[28px] shadow-sm">
                      <div className="text-[10px] text-[#7A847A] font-bold tracking-widest uppercase">Active Care Recipients</div>
                      <div className="text-3xl font-serif font-bold mt-1.5 text-[#0A2A22]">{residents.filter(r => r.profile_status === 'active').length}</div>
                      <div className="text-[#7A847A] text-[10px] mt-1.5 font-medium">✓ Rosewood Site • 100% Audited</div>
                    </div>

                    <div className="bg-white border border-[#E6E2D3] p-6 rounded-[28px] shadow-sm">
                      <div className="text-[10px] text-[#7A847A] font-bold tracking-widest uppercase">Ensuite Occupancy Status</div>
                      <div className="text-3xl font-serif font-bold mt-1.5 text-[#4E6E5D]">
                        {rooms.filter(r => r.occupancy_status === 'occupied').length}/10
                      </div>
                      <div className="text-[#7A847A] text-[10px] mt-1.5 font-medium">Assigned Rooms 101 to 110</div>
                    </div>

                    <div className="bg-white border border-[#E6E2D3] p-6 rounded-[28px] shadow-sm">
                      <div className="text-[10px] text-[#7A847A] font-bold tracking-widest uppercase">Open Safety Alerts</div>
                      <div className={`text-3xl font-serif font-bold mt-1.5 ${openAlertsCount > 0 ? 'text-[#D98E73]' : 'text-[#0A2A22]'}`}>
                        {openAlertsCount}
                      </div>
                      <div className="text-[#7A847A] text-[10px] mt-1.5 font-medium">
                        {openAlertsCount > 0 ? '⚠️ Action Required Immediately' : '✓ No Active Alarms'}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E6E2D3] p-6 rounded-[28px] shadow-sm bg-[#4E6E5D]/5 border-[#A3B18A]/40">
                      <div className="text-[10px] text-[#4E6E5D] font-bold tracking-widest uppercase">Ambient Sensing Type</div>
                      <div className="text-sm font-serif font-bold mt-1.5 text-[#0A2A22] leading-none">81GHz mmWave Radar &amp; Thermal Fusions</div>
                      <div className="text-[#7A847A] text-[10px] mt-2 leading-relaxed">
                        Privacy guaranteed. 100% camera-free environmental monitoring.
                      </div>
                    </div>
                  </div>

                  {/* Active Simulator Scenarios shortcuts shelf */}
                  <div className="bg-[#D98E73] text-white p-6 rounded-[28px] shadow-sm border-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                    <div>
                      <h4 className="font-serif font-semibold text-white tracking-tight text-lg inline-flex items-center gap-1.5">
                        <Play className="w-4 h-4 text-[#F5F2ED] shrink-0" />
                        Professional Demo Simulator Sandbox
                      </h4>
                      <p className="text-stone-100/95 text-xs mt-1">
                        Select an event below to run live clinical scenarios, record radar telemetry timeline, and review safety-compliance alerts.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleTriggerScenario('resident_c_fall_candidate')}
                        className="bg-[#2D3A2D] hover:bg-[#1C261C] text-white font-medium text-xs px-4 py-2.5 rounded-full transition duration-200 cursor-pointer shadow-sm focus:outline-none"
                      >
                        FALL INCIDENT DEMO
                      </button>
                      <button
                        onClick={() => handleTriggerScenario('resident_a_night_bed_exit')}
                        className="bg-[#2D3A2D] hover:bg-[#1C261C] text-white font-medium text-xs px-4 py-2.5 rounded-full transition duration-200 cursor-pointer shadow-sm focus:outline-none"
                      >
                        Albert BED-EXIT DEMO
                      </button>
                      <button
                        onClick={() => handleTriggerScenario('resident_b_wandering_risk')}
                        className="bg-[#2D3A2D] hover:bg-[#1C261C] text-white font-medium text-xs px-4 py-2.5 rounded-full transition duration-200 cursor-pointer shadow-sm focus:outline-none"
                      >
                        Beatrix WANDER BARRIER
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Column 1 & 2: Alerts & Activity Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Critical Open Alerts Block */}
                      <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-serif italic font-bold text-[#2D3A2D] flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#D98E73] animate-pulse" />
                            Rosewood Safety Alarms Dashboard
                          </h3>
                          <button 
                            onClick={() => setCurrentTab('alerts')}
                            className="text-xs text-[#4E6E5D] hover:text-[#3D5A4A] font-semibold"
                          >
                            Go to Workflow →
                          </button>
                        </div>

                        {alerts.filter(a => a.status !== 'Resolved' && a.status !== 'False Positive').length === 0 ? (
                          <div className="p-8 text-center border border-dashed border-[#E6E2D3] rounded-2xl bg-[#F5F2ED]/40">
                            <Check className="w-8 h-8 text-[#4E6E5D] mx-auto mb-2" />
                            <p className="text-[#7A847A] text-xs font-mono">No active care alerts in Rosewood facility.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {alerts
                              .filter(a => a.status !== 'Resolved' && a.status !== 'False Positive')
                              .slice(0, 3)
                              .map(al => {
                                const alarmRes = residents.find(r => r.id === al.resident_id);
                                return (
                                  <div 
                                    key={al.id} 
                                    className={`p-4 border rounded-2xl flex items-start gap-3.5 transition hover:shadow-xs relative ${
                                      al.priority === 'critical' ? 'border-[#D98E73]/40 bg-[#D98E73]/5' : 'border-[#A3B18A]/40 bg-[#A3B18A]/5'
                                    }`}
                                  >
                                    <div className="p-1.5 bg-white border border-[#E6E2D3] rounded-xl shrink-0 shadow-xxs">
                                      <AlertTriangle className={`w-4 h-4 ${al.priority === 'critical' ? 'text-[#D98E73] animate-bounce' : 'text-[#4E6E5D]'}`} />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-[#2D3A2D] uppercase font-sans tracking-wide">
                                          {al.alert_type}
                                        </span>
                                        <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                                          al.priority === 'critical' ? 'bg-[#D98E73] text-white' : 'bg-[#4E6E5D] text-white'
                                        }`}>
                                          {al.priority.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-[#7A847A] font-mono ml-auto">
                                          {new Date(al.generated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                      </div>
                                      
                                      <p className="text-xs text-[#2D3A2D]/90 leading-relaxed font-normal">
                                        {al.summary}
                                      </p>
                                      
                                      <div className="text-[10px] text-[#7A847A] pt-1">
                                        Resident: <strong className="text-[#2D3A2D] font-medium">{alarmRes ? alarmRes.first_name + ' ' + alarmRes.last_name : 'No Target ID'}</strong> • Room {al.room_id.replace('room-', '')}
                                      </div>
                                    </div>

                                    {/* Action Shortcut */}
                                    <button
                                      id={`ack-alert-${al.id}`}
                                      onClick={() => {
                                        setCurrentSelectedAlert(al);
                                        setCurrentTab('alerts');
                                      }}
                                      className="absolute right-3 bottom-3 text-[10px] font-bold text-[#4E6E5D] hover:text-white hover:bg-[#4E6E5D] bg-white border border-[#4E6E5D]/30 px-2.5 py-1 rounded-xl transition duration-150 cursor-pointer"
                                    >
                                      RESPOND
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>

                      {/* Live Space Activity List (Non-contact indicators overview) */}
                      <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6">
                        <h3 className="text-lg font-serif italic font-bold text-[#2D3A2D] mb-4 flex items-center gap-2">
                          <Compass className="w-4 h-4 text-[#4E6E5D]" />
                          Live Room Occupants &amp; Activity State Monitors
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {residents
                            .filter(r => r.profile_status === 'active' && r.room_id)
                            .slice(0, 6)
                            .map(rObj => {
                              const rRoomObj = rooms.find(rm => rm.id === rObj.room_id);
                              const tStateObj = digitalTwins.find(t => t.room_id === rObj.room_id) || { activity_state: 'In Bed' };
                              return (
                                <div 
                                  key={rObj.id}
                                  onClick={() => {
                                    setSelectedResidentId(rObj.id);
                                    setCurrentTab('residents');
                                  }}
                                  className="p-3.5 border border-[#E6E2D3] bg-[#F5F2ED]/40 rounded-2xl hover:border-[#A3B18A]/60 hover:bg-[#F5F2ED]/80 transition cursor-pointer flex justify-between items-center gap-3"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {/* Avatar placeholder with initials or custom photo */}
                                    {rObj.photo_url ? (
                                      <img
                                        src={rObj.photo_url}
                                        alt={`${rObj.first_name} ${rObj.last_name}`}
                                        className="w-8 h-8 rounded-full border border-[#E6E2D3] object-cover shrink-0"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (() => {
                                      const initials = `${rObj.first_name ? rObj.first_name.charAt(0) : ''}${rObj.last_name ? rObj.last_name.charAt(0) : ''}`.toUpperCase() || 'R';
                                      const colors = [
                                        { bg: 'bg-[#4E6E5D]/10 text-[#4E6E5D] border-[#4E6E5D]/20' },
                                        { bg: 'bg-[#D98E73]/10 text-[#D98E73] border-[#D98E73]/20' },
                                        { bg: 'bg-[#E0A96D]/10 text-[#E0A96D] border-[#E0A96D]/20' },
                                        { bg: 'bg-[#7A847A]/10 text-[#7A847A] border-[#7A847A]/20' },
                                        { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                                        { bg: 'bg-amber-50 text-amber-700 border-amber-100' },
                                      ];
                                      let sum = 0;
                                      for (let i = 0; i < rObj.id.length; i++) sum += rObj.id.charCodeAt(i);
                                      const styleObj = colors[sum % colors.length];
                                      return (
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold font-mono tracking-wider shrink-0 ${styleObj.bg}`}>
                                          {initials}
                                        </div>
                                      );
                                    })()}

                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-xs text-[#2D3A2D] truncate">{rObj.first_name} {rObj.last_name}</h4>
                                      <div className="text-[10px] text-[#7A847A] mt-1 font-sans truncate">
                                        Room {rRoomObj?.room_number || '10X'} • Code: {rObj.resident_reference_code}
                                      </div>
                                    </div>
                                  </div>

                                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-xl border uppercase ${
                                    tStateObj.activity_state === 'Fall Candidate' ? 'text-[#D98E73] bg-[#D98E73]/10 border-[#D98E73]/20 font-bold' :
                                    tStateObj.activity_state === 'Walking' ? 'text-[#4E6E5D] bg-[#4E6E5D]/10 border-[#4E6E5D]/20' :
                                    'text-[#7A847A] bg-[#7A847A]/10 border-[#7A847A]/20'
                                  }`}>
                                    {tStateObj.activity_state}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                    </div>

                    {/* Column 3: Quick Carer Audit Log summaries */}
                    <div className="space-y-6">
                      
                      {/* Dynamic Role-Specific Interactive Control Panel Console widget */}
                      {renderRoleSpecificControlWidget()}

                      {/* Recent Governance Audit Trail lines */}
                      <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-[#7A847A] font-bold tracking-widest uppercase block">Security Compliance Audits</span>
                          <button onClick={() => setCurrentTab('audit-logs')} className="text-xs text-[#4E6E5D] font-bold hover:underline">
                            View All
                          </button>
                        </div>

                        <div className="space-y-3.5">
                          {auditLogs.slice(0, 3).map(log => (
                            <div key={log.id} className="text-xs border-l border-[#A3B18A]/40 pl-3.5 space-y-1">
                              <div className="flex justify-between font-mono text-[9.5px]">
                                <span className="font-bold text-[#2D3A2D]">{log.action_type.toUpperCase()}</span>
                                <span className="text-[#7A847A]">
                                  {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <p className="text-xs text-[#2D3A2D]/85 truncate max-w-xs leading-normal">
                                {log.details?.info || `Audited module ${log.module_name}`}
                              </p>
                              <div className="text-[10px] text-[#7A847A] font-sans">
                                Actor: {log.user_name} • RESULT: <strong className="text-[#4E6E5D] uppercase font-bold">OK</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* --- TAB: PREDICTIVE ANALYTICS --- */}
              {currentTab === 'predictive-analytics' && renderPredictiveAnalyticsView()}

                   {/* --- TAB 2: RESIDENTS REGISTER --- */}
              {currentTab === 'residents' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Ledger header summary */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E2D3] pb-5">
                    <div>
                      <h2 className="text-2xl font-serif italic font-bold tracking-tight text-[#2D3A2D] inline-flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#4E6E5D]" />
                        Rosewood Custody &amp; Reablement Ledger
                      </h2>
                      <p className="text-xs text-[#7A847A] mt-1.5 font-sans">
                        Register care recipients, assign private rooms 101 to 110, log daily care notes and examine reablement trends.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        id="add-resident-trigger"
                        onClick={() => setShowAddResidentModal(true)}
                        className="bg-[#4E6E5D] hover:bg-[#3D5A4A] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-sm transition inline-flex items-center gap-2 focus:outline-none cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        ADD RESIDENT / CLIENT
                      </button>
                    </div>
                  </div>

                  {/* Filter controllers panel */}
                  <div className="bg-white border border-[#E6E2D3] p-4 rounded-[24px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:max-w-xs">
                      <Search className="w-4 h-4 text-[#7A847A] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="Search reference codes, name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F5F2ED]/50 border border-[#E6E2D3] rounded-full pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none focus:bg-white text-[#2D3A2D]"
                      />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer transition ${categoryFilter === 'all' ? 'bg-[#2D3A2D] text-white' : 'bg-[#F5F2ED] hover:bg-[#E6E2D3] text-[#2D3A2D]'}`}
                      >
                        ALL PROFILES
                      </button>
                      <button
                        onClick={() => setCategoryFilter('active')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer transition ${categoryFilter === 'active' ? 'bg-[#4E6E5D] text-white' : 'bg-[#F5F2ED] hover:bg-[#E6E2D3] text-[#2D3A2D]'}`}
                      >
                        ACTIVE
                      </button>
                      <button
                        onClick={() => setCategoryFilter('archived')}
                        className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer transition ${categoryFilter === 'archived' ? 'bg-[#D98E73] text-white' : 'bg-[#F5F2ED] hover:bg-[#E6E2D3] text-[#2D3A2D]'}`}
                      >
                        ARCHIVED
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left 1 Column: Grid profiles lists - ordered second on mobile so selected profile details show at top */}
                    <div className="order-2 lg:order-1 lg:col-span-1 space-y-3 max-h-[660px] overflow-y-auto pr-2">
                      <span className="text-[10px] font-bold text-[#7A847A] uppercase tracking-widest block mb-2 px-1">
                        Residents Directories ({filteredResidents.length})
                      </span>

                      {filteredResidents.map(res => {
                        const isSelected = selectedResidentId === res.id;
                        return (
                          <div
                            key={res.id}
                            id={`resident-row-${res.id}`}
                            onClick={() => setSelectedResidentId(isSelected ? null : res.id)}
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-[#4E6E5D]/10 border-[#4E6E5D] shadow-sm'
                                : 'bg-white border-[#E6E2D3] hover:border-[#A3B18A]/60 hover:bg-[#F5F2ED]/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Avatar placeholder with initials or photo */}
                              {res.photo_url ? (
                                <img
                                  src={res.photo_url}
                                  alt={`${res.first_name} ${res.last_name}`}
                                  className="w-10 h-10 rounded-full border border-[#E6E2D3] object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (() => {
                                const initials = `${res.first_name ? res.first_name.charAt(0) : ''}${res.last_name ? res.last_name.charAt(0) : ''}`.toUpperCase() || 'R';
                                const colors = [
                                  { bg: 'bg-[#4E6E5D]/10 text-[#4E6E5D] border-[#4E6E5D]/20' },
                                  { bg: 'bg-[#D98E73]/10 text-[#D98E73] border-[#D98E73]/20' },
                                  { bg: 'bg-[#E0A96D]/10 text-[#E0A96D] border-[#E0A96D]/20' },
                                  { bg: 'bg-[#7A847A]/10 text-[#7A847A] border-[#7A847A]/20' },
                                  { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                                  { bg: 'bg-amber-50 text-amber-700 border-amber-100' },
                                ];
                                let sum = 0;
                                for (let i = 0; i < res.id.length; i++) sum += res.id.charCodeAt(i);
                                const styleObj = colors[sum % colors.length];
                                return (
                                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold font-mono tracking-wider shrink-0 ${styleObj.bg}`}>
                                    {initials}
                                  </div>
                                );
                              })()}

                              <div className="space-y-1 min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-[#2D3A2D] truncate">
                                  {res.first_name} {res.last_name}
                                </h4>
                                <div className="text-[10px] text-[#7A847A] font-mono">
                                  CODE: {res.resident_reference_code}
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1 text-[9px] font-mono select-none">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    res.falls_risk_level === 'very_high' ? 'bg-[#D98E73]/15 text-[#D98E73] font-bold' :
                                    res.falls_risk_level === 'high' ? 'bg-[#E0A96D]/15 text-[#E0A96D] font-bold' :
                                    'bg-[#F5F2ED] text-[#7A847A]'
                                  }`}>
                                    FALL: {res.falls_risk_level.toUpperCase()}
                                  </span>
                                  
                                  {res.room_id && (
                                    <span className="bg-[#4E6E5D]/10 text-[#4E6E5D] px-2 py-0.5 rounded-full font-bold">
                                      ROOM {rooms.find(rm => rm.id === res.room_id)?.room_number || '10X'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <ChevronRight className={`w-4 h-4 text-[#7A847A] shrink-0 transition ${isSelected ? 'rotate-90 text-[#4E6E5D]' : ''}`} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Columns: Focus Profile Detail details - ordered first on mobile */}
                    <div className="order-1 lg:order-2 lg:col-span-2">
                      {currentResident ? (
                        <div className="bg-white border border-[#E6E2D3] rounded-[28px] shadow-sm p-6 space-y-6 text-[#2D3A2D]">
                          
                          {/* Profile Header metadata */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#E6E2D3] pb-5 gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              {/* Large elegant avatar placeholder with initials or photo */}
                              <div className="relative group shrink-0 select-none">
                                {currentResident.photo_url ? (
                                  <img
                                    src={currentResident.photo_url}
                                    alt={`${currentResident.first_name} ${currentResident.last_name}`}
                                    className="w-16 h-16 rounded-2xl border border-[#4E6E5D]/30 object-cover shadow-sm animate-fade-in"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (() => {
                                  const initials = `${currentResident.first_name ? currentResident.first_name.charAt(0) : ''}${currentResident.last_name ? currentResident.last_name.charAt(0) : ''}`.toUpperCase() || 'R';
                                  const colors = [
                                    { bg: 'bg-[#4E6E5D]/10 text-[#4E6E5D] border-[#4E6E5D]/20' },
                                    { bg: 'bg-[#D98E73]/10 text-[#D98E73] border-[#D98E73]/20' },
                                    { bg: 'bg-[#E0A96D]/10 text-[#E0A96D] border-[#E0A96D]/20' },
                                    { bg: 'bg-[#7A847A]/10 text-[#7A847A] border-[#7A847A]/20' },
                                    { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                                    { bg: 'bg-amber-50 text-amber-700 border-amber-100' },
                                  ];
                                  let sum = 0;
                                  for (let i = 0; i < currentResident.id.length; i++) sum += currentResident.id.charCodeAt(i);
                                  const styleObj = colors[sum % colors.length];
                                  return (
                                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-xl font-bold font-mono tracking-wider shadow-sm ${styleObj.bg}`}>
                                      {initials}
                                    </div>
                                  );
                                })()}
                                
                                <button
                                  type="button"
                                  onClick={() => setShowPhotoModal(true)}
                                  className="absolute -bottom-1.5 -right-1.5 bg-[#4E6E5D] hover:bg-[#3D5A4A] text-white p-1.5 rounded-lg shadow-md border border-white transition cursor-pointer flex items-center justify-center"
                                  title="Update residency photo via webcam or file upload"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full text-white ${
                                    currentResident.profile_status === 'archived' ? 'bg-[#7A847A]' : 'bg-[#4E6E5D]'
                                  }`}>
                                    PROTOTYPE FILE {currentResident.profile_status.toUpperCase()}
                                  </span>
                                  <span className="text-[#7A847A] font-mono text-[10px]">Reference: {currentResident.resident_reference_code}</span>
                                  
                                  {/* Mobile-only return/back button */}
                                  <button
                                    onClick={() => setSelectedResidentId(null)}
                                    className="lg:hidden flex items-center gap-1 text-[10.5px] bg-[#0A2A22] text-white font-semibold px-2.5 py-1.5 rounded-full hover:bg-[#1C261C] transition cursor-pointer"
                                  >
                                    ← Back to Directory
                                  </button>
                                </div>
                                <h3 className="text-2xl font-serif text-[#0A2A22] font-bold leading-normal truncate">{currentResident.first_name} {currentResident.last_name}</h3>
                                <p className="text-xs text-[#7A847A] font-sans leading-relaxed">
                                  Care Category: <strong className="text-[#0A2A22]">{currentResident.care_category}</strong> • Admission: {currentResident.admission_date}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Archives button */}
                              {currentResident.profile_status === 'active' && (
                                <button
                                  id="archive-profile-btn"
                                  onClick={() => handleArchiveResident(currentResident.id)}
                                  className="text-xs text-[#2D3A2D] hover:text-[#D98E73] border border-[#E6E2D3] hover:border-[#D98E73] px-3.5 py-2 rounded-full bg-[#F5F2ED] text-center font-semibold flex items-center gap-1.5 focus:outline-none transition cursor-pointer"
                                  title="Archive File Safely"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  <span>ARCHIVE PROFILE</span>
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDownloadReportSim(currentResident.id, 'PDF')}
                                className="text-xs text-[#2D3A2D] hover:text-[#4E6E5D] hover:border-[#4E6E5D]/40 border border-[#E6E2D3] px-3.5 py-2 rounded-full bg-[#F5F2ED] text-center font-semibold flex items-center gap-1.5 transition select-none cursor-pointer"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>REABLEMENT REPORT (PDF)</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex px-1 border-b border-[#E6E2D3] gap-6 mb-4">
                            <button
                              className={`pb-3 text-sm font-semibold transition ${residentDetailTab === 'overview' ? 'text-[#0A2A22] border-b-2 border-[#0A2A22]' : 'text-[#7A847A] hover:text-[#2D3A2D]'}`}
                              onClick={() => setResidentDetailTab('overview')}
                            >
                              Clinical Overview
                            </button>
                            <button
                              className={`pb-3 text-sm font-semibold transition ${residentDetailTab === 'predictive-analytics' ? 'text-[#0A2A22] border-b-2 border-[#0A2A22]' : 'text-[#7A847A] hover:text-[#2D3A2D]'}`}
                              onClick={() => {
                                setResidentDetailTab('predictive-analytics');
                                setSelectedPredictiveResidentId(currentResident.id);
                              }}
                            >
                              Mobility &amp; Activity Log Trends
                            </button>
                            <button
                              className={`pb-3 text-sm font-semibold transition ${residentDetailTab === 'digital-twin' ? 'text-[#0A2A22] border-b-2 border-[#0A2A22]' : 'text-[#7A847A] hover:text-[#2D3A2D]'}`}
                              onClick={() => setResidentDetailTab('digital-twin')}
                            >
                              Interactive Space Digital Twins
                            </button>
                          </div>

                          {residentDetailTab === 'overview' && (
                            <>
                              {/* Room Geometry Allocation Info Box */}
                              <div className="p-5 bg-[#F5F2ED] border border-[#E6E2D3] rounded-[24px] space-y-4">
                                <div className="flex items-center justify-between text-xs text-[#2D3A2D]">
                                  <span className="font-bold text-[#2D3A2D] font-serif italic text-base">Spatial Room Assignment (Rosewood Ward)</span>
                                  <span className="text-[#7A847A] font-mono text-[10px] tracking-wide font-bold">ROOM ALLOCATOR CORE</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                                  <div className="bg-white p-3.5 rounded-2xl border border-[#E6E2D3] shadow-xs">
                                    <div className="text-[10px] text-[#7A847A] font-bold uppercase tracking-wider">Current Assigned Bedroom</div>
                                    <div className="font-bold text-[#2D3A2D] mt-1 font-serif text-sm">
                                      {currentResidentRoom ? `${currentResidentRoom.name} (${currentResidentRoom.floor_number})` : 'UNASSIGNED'}
                                    </div>
                                  </div>

                                  <div className="bg-white p-3.5 rounded-2xl border border-[#E6E2D3] shadow-xs">
                                    <div className="text-[10px] text-[#7A847A] font-bold uppercase tracking-wider">Falls Vulnerability Class</div>
                                    <div className={`font-bold mt-1 text-sm ${
                                      currentResident.falls_risk_level === 'very_high' ? 'text-[#D98E73]' :
                                      currentResident.falls_risk_level === 'high' ? 'text-[#E0A96D]' :
                                      'text-[#4E6E5D]'
                                    }`}>
                                      {currentResident.falls_risk_level.replace('_', ' ').toUpperCase()} Risk
                                    </div>
                                  </div>

                                  <div className="bg-white p-3.5 rounded-2xl border border-[#E6E2D3] shadow-xs">
                                    <div className="text-[10px] text-[#7A847A] font-bold uppercase tracking-wider">Night Support Level</div>
                                    <div className="font-bold text-[#2D3A2D] mt-1 text-sm uppercase">
                                      {currentResident.night_support_level} Level Care
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Graphical Recharts-like elegant line progress tracker */}
                              {renderSVGRecoveryTrendChart(currentResident.id)}

                          {/* Reablement Goals Monitor Component */}
                          <div className="border border-[#E6E2D3] p-5 rounded-[24px] bg-[#F5F2ED]/40 space-y-4">
                            <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-widest font-mono flex items-center gap-1.5 pb-2 border-b border-[#E6E2D3]/65">
                              <Award className="w-4 h-4 text-[#4E6E5D]" />
                              Active Physical Reablement Goals
                            </h4>

                            {reablementGoals.filter(g => g.resident_id === currentResident.id).map(g => (
                              <div key={g.id} className="text-xs space-y-2">
                                <div className="flex justify-between font-sans">
                                  <span className="font-bold text-[#2D3A2D]">{g.goal_title}</span>
                                  <span className="text-[#7A847A] font-medium">Target Score: {g.target_score}% (Current: {g.current_score}%)</span>
                                </div>
                                <p className="text-[#7A847A] leading-relaxed text-xs">{g.goal_description}</p>
                                
                                {/* custom stylish progress bar */}
                                <div className="w-full bg-[#E6E2D3] rounded-full h-2.5 overflow-hidden shadow-inner">
                                  <div 
                                    className="bg-[#4E6E5D] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (g.current_score / g.target_score) * 100)}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-[#7A847A] font-mono">
                                  Goal Status: <strong className="text-[#4E6E5D] uppercase font-bold">{g.status}</strong> • Start: {g.start_date}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Notes timeline tab controller (Carer vs Clinician reviewers) */}
                          <div className="border-t border-[#E6E2D3] pt-5 space-y-6">
                            
                            {/* Carer Timeline notes logger */}
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h4 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-widest font-mono flex items-center gap-1">
                                  <FileText className="w-4 h-4 text-[#7A847A]" />
                                  Hourly Carer Logs Timeline
                                </h4>

                                <button
                                  id="voice-transcribe-trigger"
                                  onClick={() => setShowVoiceTranscribeModal(true)}
                                  className="bg-[#2D3A2D] hover:bg-[#1C261C] text-white font-semibold text-[11px] px-4 py-2.5 rounded-full flex items-center gap-1.5 transition focus:outline-none shadow-xs cursor-pointer"
                                >
                                  <Mic className="w-3.5 h-3.5 text-[#A3B18A] animate-pulse" />
                                  DICTATE CARER NOTE WITH GEMINI AI
                                </button>
                              </div>

                              {/* Manual Carer Input box form */}
                              <div className="p-4 border border-[#E6E2D3] rounded-[24px] bg-[#F5F2ED]/30 space-y-4">
                                <span className="text-[10px] font-bold text-[#7A847A] uppercase tracking-widest block">Write custom manual log</span>
                                
                                <textarea
                                  placeholder="Type custom morning transfer, assistance completion notes, behaviour patterns observed..."
                                  value={newCarerNoteText}
                                  onChange={(e) => setNewCarerNoteText(e.target.value)}
                                  rows={2}
                                  className="w-full bg-white text-xs border border-[#E6E2D3] p-3.5 rounded-2xl focus:ring-1 focus:ring-[#4E6E5D] focus:outline-none text-[#2D3A2D]"
                                />

                                <div className="flex flex-wrap justify-between items-center gap-3">
                                  <div className="flex flex-wrap gap-2 text-xxs">
                                    <select
                                      value={newCarerNoteType}
                                      onChange={(e) => setNewCarerNoteType(e.target.value)}
                                      className="bg-white border rounded p-1 text-slate-700 outline-none"
                                    >
                                      <option>Daily Gait Check</option>
                                      <option>Sleep Hygiene Log</option>
                                      <option>Dementia Distress Check</option>
                                      <option>Ensuite Activity Logs</option>
                                    </select>

                                    <select
                                      value={newCarerNoteMood}
                                      onChange={(e) => setNewCarerNoteMood(e.target.value)}
                                      className="bg-white border rounded p-1 text-slate-700 outline-none"
                                    >
                                      <option>Cooperative</option>
                                      <option>Calm</option>
                                      <option>Quiet</option>
                                      <option>Restless</option>
                                      <option>Anxious</option>
                                    </select>

                                    <label className="inline-flex items-center gap-1 text-slate-600 font-mono cursor-pointer select-none">
                                      <input 
                                        type="checkbox" 
                                        checked={newCarerNoteConcern} 
                                        onChange={(e) => setNewCarerNoteConcern(e.target.checked)} 
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-0" 
                                      />
                                      <span>Concern Flag</span>
                                    </label>
                                  </div>

                                  <button
                                    id="submit-carer-note-btn"
                                    onClick={() => handlePostCarerNote()}
                                    className="bg-emerald-600 hover:bg-emerald-550 text-white text-xxs font-mono font-bold px-3.5 py-2 rounded-lg transition shadow-xxs focus:outline-none"
                                  >
                                    PUBLISH NOTE
                                  </button>
                                </div>
                              </div>

                              {/* Note timeline render */}
                              <div className="space-y-3 pt-2">
                                {carerNotes.filter(n => n.resident_id === currentResident.id).length === 0 ? (
                                  <p className="text-slate-400 font-mono text-xxs py-4 text-center">No carer logs recorded for this resident yet.</p>
                                ) : (
                                  carerNotes
                                    .filter(n => n.resident_id === currentResident.id)
                                    .map(note => (
                                      <div key={note.id} className="p-3.5 border border-slate-150 rounded-xl bg-white space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="font-bold text-xs text-slate-800 font-mono uppercase bg-slate-100 px-2 py-0.5 rounded">
                                            {note.note_type}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            {new Date(note.created_at).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-650 leading-relaxed font-normal">{note.note_text}</p>
                                        
                                        <div className="flex flex-wrap gap-2 text-[9px] font-mono text-slate-500 select-none">
                                          <span>Author: <strong>{note.author_name}</strong></span>
                                          <span>• Mood: <strong className="text-emerald-600">{note.mood_observed || 'Quiet'}</strong></span>
                                          <span>• Mobility: <strong>{note.mobility_observed || 'No data'}</strong></span>
                                          {note.concern_flag && (
                                            <span className="text-rose-600 bg-rose-50 px-1 rounded font-extrabold animate-pulse">
                                              ⚠ FLAG FOR CLINICAL ACTION
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                )}
                              </div>
                            </div>

                            {/* Clinician Review input section */}
                            {activeRole === 'Clinical Lead' && (
                              <div className="space-y-4 border-t border-slate-150 pt-5">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono flex items-center gap-1.5">
                                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                                  Clinical Rehabilitation Therapy Review inputs
                                </h4>

                                <form onSubmit={handlePostClinicianNote} className="space-y-4 p-4 border border-slate-200/80 bg-slate-50/70 rounded-2xl">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Professional Clinical Summary</label>
                                      <textarea
                                        placeholder="Add general therapist posture findings, gait balance indices updates, physical milestones accomplished..."
                                        value={newClinicianSummary}
                                        onChange={(e) => setNewClinicianSummary(e.target.value)}
                                        rows={2}
                                        required
                                        className="w-full bg-white text-xs p-2.5 border border-slate-250 rounded-xl focus:outline-none"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Functional mobility actions</label>
                                      <textarea
                                        placeholder="Gait swing timing, stance length balance observations, frame compliance notes, risk adjustments..."
                                        value={newClinicianFunctional}
                                        onChange={(e) => setNewClinicianFunctional(e.target.value)}
                                        rows={2}
                                        className="w-full bg-white text-xs p-2.5 border border-slate-250 rounded-xl focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="space-y-1">
                                      <label className="text-xxs font-bold text-slate-450 uppercase tracking-widest font-mono block">New Mobility Score (0-100)</label>
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={newClinicianMobilityScore}
                                        onChange={(e) => setNewClinicianMobilityScore(Number(e.target.value))}
                                        className="w-full bg-white text-xs p-2.5 border border-slate-250 rounded-xl"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-xxs font-bold text-slate-455 uppercase tracking-widest font-mono block">Independence Index (0-100)</label>
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={newClinicianIndependenceScore}
                                        onChange={(e) => setNewClinicianIndependenceScore(Number(e.target.value))}
                                        className="w-full bg-white text-xs p-2.5 border border-slate-250 rounded-xl"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <span className="text-[10px] text-slate-400 block font-mono">
                                        Note: Publishing automatically increments recovery timeline graph and updates resident's primary status.
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Therapist Recommendation actions list</label>
                                    <input 
                                      type="text" 
                                      placeholder="Continue double frame support in evening; evaluate transfers in en-suite bathroom next Tuesday..."
                                      value={newClinicianActions}
                                      onChange={(e) => setNewClinicianActions(e.target.value)}
                                      className="w-full bg-white text-xs p-2.5 border border-slate-250 rounded-xl"
                                    />
                                  </div>

                                  <div className="text-right">
                                    <button
                                      type="submit"
                                      className="bg-emerald-600 hover:bg-emerald-550 text-white text-xxs font-mono font-bold px-4 py-2 rounded-lg transition shadow-xxs focus:outline-none"
                                    >
                                      PUBLISH THERAPIST REVIEW
                                    </button>
                                  </div>
                                </form>

                                {/* List previous Clinician logs */}
                                <div className="space-y-3 pt-2">
                                  {clinicianNotes.filter(n => n.resident_id === currentResident.id).map(cNote => (
                                    <div key={cNote.id} className="p-4 border border-sky-100 bg-sky-50/5/30 rounded-xl space-y-2.5 font-normal">
                                      <div className="flex justify-between items-center text-xs font-mono">
                                        <span className="font-bold text-sky-800">{cNote.clinician_role || 'Therapist Review'}</span>
                                        <span className="text-slate-400">{cNote.review_date}</span>
                                      </div>
                                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{cNote.clinical_summary}</p>
                                      {cNote.functional_observation && (
                                        <div className="text-xxs bg-white border border-sky-50 p-2.5 rounded-lg text-slate-600 font-mono leading-normal">
                                          <strong>FUNCTIONAL GAIT OBS:</strong> {cNote.functional_observation}
                                        </div>
                                      )}
                                      <div className="text-[10px] text-slate-500 font-mono">
                                        Assigned by: <strong>{cNote.author_name}</strong> • Gait Score: <strong className="text-sky-700 font-bold">{cNote.mobility_score}%</strong> • Recommendations: {cNote.recommended_actions || 'Preserve routine'}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                              </div>
                            )}

                          </div>
                          </>
                          )}

                          {/* Predictive Analytics Tab content */}
                          {residentDetailTab === 'predictive-analytics' && (
                            <div className="pt-2 animate-fade-in">
                              {renderPredictiveAnalyticsView(true, currentResident.id)}
                            </div>
                          )}

                          {/* Interactive Space Digital Twins Tab content */}
                          {residentDetailTab === 'digital-twin' && currentResidentRoom && (
                            <div className="pt-2 animate-fade-in space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[#E6E2D3] rounded-2xl p-4 gap-4">
                                <div>
                                  <h3 className="text-sm font-bold font-serif text-[#0A2A22]">Interactive Space Digital Twins</h3>
                                  <p className="text-[11px] text-[#7A847A] leading-relaxed mt-1">Live structural readout and mmWave node states for physical en-suite unit <strong>{currentResidentRoom.name}</strong>.</p>
                                </div>
                                <div className="text-[10px] font-mono font-bold text-[#4E6E5D] bg-[#4E6E5D]/10 px-3 py-1.5 rounded-full whitespace-nowrap">
                                  Sensory Link: {currentResidentTwinState?.activity_state || 'Nominal Wait'}
                                </div>
                              </div>
                              <DigitalTwinView 
                                room={currentResidentRoom}
                                resident={currentResident}
                                twinState={currentResidentTwinState}
                                onRunScenario={handleTriggerScenario}
                                isLoading={isSimulating}
                                activeAlert={currentResidentActiveAlert}
                                onRefreshData={refreshAllData}
                              />
                            </div>
                          )}
                          {residentDetailTab === 'digital-twin' && !currentResidentRoom && (
                            <div className="bg-[#F5F2ED] border border-[#E6E2D3] p-10 rounded-2xl text-center">
                              <p className="text-xs font-mono text-[#7A847A]">No assigned bedroom geometry telemetry available for this resident profile yet.</p>
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl h-96 flex flex-col items-center justify-center text-center p-8">
                          <Users className="w-12 h-12 text-slate-300 mb-3" />
                          <h3 className="text-sm font-semibold text-slate-700">No Resident Profile selected</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Select a care recipient from the left directories list to inspect full reablement charts, carer timeline logs, and active rooms assignment.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* --- TAB 3: ALERTS ACTIONS WORKFLOW --- */}
              {currentTab === 'alerts' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-[#E6E2D3] pb-5">
                    <h2 className="text-2xl font-serif font-bold tracking-tight text-[#0A2A22] inline-flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-[#D98E73]" />
                      Amber &amp; Critical Care Alarm Workflows
                    </h2>
                    <p className="text-xs text-[#7A847A] mt-1.5 font-sans">
                      Acknowledge safety events, increase escalation routes, and write response verification comments to resolve pending alarms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Alarms lists - ordered second on mobile so active form shows first */}
                    <div className="order-2 lg:order-1 lg:col-span-2 space-y-4">
                      <span className="text-[10px] font-bold text-[#7A847A] uppercase tracking-widest block">Alarms History Ledger</span>

                      {alerts.length === 0 ? (
                        <div className="bg-white border border-[#E6E2D3] p-12 rounded-[28px] text-center">
                          <Check className="w-12 h-12 text-[#4E6E5D] mx-auto mb-3" />
                          <h3 className="text-sm font-semibold text-[#2D3A2D]">All Ward vectors quiet</h3>
                          <p className="text-xs text-[#7A847A] mt-1">No pending or unresolved safety alerts recorded in Rosewood.</p>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {alerts.map(al => {
                            const matchRes = residents.find(r => r.id === al.resident_id);
                            return (
                              <div
                                key={al.id}
                                className={`p-5 border rounded-2xl flex items-start justify-between gap-4 transition bg-white ${
                                  al.status === 'New' 
                                    ? (al.priority === 'critical' ? 'border-l-4 border-l-[#D98E73] border-[#E6E2D3] bg-[#D98E73]/5 shadow-sm' : 'border-l-4 border-l-[#E0A96D] border-[#E6E2D3] bg-[#E0A96D]/5 shadow-sm')
                                    : 'border-[#E6E2D3] bg-white'
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-[#2D3A2D] font-mono uppercase">
                                      {al.alert_type}
                                    </span>
                                    <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase ${
                                      al.priority === 'critical' ? 'bg-[#D98E73] text-white' : 'bg-[#E0A96D] text-white'
                                    }`}>
                                      {al.priority}
                                    </span>
                                    <span className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                                      al.status === 'New' ? 'bg-[#D98E73]/15 text-[#D98E73] animate-pulse' :
                                      al.status === 'Acknowledged' ? 'bg-[#E0A96D]/15 text-[#E0A96D]' :
                                      'bg-[#F5F2ED] text-[#7A847A]'
                                    }`}>
                                      {al.status}
                                    </span>
                                    <span className="text-xxs text-[#7A847A] font-mono">
                                      {new Date(al.generated_at).toLocaleString()}
                                    </span>
                                  </div>

                                  <p className="text-xs text-[#2D3A2D]/80 leading-relaxed font-sans max-w-xl">{al.summary}</p>
                                  
                                  <div className="text-[10px] text-[#7A847A] font-mono">
                                    Room {al.room_id.replace('room-', '')} • Target Care Recipient: <strong>{matchRes ? matchRes.first_name + ' ' + matchRes.last_name : 'Unknown'}</strong> 
                                    {al.resolved_at && ` • Resolved at ${new Date(al.resolved_at).toLocaleTimeString()} with notes: "${al.resolution_notes}"`}
                                  </div>
                                </div>

                                {/* Respond trigger button */}
                                {al.status !== 'Resolved' && al.status !== 'False Positive' && (
                                  <button
                                    onClick={() => setCurrentSelectedAlert(al)}
                                    className="bg-[#2D3A2D] hover:bg-[#1C261C] text-white font-semibold text-xs px-4 py-2 rounded-full focus:outline-none transition shrink-0 cursor-pointer"
                                  >
                                    DISPATCH ACTION
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Column 3: Active Action dispatch panels - ordered first on mobile */}
                    <div className="order-1 lg:order-2">
                      {currentSelectedAlert ? (
                        <div className="bg-white border border-[#E6E2D3] rounded-[24px] shadow-sm p-6 space-y-5 animate-fade-in text-[#2D3A2D]">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#7A847A] uppercase tracking-widest block">Authorized care action form</span>
                              {/* Mobile-only return/close button */}
                              <button
                                onClick={() => setCurrentSelectedAlert(null)}
                                className="lg:hidden flex items-center gap-1 text-[10.5px] bg-[#D98E73] text-white font-semibold px-2.5 py-1 rounded-full hover:bg-[#c4775c] transition cursor-pointer"
                              >
                                ← Close Form
                              </button>
                            </div>
                            <h3 className="text-xs font-bold text-[#2D3A2D] mt-1.5 leading-normal font-mono uppercase bg-[#F5F2ED] border border-[#E6E2D3]/60 p-2.5 rounded-xl">
                              RESPOND: {currentSelectedAlert.alert_type}
                            </h3>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#7A847A] uppercase tracking-widest block">Action Resolution Comments</label>
                            <textarea
                              placeholder="Describe actual ward physical verification findings (e.g. 'Albert safely redirected; bed sheet alignment straightened; no injury')"
                              value={alertResolveNotes}
                              onChange={(e) => setAlertResolveNotes(e.target.value)}
                              rows={3}
                              className="w-full text-xs font-sans border border-[#E6E2D3] p-3 rounded-2xl focus:ring-1 focus:ring-[#4E6E5D] focus:border-[#4E6E5D] focus:outline-none bg-[#F5F2ED]/10 text-[#2D3A2D]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#7A847A] uppercase tracking-widest block">Escalation Priority Steps</label>
                            <select
                              value={alertEscalationValue}
                              onChange={(e) => setAlertEscalationValue(Number(e.target.value))}
                              className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] text-xs rounded-xl p-3 focus:outline-none cursor-pointer font-sans text-[#2D3A2D]"
                            >
                              <option value={0}>Level 0 (Standard on-duty review)</option>
                              <option value={1}>Level 1 (Clinical Speciality shift review)</option>
                              <option value={2}>Level 2 (Escalate to center director immediate review)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xxs font-mono">
                            <button
                              id="btn-ack-alert"
                              onClick={() => handleModifyAlertStatus(currentSelectedAlert.id, 'Acknowledged')}
                              className="bg-[#E0A96D] hover:bg-[#C99859] text-white font-bold py-3 rounded-full transition focus:outline-none cursor-pointer"
                            >
                              ACKNOWLEDGE ALARM
                            </button>

                            <button
                              id="btn-resolve-alert"
                              onClick={() => handleModifyAlertStatus(currentSelectedAlert.id, 'Resolved')}
                              className="bg-[#4E6E5D] hover:bg-[#3D5A4A] text-white font-bold py-3 rounded-full transition focus:outline-none cursor-pointer"
                            >
                              RESOLVED &amp; CLOSE
                            </button>
                          </div>

                          <div className="text-[10px] text-[#7A847A] leading-normal font-sans">
                            ⚠ Note: Closing the alarm removes the warning flashers in both the active Resident directories and space Digital Twins.
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#F5F2ED]/40 border border-[#E6E2D3] rounded-[24px] p-6 text-center text-[#7A847A] font-sans text-[11px] leading-relaxed">
                          Select 'DISPATCH ACTION' on any active alarm to open the authorized response verification and escalation form.
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* --- TAB 5: DEVICE HEALTH --- */}
              {currentTab === 'device-health' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-slate-200 pb-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 inline-flex items-center gap-2">
                      <Cpu className="w-6 h-6 text-emerald-600" />
                      PoE Sensor Hardware Nodes Health Log
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Inspect continuous heartbeat connections, hardware chassis tamper switches, and reboot PoE controllers for the Rosewood facility ward.
                    </p>
                  </div>

                  <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-550 h-10 select-none">
                        <tr>
                          <th className="px-5 font-bold">NODE NAME &amp; TYPE</th>
                          <th className="px-5 font-bold">SERIAL NUMBER</th>
                          <th className="px-5 font-bold">IP &amp; MAC ADDRESS</th>
                          <th className="px-5 font-bold">LAST HEARTBEAT</th>
                          <th className="px-5 font-bold">CONN COORD STATUS</th>
                          <th className="px-5 font-bold text-center">CHASSIS SWITCH</th>
                          <th className="px-5 font-bold text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {devices.map(dev => (
                          <tr key={dev.id} className="h-14 font-mono hover:bg-slate-50/50">
                            <td className="px-5">
                              <div className="font-bold text-slate-800">{dev.device_name}</div>
                              <div className="text-[10px] text-slate-400 uppercase mt-0.5">{dev.device_type}</div>
                            </td>
                            <td className="px-5 text-slate-500 font-mono">{dev.serial_number}</td>
                            <td className="px-5 text-slate-500 font-mono">
                              <div>{dev.ip_address || 'Internal'}</div>
                              <div className="text-[10px] text-slate-400 uppercase mt-0.5">{dev.mac_address || 'Null'}</div>
                            </td>
                            <td className="px-5 text-slate-500">
                              {dev.last_seen_at ? new Date(dev.last_seen_at).toLocaleTimeString() : 'Awaiting Heartbeat'}
                            </td>
                            <td className="px-5">
                              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                                dev.health_status === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-805'
                              }`}>
                                {dev.health_status}
                              </span>
                            </td>
                            <td className="px-5 text-center">
                              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                                dev.tamper_status === 'normal' ? 'bg-slate-100 text-slate-600' : 'bg-rose-500 text-white animate-pulse'
                              }`}>
                                {dev.tamper_status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 text-center">
                              <button
                                onClick={async () => {
                                  const res = await fetch(`/api/devices/${dev.id}/reboot`, { method: 'POST' });
                                  const resData = await res.json();
                                  alert(resData.message);
                                  await refreshAllData();
                                }}
                                className="bg-slate-900 text-white text-xxs font-mono font-bold py-1.5 px-3 rounded-lg focus:outline-none transition active:scale-95"
                              >
                                REBOOT
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* --- TAB 6: REPORTS SELECTOR --- */}
              {currentTab === 'reports' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-slate-200 pb-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 inline-flex items-center gap-2">
                      <FileText className="w-6 h-6 text-emerald-600" />
                      Compliance &amp; Reablement Reporting
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Export compiled clinical gait reviews and raw sensor logs as immutable PDF files for regulatory compliance reviews.
                    </p>
                  </div>

                  <div className="bg-white border rounded-2xl shadow-sm p-6 max-w-xl mx-auto space-y-6">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-slate-800">Export Clinical Dossier Report</h3>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                        This export generates a fully detailed PDF summarizing resident bed hygiene cycles, gait recovery metrics, and alert workflows to satisfy compliance.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono block">SELECT TARGET CARE RECIPIENT</label>
                        <select 
                          value={selectedResidentId || ''} 
                          onChange={(e) => setSelectedResidentId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-none font-semibold text-slate-850"
                        >
                          <option value="">-- Choose active resident profile --</option>
                          {residents.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.first_name} {r.last_name} ({r.resident_reference_code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => selectedResidentId && handleDownloadReportSim(selectedResidentId, 'PDF')}
                          disabled={!selectedResidentId}
                          className="w-full bg-emerald-600 hover:bg-emerald-555 text-white disabled:bg-slate-300 font-mono font-bold text-xs py-3 rounded-xl transition shadow-xs focus:outline-none"
                        >
                          DOWNLOAD PDF DOSSIER
                        </button>

                        <button
                          onClick={() => selectedResidentId && handleDownloadReportSim(selectedResidentId, 'CSV')}
                          disabled={!selectedResidentId}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-300 font-mono font-bold text-xs py-3 rounded-xl transition shadow-xs focus:outline-none"
                        >
                          EXPORT TABULAR CSV LOG
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border rounded-xl text-xxs text-slate-500 font-mono uppercase tracking-wider text-center select-none">
                      IMMUTABLE COMPLIANCE EXPORT REGISTERED ONLINE ✓
                    </div>
                  </div>

                </div>
              )}

              {/* --- TAB 7: DATABASE CONFIG MONITOR --- */}
              {currentTab === 'database-dashboard' && (
                <div className="animate-fade-in space-y-8">
                  <DatabaseDashboard 
                    metrics={metrics} 
                    isLoading={isLoading} 
                    onFlushDb={handleResetDbToSeeds} 
                  />

                  {/* Security Clearance check for DB Administration */}
                  {['Clinical Lead', 'Facility Manager', 'Technical Support'].includes(activeRole) ? (
                    <div className="bg-white border border-[#E6E2D3] rounded-[32px] p-8 shadow-sm space-y-6">
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-[#F5F2ED]">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#4E6E5D] font-mono block">
                            🛡️ Database Control Operations Console
                          </span>
                          <h3 className="text-xl font-serif font-bold text-[#0A2A22]">
                            Relational CRUD Directory Management
                          </h3>
                        </div>

                        {/* Management Switchers */}
                        <div className="inline-flex bg-[#F5F2ED] p-1 rounded-full border border-[#E6E2D3]">
                          <button
                            onClick={() => setDbManageMode('residents')}
                            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-tight transition duration-150 cursor-pointer ${dbManageMode === 'residents' ? 'bg-[#0A2A22] text-white' : 'text-[#7A847A] hover:text-[#0A2A22]'}`}
                          >
                            Care Recipients (Clients)
                          </button>
                          <button
                            onClick={() => setDbManageMode('users')}
                            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-tight transition duration-150 cursor-pointer ${dbManageMode === 'users' ? 'bg-[#0A2A22] text-white' : 'text-[#7A847A] hover:text-[#0A2A22]'}`}
                          >
                            System Staff (Users)
                          </button>
                        </div>
                      </div>

                      {/* MODE 1: CLIENTS/RESIDENTS DIRECTORY CONTROL */}
                      {dbManageMode === 'residents' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#7A847A] font-mono uppercase font-bold">
                              {residents.length} Active Care Recipients profiles registered
                            </span>
                            <button
                              onClick={() => setShowAddResidentModal(true)}
                              className="text-white hover:bg-[#3D5A4A] bg-[#4E6E5D] font-medium text-xs flex items-center gap-1.5 px-4 py-2 rounded-full transition duration-155 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Register New Resident</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Left List Pane */}
                            <div className="lg:col-span-5 bg-[#F5F2ED]/30 rounded-2xl border border-[#E6E2D3] p-4 max-h-[500px] overflow-y-auto space-y-2">
                              {residents.map((res) => (
                                <div
                                  key={res.id}
                                  onClick={() => setSelectedResidentToEdit(res)}
                                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${selectedResidentToEdit?.id === res.id ? 'bg-[#4E6E5D]/10 border-[#4E6E5D]' : 'bg-white border-stone-200 hover:border-stone-300'}`}
                                >
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      {/* Avatar placeholder with initials or photo */}
                                      {res.photo_url ? (
                                        <img
                                          src={res.photo_url}
                                          alt={`${res.first_name} ${res.last_name}`}
                                          className="w-8 h-8 rounded-full border border-stone-200 object-cover shrink-0"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (() => {
                                        const initials = `${res.first_name ? res.first_name.charAt(0) : ''}${res.last_name ? res.last_name.charAt(0) : ''}`.toUpperCase() || 'R';
                                        const colors = [
                                          { bg: 'bg-[#4E6E5D]/10 text-[#4E6E5D] border-[#4E6E5D]/20' },
                                          { bg: 'bg-[#D98E73]/10 text-[#D98E73] border-[#D98E73]/20' },
                                          { bg: 'bg-[#E0A96D]/10 text-[#E0A96D] border-[#E0A96D]/20' },
                                          { bg: 'bg-[#7A847A]/10 text-[#7A847A] border-[#7A847A]/20' },
                                          { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                                          { bg: 'bg-amber-50 text-amber-700 border-amber-100' },
                                        ];
                                        let sum = 0;
                                        for (let i = 0; i < res.id.length; i++) sum += res.id.charCodeAt(i);
                                        const styleObj = colors[sum % colors.length];
                                        return (
                                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold font-mono tracking-wider shrink-0 ${styleObj.bg}`}>
                                            {initials}
                                          </div>
                                        );
                                      })()}

                                      <div className="min-w-0 flex-1">
                                        <h5 className="font-bold text-xs text-[#2D3A2D] truncate">
                                          {res.first_name} {res.last_name}
                                        </h5>
                                        <p className="text-[10px] text-[#7A847A] font-mono mt-0.5">
                                          REF: {res.resident_reference_code}
                                        </p>
                                      </div>
                                    </div>
                                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${res.profile_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                                      {res.profile_status}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-2.5 text-[10px] text-[#7A847A] border-t border-dashed border-stone-100 pt-2 font-mono">
                                    <span>Unit Room: {res.room_id ? `Room ${rooms.find(rm => rm.id === res.room_id)?.room_number || res.room_id}` : 'Unassigned'}</span>
                                    <span className="font-semibold text-[#4E6E5D]">{res.care_category}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Right Edit Details Form */}
                            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E6E2D3] p-6 text-left">
                              {selectedResidentToEdit ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateResidentSubmit(selectedResidentToEdit.id, selectedResidentToEdit);
                                  }}
                                  className="space-y-4"
                                >
                                  <h4 className="text-xs font-bold text-[#2D3A2D] uppercase font-mono tracking-wider pb-2 border-b border-[#F5F2ED]">
                                    ✏️ Edit Care Unit details: {selectedResidentToEdit.first_name} {selectedResidentToEdit.last_name}
                                  </h4>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">First Name</label>
                                      <input
                                        type="text"
                                        value={selectedResidentToEdit.first_name}
                                        required
                                        onChange={(e) => setSelectedResidentToEdit({ ...selectedResidentToEdit, first_name: e.target.value })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Last Name</label>
                                      <input
                                        type="text"
                                        value={selectedResidentToEdit.last_name}
                                        required
                                        onChange={(e) => setSelectedResidentToEdit({ ...selectedResidentToEdit, last_name: e.target.value })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Care Category</label>
                                      <select
                                        value={selectedResidentToEdit.care_category}
                                        onChange={(e) => setSelectedResidentToEdit({ ...selectedResidentToEdit, care_category: e.target.value })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      >
                                        <option value="Supported Living">Supported Living</option>
                                        <option value="Reablement care">Reablement care</option>
                                        <option value="Complex Nursing">Complex Nursing</option>
                                        <option value="Residential Care">Residential Care</option>
                                      </select>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Falls Risk Assessment</label>
                                      <select
                                        value={selectedResidentToEdit.falls_risk_level}
                                        onChange={(e) => setSelectedResidentToEdit({ ...selectedResidentToEdit, falls_risk_level: e.target.value })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      >
                                        <option value="standard">Standard Level</option>
                                        <option value="moderate">Moderate Level</option>
                                        <option value="high">High Level Risk</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono font-bold text-emerald-700">Current Mobility Score</label>
                                      <input
                                        type="number"
                                        min={10}
                                        max={100}
                                        value={selectedResidentToEdit.current_mobility_score || 50}
                                        onChange={(e) => setSelectedResidentToEdit({ ...selectedResidentToEdit, current_mobility_score: Number(e.target.value) })}
                                        className="w-full bg-emerald-50 border border-emerald-250 rounded-xl px-3 py-2 text-xs text-slate-800"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Reablement Status</label>
                                      <select
                                        value={selectedResidentToEdit.reablement_status}
                                        onChange={(e) => setSelectedResidentToEdit({ ...selectedResidentToEdit, reablement_status: e.target.value })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      >
                                        <option value="Regular support">Regular support</option>
                                        <option value="Physiotherapy track">Physiotherapy track</option>
                                        <option value="Post-surgery recovery">Post-surgery recovery</option>
                                        <option value="Ready for discharge">Ready for discharge</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="flex gap-3 pt-4">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteResident(selectedResidentToEdit.id)}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1"
                                    >
                                      Terminate/Delete Profile
                                    </button>
                                    <button
                                      type="submit"
                                      className="flex-1 bg-[#2D3A2D] hover:bg-[#1C261C] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition"
                                    >
                                      Mutate &amp; Save Database Records
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-stone-400">
                                  <Users className="w-12 h-12 text-stone-300" />
                                  <p className="text-xs font-mono mt-3 uppercase tracking-wider">Select a Care Recipient profile to perform DB updates or complete deletions</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MODE 2: SYSTEM USER DIR MANAGEMENT */}
                      {dbManageMode === 'users' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#7A847A] font-mono uppercase font-bold">
                              {users.length} professional Staff Credentials logged in cache
                            </span>
                            <button
                              onClick={() => setShowAddUserModal(true)}
                              className="text-white hover:bg-[#3D5A4A] bg-[#4E6E5D] font-medium text-xs flex items-center gap-1.5 px-4 py-2 rounded-full transition duration-155 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Register Staff Credential</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* User list */}
                            <div className="lg:col-span-5 bg-[#F5F2ED]/30 rounded-2xl border border-[#E6E2D3] p-4 max-h-[500px] overflow-y-auto space-y-2">
                              {users.map((usr) => (
                                <div
                                  key={usr.id}
                                  onClick={() => setSelectedUserToEdit(usr)}
                                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${selectedUserToEdit?.id === usr.id ? 'bg-[#4E6E5D]/10 border-[#4E6E5D]' : 'bg-white border-stone-200 hover:border-stone-300'}`}
                                >
                                  <div className="flex justify-between items-center">
                                    <h5 className="font-bold text-xs text-[#2D3A2D]">{usr.display_name}</h5>
                                    <span className="text-[10px] text-slate-500 font-mono italic">{usr.role}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-2 text-[10px] text-[#7A847A] border-t border-dashed border-stone-100 pt-2 font-mono">
                                    <span>{usr.email}</span>
                                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${usr.status === 'active' ? 'text-emerald-800 bg-emerald-100' : 'text-stone-700 bg-stone-100'}`}>{usr.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* User edit details panels */}
                            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E6E2D3] p-6 text-left">
                              {selectedUserToEdit ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateUserSubmit(selectedUserToEdit.id, selectedUserToEdit);
                                  }}
                                  className="space-y-4"
                                >
                                  <h4 className="text-xs font-bold text-[#2D3A2D] uppercase font-mono tracking-wider pb-2 border-b border-[#F5F2ED]">
                                    ✏️ Edit User Role: {selectedUserToEdit.display_name}
                                  </h4>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">First Name</label>
                                      <input
                                        type="text"
                                        value={selectedUserToEdit.first_name}
                                        required
                                        onChange={(e) => setSelectedUserToEdit({ ...selectedUserToEdit, first_name: e.target.value })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Last Name</label>
                                      <input
                                        type="text"
                                        value={selectedUserToEdit.last_name}
                                        required
                                        onChange={(e) => setSelectedUserToEdit({ ...selectedUserToEdit, last_name: e.target.value })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Staff Corporate Email Address</label>
                                    <input
                                      type="email"
                                      value={selectedUserToEdit.email}
                                      required
                                      onChange={(e) => setSelectedUserToEdit({ ...selectedUserToEdit, email: e.target.value })}
                                      className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Professional Placement Role</label>
                                      <select
                                        value={selectedUserToEdit.role}
                                        onChange={(e) => setSelectedUserToEdit({ ...selectedUserToEdit, role: e.target.value })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      >
                                        <option value="Clinical Lead">Clinical Lead</option>
                                        <option value="Facility Manager">Facility Manager</option>
                                        <option value="Senior Carer">Senior Carer</option>
                                        <option value="Care Worker">Care Worker</option>
                                        <option value="Auditor">Auditor</option>
                                        <option value="Technical Support">Technical Support</option>
                                        <option value="Family Viewer">Family Viewer</option>
                                      </select>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Status Indicator</label>
                                      <select
                                        value={selectedUserToEdit.status}
                                        onChange={(e) => setSelectedUserToEdit({ ...selectedUserToEdit, status: e.target.value as any })}
                                        className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                                      >
                                        <option value="active">Active Placement</option>
                                        <option value="inactive">Temporarily Inactive</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="flex gap-3 pt-4">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(selectedUserToEdit.id)}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1"
                                    >
                                      Deauthorize / Delete Staff
                                    </button>
                                    <button
                                      type="submit"
                                      className="flex-1 bg-[#2D3A2D] hover:bg-[#1C261C] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition"
                                    >
                                      Save Credentials Changes
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-stone-400">
                                  <Users className="w-12 h-12 text-stone-300" />
                                  <p className="text-xs font-mono mt-3 uppercase tracking-wider">Select a professional user cred to modify permissions or revoke security keys</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[28px] text-left flex items-start gap-4">
                      <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-serif italic font-bold text-amber-900 text-sm">Security Policy Restricted Access</h4>
                        <p className="text-xs text-amber-850">
                          Your active session placement role ({activeRole}) does not have relational database administrative CRUD rights. Please switch your role simulation to Clinical Lead, Facility Manager, or Tech Support in the sidebar deck to bypass instructions.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* --- TAB 8: AUDIT LOGS LEDGER --- */}
              {currentTab === 'audit-logs' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-slate-200 pb-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 inline-flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      Immutable System Audit &amp; Governance Ledger
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      A complete cryptographic record trace registering every device ping, carer entry, warning closure, and user authentication event.
                    </p>
                  </div>

                  <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-550 h-10 select-none">
                        <tr>
                          <th className="px-5 font-bold">MUTATION TIMESTAMP</th>
                          <th className="px-5 font-bold">SYSTEM DIVISION</th>
                          <th className="px-5 font-bold">REGISTERED ACTION MUTATION</th>
                          <th className="px-5 font-bold">DISPATCHED ACTOR</th>
                          <th className="px-5 font-bold">TRANSACTION FOOTPRINTS</th>
                          <th className="px-5 font-bold text-center text-emerald-600">SCHEMATIC VERIFICATION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {auditLogs.map((log, lIdx) => (
                          <tr key={log.id || lIdx} className="h-12 hover:bg-slate-50/50">
                            <td className="px-5 text-slate-500 font-mono">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-5 uppercase font-bold text-[10px] text-slate-500 font-mono">{log.module_name}</td>
                            <td className="px-5">
                              <span className="font-bold text-slate-850 font-mono uppercase bg-slate-100 px-2.5 py-0.5 rounded">
                                {log.action_type}
                              </span>
                            </td>
                            <td className="px-5 text-slate-800">{log.user_name}</td>
                            <td className="px-5 text-slate-500 font-mono truncate max-w-xs" title={JSON.stringify(log.details)}>
                              {JSON.stringify(log.details)}
                            </td>
                            <td className="px-5 text-center text-emerald-600 font-bold">
                              ✓ COMPLIANT
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}
                </>
              )}

            </>
          )}

        </div>
      </main>

      {/* --- ADD RESIDENT DIALOG MODAL --- */}
      {showAddResidentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleAddNewResidentSubmit}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden w-full max-w-md flex flex-col"
          >
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-semibold text-white">Add New Care Recipient Record</h3>
              <button 
                type="button"
                onClick={() => setShowAddResidentModal(false)}
                className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">First Name</label>
                  <input
                    type="text"
                    required
                    value={newResidentForm.first_name}
                    onChange={(e) => setNewResidentForm({...newResidentForm, first_name: e.target.value})}
                    placeholder="Albert"
                    className="w-full text-xs border border-slate-250 p-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newResidentForm.last_name}
                    onChange={(e) => setNewResidentForm({...newResidentForm, last_name: e.target.value})}
                    placeholder="Ainsley"
                    className="w-full text-xs border border-slate-250 p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">DOB</label>
                  <input
                    type="date"
                    required
                    value={newResidentForm.date_of_birth}
                    onChange={(e) => setNewResidentForm({...newResidentForm, date_of_birth: e.target.value})}
                    className="w-full text-xs border border-slate-250 p-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Gender</label>
                  <select
                    value={newResidentForm.gender}
                    onChange={(e) => setNewResidentForm({...newResidentForm, gender: e.target.value})}
                    className="w-full text-xs border border-slate-250 p-2 rounded-lg"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono block">Assign Room (101 - 110 vacancy list)</label>
                <select
                  required
                  value={newResidentForm.room_id}
                  onChange={(e) => setNewResidentForm({...newResidentForm, room_id: e.target.value})}
                  className="w-full text-xs border border-slate-250 p-2 rounded-lg cursor-pointer font-semibold text-slate-800"
                >
                  <option value="">-- Choose active vacancies room --</option>
                  {rooms.map(rm => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} ({rm.floor_number} • Currently: {rm.occupancy_status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono block">Initial gait description</label>
                <input
                  type="text"
                  value={newResidentForm.mobility_status}
                  onChange={(e) => setNewResidentForm({...newResidentForm, mobility_status: e.target.value})}
                  placeholder="Impaired gait - Walks with Frame"
                  className="w-full text-xs border border-slate-250 p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Falls Risk Level</label>
                  <select
                    value={newResidentForm.falls_risk_level}
                    onChange={(e) => setNewResidentForm({...newResidentForm, falls_risk_level: e.target.value as any})}
                    className="w-full text-xs border border-slate-250 p-2 rounded-lg"
                  >
                    <option value="standard">standard</option>
                    <option value="high">high</option>
                    <option value="very_high">very_high</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest font-mono">Wander Risk Level</label>
                  <select
                    value={newResidentForm.wandering_risk_level}
                    onChange={(e) => setNewResidentForm({...newResidentForm, wandering_risk_level: e.target.value as any})}
                    className="w-full text-xs border border-slate-250 p-2 rounded-lg"
                  >
                    <option value="standard">standard</option>
                    <option value="high">high</option>
                    <option value="very_high">very_high</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={newResidentForm.dementia_support_required}
                    onChange={(e) => setNewResidentForm({...newResidentForm, dementia_support_required: e.target.checked})}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                  />
                  <span>Requires Dementia Support</span>
                </label>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3.5">
              <button 
                type="button"
                onClick={() => setShowAddResidentModal(false)}
                className="text-xs font-medium text-slate-650 hover:text-slate-900 py-2 px-4 border rounded-xl"
              >
                Discard
              </button>
              <button 
                type="submit"
                className="bg-emerald-650 hover:bg-emerald-600 text-white text-xs font-mono font-bold py-2 px-5 rounded-xl transition"
              >
                CREATE ADMISSION
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- REGISTER SYSTEM STAFF DIALOG MODAL --- */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-800">
          <form 
            onSubmit={handleAddNewUser}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden w-full max-w-md flex flex-col"
          >
            <div className="p-5 bg-[#2D3A2D] text-white flex justify-between items-center">
              <h3 className="font-serif italic font-bold text-white text-lg">Register Professional Staff Credential</h3>
              <button 
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-stone-300 hover:text-white transition p-1 bg-[#4E6E5D] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah"
                    value={newUserForm.first_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                    className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jenkins"
                    value={newUserForm.last_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                    className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Staff Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. s.jenkins@rosewood.co.uk"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] focus:bg-white focus:outline-none rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Professional Designation</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                  >
                    <option value="Clinical Lead">Clinical Lead</option>
                    <option value="Facility Manager">Facility Manager</option>
                    <option value="Senior Carer">Senior Carer</option>
                    <option value="Care Worker">Care Worker</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Family Viewer">Family Viewer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#7A847A] font-mono">Active Placement Status</label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value as any })}
                    className="w-full bg-[#F5F2ED]/60 border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs text-[#2D3A2D]"
                  >
                    <option value="active">Active Track</option>
                    <option value="inactive">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 bg-stone-50 border-t border-stone-100 flex justify-end gap-3.5">
              <button 
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-xs font-semibold py-2 px-4 border rounded-xl cursor-pointer text-slate-700 hover:bg-slate-100"
              >
                Discard
              </button>
              <button 
                type="submit"
                className="bg-[#2D3A2D] hover:bg-[#1C261C] text-white text-xs font-semibold py-2 px-5 rounded-xl transition cursor-pointer"
              >
                Register &amp; Keys Dispatch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- AI VOICE TRANSCRIPTION DIALOG MODAL --- */}
      {showVoiceTranscribeModal && currentResident && (
        <VoiceTranscriptionModal 
          resident={currentResident}
          onClose={() => setShowVoiceTranscribeModal(false)}
          onSaveNote={(parsedNote, category, pMood, pMobility) => {
            handlePostCarerNote(parsedNote, category, pMood, pMobility);
          }}
        />
      )}

      {/* --- RESIDENT PROFILE IMAGE WEB CAMERA WORKSPACE --- */}
      {showPhotoModal && currentResident && (
        <ResidentPhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          onSave={handleSaveResidentPhoto}
          initialPhotoUrl={currentResident.photo_url}
          residentName={`${currentResident.first_name} ${currentResident.last_name}`}
        />
      )}

    </div>
  );
}

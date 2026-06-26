import React from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  HeartPulse, 
  Cpu, 
  FileText, 
  Database, 
  ShieldCheck, 
  Compass,
  User as UserIcon,
  Home,
  LogOut,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  openAlertsCount: number;
  currentUser?: any;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  activeRole, 
  setActiveRole,
  openAlertsCount,
  currentUser,
  onLogout,
  isOpenMobile = false,
  onCloseMobile
}: SidebarProps) {
  const roles: UserRole[] = currentUser?.role 
    ? [currentUser.role] 
    : [
        'Clinical Lead',
        'Facility Manager',
        'Senior Carer',
        'Care Worker',
        'Technical Support',
        'Auditor',
        'Family Viewer'
      ];

  const getNavItemsForRole = (role: UserRole, alertsCount: number) => {
    switch (role) {
      case 'Facility Manager':
      case 'Super Admin':
      case 'Organisation Admin':
        return [
          { id: 'dashboard', name: 'Overview', icon: Home },
          { id: 'residents', name: 'Residents Database', icon: Users },
          { id: 'alerts', name: 'Alert Workflow', icon: AlertTriangle, badge: alertsCount > 0 ? alertsCount : undefined },
          { id: 'device-health', name: 'Device Health', icon: Cpu },
          { id: 'reports', name: 'Compliance Reports', icon: FileText },
          { id: 'database-dashboard', name: 'Database Monitor', icon: Database },
          { id: 'audit-logs', name: 'Audit Logs', icon: ShieldCheck }
        ];
      case 'Clinical Lead':
        return [
          { id: 'dashboard', name: 'Overview', icon: Home },
          { id: 'residents', name: 'Residents Database', icon: Users },
          { id: 'alerts', name: 'Alert Workflow', icon: AlertTriangle, badge: alertsCount > 0 ? alertsCount : undefined },
          { id: 'reports', name: 'Compliance Reports', icon: FileText }
        ];
      case 'Senior Carer':
        return [
          { id: 'dashboard', name: 'Overview', icon: Home },
          { id: 'residents', name: 'Residents Database', icon: Users },
          { id: 'alerts', name: 'Alert Workflow', icon: AlertTriangle, badge: alertsCount > 0 ? alertsCount : undefined },
          { id: 'reports', name: 'Compliance Reports', icon: FileText }
        ];
      case 'Care Worker':
        return [
          { id: 'dashboard', name: 'Overview', icon: Home },
          { id: 'residents', name: 'Residents Database', icon: Users },
          { id: 'alerts', name: 'Alert Workflow', icon: AlertTriangle, badge: alertsCount > 0 ? alertsCount : undefined }
        ];
      case 'Technical Support':
        return [
          { id: 'dashboard', name: 'Overview', icon: Home },
          { id: 'device-health', name: 'Device Health', icon: Cpu },
          { id: 'database-dashboard', name: 'Database Monitor', icon: Database },
          { id: 'audit-logs', name: 'Audit Logs', icon: ShieldCheck }
        ];
      case 'Auditor':
        return [
          { id: 'dashboard', name: 'Overview', icon: Home },
          { id: 'reports', name: 'Compliance Reports', icon: FileText },
          { id: 'audit-logs', name: 'Audit Logs', icon: ShieldCheck }
        ];
      case 'Family Viewer':
        return [
          { id: 'client-dashboard', name: 'Family Assurance', icon: HeartPulse }
        ];
      default:
        return [
          { id: 'dashboard', name: 'Overview', icon: Home }
        ];
    }
  };

  const mainNavItems = getNavItemsForRole(activeRole, openAlertsCount);

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity cursor-pointer duration-300"
        />
      )}

      <aside 
        id="sidebar-container" 
        className={`fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 w-72 bg-[#232F23] text-stone-100 flex flex-col border-r border-[#0A2A22] transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#0A2A22] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#4E6E5D] text-white p-2 rounded-xl font-serif text-xl font-bold tracking-tight shadow-md w-11 h-11 flex items-center justify-center">
              H
            </div>
            <div className="text-left">
              <h1 className="text-xl font-serif font-semibold tracking-tight text-white leading-none">HAKILIX</h1>
              <p className="text-[10px] uppercase text-[#A3B18A] tracking-wider mt-1 font-semibold select-none">Ambient Sensing Hub</p>
            </div>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-[#1C261C] hover:bg-[#0A2A22] text-[#A3B18A] hover:text-white transition cursor-pointer"
              title="Close Navigation Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Role Profile Switcher */}
        <div className="px-5 py-4 border-b border-[#0A2A22] bg-[#1C261C]">
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="w-3.5 h-3.5 text-[#A3B18A]" />
            <span className="text-[10px] text-[#7A847A] uppercase tracking-widest font-semibold">Terminal Practitioner Role</span>
          </div>
          <select
            id="role-selector"
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            disabled={roles.length <= 1}
            className="w-full bg-[#232F23] border border-[#0A2A22] text-stone-200 text-xs rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-[#A3B18A] font-sans disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="mt-2 text-[10px] text-[#7A847A] flex items-center gap-1.5 text-left">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3B18A] animate-pulse"></span>
            <span>Access Level: <strong className="text-stone-300 font-semibold">{activeRole}</strong></span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <span className="px-3 text-[10px] text-[#7A847A] uppercase tracking-widest font-semibold block mb-2 select-none text-left">Control Panels</span>
          {mainNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all focus:outline-none ${
                  isActive 
                    ? 'bg-[#4E6E5D]/20 text-white border-l-4 border-[#A3B18A] font-semibold' 
                    : 'text-stone-300 hover:bg-[#0A2A22]/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#A3B18A]' : 'text-[#7A847A]'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-[#D98E73] text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Meta & Active Authorized User Identity */}
        <div className="p-5 border-t border-[#0A2A22] bg-[#1C261C] space-y-3">
          {currentUser && (
            <div className="flex flex-col space-y-1 text-left">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#A3B18A] font-mono">AUTHORIZED SESSION</span>
              <div className="text-xs font-bold text-white truncate">{currentUser.display_name}</div>
              <div className="text-[10px] text-[#7A847A] truncate font-mono select-all">{currentUser.email}</div>
            </div>
          )}

          <div className="text-[10px] text-[#7A847A] uppercase tracking-wider font-semibold space-y-1 font-mono text-left">
            <div>Sensors: Active Radar Node</div>
            <div>Station: Rosewood Green-04</div>
            <div>Sync: DB Cache Active</div>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full mt-2 bg-red-950/40 hover:bg-red-900/40 text-red-300 font-bold text-xxs tracking-wider uppercase py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-red-900/30 font-mono"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Secure Log Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

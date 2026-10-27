'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { signInWithGoogle, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle, 
  Settings, 
  FileSpreadsheet, 
  Bell, 
  Zap, 
  ChevronDown, 
  X, 
  Menu,
  Sparkles,
  Info
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const {
    currentUser,
    setCurrentUserRole,
    unreadNotifsCount,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    runDailyMaturityCheck,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cronToast, setCronToast] = useState<string | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const rolesConfig: { role: UserRole; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    {
      role: 'institution',
      title: 'Institution User (College)',
      subtitle: 'Submit FDRs, manage renewals & request releases',
      icon: Building2,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      role: 'scrutiny_officer',
      title: 'Scrutiny Officer (AICTE)',
      subtitle: 'Verify deposits, run rule-checks & flag discrepancies',
      icon: ShieldCheck,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      role: 'approving_authority',
      title: 'Approving Authority (AICTE)',
      subtitle: 'Sanction release requests & review high-level reports',
      icon: CheckCircle,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      role: 'admin',
      title: 'System Administrator',
      subtitle: 'Configure milestone rules, master banks & accounts',
      icon: Settings,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      role: 'auditor',
      title: 'Statutory Auditor (CAG)',
      subtitle: 'Read-only access to tamper-proof audit trails',
      icon: FileSpreadsheet,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  const currentRoleConfig = rolesConfig.find((r) => r.role === currentUser.role) || rolesConfig[1];

  const handleCronRun = () => {
    const res = runDailyMaturityCheck();
    setCronToast(`Scheduler completed: ${res.updatedCount} FDR statuses refreshed, ${res.notificationsCreated} reminders triggered.`);
    setTimeout(() => setCronToast(null), 4500);
  };

  const handleGoogleAuth = async () => {
    if (isSupabaseConfigured()) {
      await signInWithGoogle();
    } else {
      setShowSupabaseModal(true);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard' },
    { id: 'repository', label: 'FDR Deposit Repository' },
    { id: 'releases', label: 'Release & Refund Center' },
    { id: 'audit', label: 'Immutable Audit Trail' },
    ...(currentUser.role === 'admin' ? [{ id: 'settings', label: 'System Configuration' }] : []),
  ];

  return (
    <>
      <header className="border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-40 text-slate-100 shadow-xl transition-all">
        {/* National Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 py-1 px-4 text-xs font-semibold text-white tracking-wide flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0">
              Govt. of India
            </span>
            <span className="truncate">All India Council for Technical Education • Ministry of Education</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-[11px] shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              CBS Bank Link: Online
            </span>
            <span>|</span>
            <span className="text-slate-200">SIH 2026</span>
          </div>
        </div>

        {/* Main Nav Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Logo & Portal Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer group select-none"
            onClick={() => {
              setActiveTab('dashboard');
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl border border-orange-400/30 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  AICTE FDR PORTAL
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  Security Deposits
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-md">
                Centralized Fixed Deposit Verification, Reconciliation &amp; Refund Management
              </p>
            </div>
          </div>

          {/* Desktop Right Side Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Daily Cron Runner Simulation Button */}
            <button
              onClick={handleCronRun}
              title="Simulate daily scheduled cron job (Feature 4): evaluates maturity thresholds and dispatches alerts"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all shadow-sm cursor-pointer group min-h-[38px]"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-125 transition-transform" />
              <span>Simulate Daily Cron</span>
            </button>

            {/* Google / Supabase Sign In Button */}
            <button
              onClick={handleGoogleAuth}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all shadow-sm cursor-pointer min-h-[38px]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{mounted && isSupabaseConfigured() ? 'Supabase Connected' : 'Google Auth'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifsOpen(!isNotifsOpen)}
                className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Notifications & Escalation Alerts"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border-2 border-slate-950 shadow-[0_0_8px_#f43f5e] animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {isNotifsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden animate-scaleUp">
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-400" />
                      <span className="font-bold text-sm text-white">Notifications</span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={() => setIsNotifsOpen(false)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No active notifications</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-800/50 transition-colors ${
                            !n.is_read ? 'bg-slate-800/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`font-semibold ${
                                n.type === 'alert'
                                  ? 'text-rose-400'
                                  : n.type === 'warning'
                                  ? 'text-amber-400'
                                  : n.type === 'success'
                                  ? 'text-emerald-400'
                                  : 'text-blue-400'
                              }`}
                            >
                              {n.title}
                            </span>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1 shadow-[0_0_6px_#f97316]" />}
                          </div>
                          <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher for Hackathon / SIH Demo */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm min-h-[38px] ${currentRoleConfig.color}`}
              >
                <currentRoleConfig.icon className="w-3.5 h-3.5" />
                <span>{currentRoleConfig.title.split(' ')[0]} View</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-scaleUp">
                  <div className="px-3 py-2 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Live RBAC Switcher</span>
                    <Sparkles className="w-3 h-3 text-orange-400" />
                  </div>
                  <div className="space-y-1 mt-1">
                    {rolesConfig.map((item) => {
                      const Icon = item.icon;
                      const isSelected = item.role === currentUser.role;
                      return (
                        <button
                          key={item.role}
                          onClick={() => {
                            setCurrentUserRole(item.role);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-850'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${item.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                              {item.title}
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Controls: Bell + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsNotifsOpen(!isNotifsOpen)}
              className="relative p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 w-2 h-2 rounded-full shadow-[0_0_6px_#f43f5e]" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs Bar */}
        <div className="hidden lg:block border-t border-slate-850 bg-slate-950/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto">
              {navItems.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/30 shadow-sm shadow-orange-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Current Logged-in User Profile Badge */}
            <div className="flex items-center gap-2.5 text-xs text-slate-400 py-1">
              {currentUser.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-orange-400">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <span className="font-semibold text-slate-200 max-w-[180px] truncate">{currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-4 animate-scaleUp">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block px-2 pb-1">
                Navigation
              </span>
              {navItems.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors min-h-[44px] cursor-pointer ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                  </button>
                );
              })}
            </div>

            {/* Mobile Role Switcher */}
            <div className="pt-2 border-t border-slate-850">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block px-2 pb-2">
                Active Perspective (RBAC Role)
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {rolesConfig.map((item) => {
                  const Icon = item.icon;
                  const isSelected = item.role === currentUser.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        setCurrentUserRole(item.role);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors min-h-[44px] cursor-pointer ${
                        isSelected ? 'bg-slate-850 border border-slate-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-orange-400" />
                        <span>{item.title}</span>
                      </div>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
              <button
                onClick={() => {
                  handleCronRun();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Simulate Daily Cron</span>
              </button>

              <button
                onClick={() => {
                  handleGoogleAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
              >
                <span>Google Auth / Supabase</span>
              </button>
            </div>
          </div>
        )}

        {/* Cron Toast Bar */}
        {cronToast && (
          <div className="bg-emerald-600/90 text-white text-xs py-2 px-4 text-center font-medium shadow flex items-center justify-center gap-2 animate-fadeIn">
            <Zap className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="truncate">{cronToast}</span>
          </div>
        )}
      </header>

      {/* Supabase / Google Auth Info Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-slate-200 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Supabase &amp; Google Auth</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Your portal is pre-configured with Supabase credentials and OAuth redirect routes.
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-amber-300 mb-4 space-y-1">
              <div>Project: xesaybaickipmcurlslb</div>
              <div>OAuth Redirect: /auth/callback</div>
            </div>
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

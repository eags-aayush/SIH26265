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
  ExternalLink,
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
  const [cronToast, setCronToast] = useState<string | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const rolesConfig: { role: UserRole; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      role: 'institution',
      title: 'Institution User (College)',
      subtitle: 'Submit FDRs, manage renewals & request releases',
      icon: Building2,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      role: 'scrutiny_officer',
      title: 'Scrutiny Officer (AICTE)',
      subtitle: 'Verify deposits, run rule-checks & flag discrepancies',
      icon: ShieldCheck,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      role: 'approving_authority',
      title: 'Approving Authority (AICTE)',
      subtitle: 'Sanction release requests & review high-level reports',
      icon: CheckCircle,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      role: 'admin',
      title: 'System Administrator',
      subtitle: 'Configure milestone rules, master banks & accounts',
      icon: Settings,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      role: 'auditor',
      title: 'Statutory Auditor (CAG)',
      subtitle: 'Read-only access to tamper-proof audit trails',
      icon: FileSpreadsheet,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
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

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40 text-slate-100 shadow-md">
        {/* National Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 py-1 px-4 text-xs font-semibold text-white tracking-wide flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              Govt. of India
            </span>
            <span>All India Council for Technical Education (AICTE) • Statutory Body under Ministry of Education</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              CBS Bank Link: Online
            </span>
            <span>|</span>
            <span>Version 2.0 (SIH)</span>
          </div>
        </div>

        {/* Main Nav Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl border border-orange-400/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  AICTE FDR PORTAL
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  Security Deposit Management
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Centralized Fixed Deposit Tracking, Automated Verification &amp; Release System
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Daily Cron Runner Simulation Button */}
            <button
              onClick={handleCronRun}
              title="Simulate daily scheduled cron job (Feature 4): evaluates maturity thresholds (90, 60, 30, 15, 7 days) and dispatches alerts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all shadow-sm group"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Simulate Daily Cron</span>
            </button>

            {/* Google / Supabase Sign In Button */}
            <button
              onClick={handleGoogleAuth}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
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
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Notifications & Escalation Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-slate-900 animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {isNotifsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-850">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-400" />
                      <span className="font-semibold text-sm text-white">Notifications</span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-400 hover:text-white transition-colors"
                      >
                        Mark all read
                      </button>
                      <button onClick={() => setIsNotifsOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No active notifications</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
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
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1" />}
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${currentRoleConfig.color}`}
              >
                <currentRoleConfig.icon className="w-3.5 h-3.5" />
                <span className="font-semibold">{currentRoleConfig.title.split(' ')[0]} View</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Switch RBAC Role (Live Demo)</span>
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
                          className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-colors ${
                            isSelected ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/60'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md ${item.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                              {item.title}
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
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
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-slate-800/80 bg-slate-950/70 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <nav className="flex space-x-1 sm:space-x-4 py-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Executive Dashboard
              </button>
              <button
                onClick={() => setActiveTab('repository')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'repository'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                FDR Deposit Repository
              </button>
              <button
                onClick={() => setActiveTab('releases')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'releases'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Release &amp; Refund Center
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'audit'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Immutable Audit Trail
              </button>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  System Configuration
                </button>
              )}
            </nav>

            {/* Current Logged-in User Profile Pill */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Logged in as:</span>
              <span className="font-semibold text-slate-200">{currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Cron Toast Bar */}
        {cronToast && (
          <div className="bg-emerald-600/90 text-white text-xs py-2 px-4 text-center font-medium shadow flex items-center justify-center gap-2 animate-fadeIn">
            <Zap className="w-4 h-4 text-emerald-200" />
            <span>{cronToast}</span>
          </div>
        )}
      </header>

      {/* Supabase / Google Auth Info Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Supabase &amp; Google Auth Setup</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              The project is pre-configured to connect directly to Supabase with Google Authentication!
              Complete schema scripts and seed data are generated in:
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 mb-4 space-y-1">
              <div>1. Run: supabase/schema.sql</div>
              <div>2. Run: supabase/seed.sql</div>
              <div>3. Configure: .env.local with your keys</div>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Meanwhile, the portal is running in <strong>Interactive Demo Mode</strong> with instant role-switching,
              mock bank verification adapters, and audit trails enabled.
            </p>
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors"
            >
              Got it, continue testing
            </button>
          </div>
        </div>
      )}
    </>
  );
}

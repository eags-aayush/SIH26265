'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from './StatusBadge';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Lock, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  onSelectInstrument: (id: string) => void;
  onOpenNewFdrModal: () => void;
  setActiveTab: (tab: string) => void;
}

export function DashboardView({ onSelectInstrument, onOpenNewFdrModal, setActiveTab }: DashboardViewProps) {
  const { filteredInstruments, currentUser } = useApp();

  // Metrics Calculations
  const totalAmount = filteredInstruments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const activeFDRs = filteredInstruments.filter((i) => i.status === 'Active' || i.status === 'Verified');
  const expiringSoonFDRs = filteredInstruments.filter((i) => i.status === 'Expiring Soon' || (i.days_until_maturity <= 30 && i.days_until_maturity > 0));
  const flaggedDiscrepancies = filteredInstruments.filter((i) => i.status === 'Discrepancy Flagged' || i.discrepancies.some((d) => d.status === 'open'));
  const pendingReleases = filteredInstruments.filter((i) => i.status === 'Release Requested');

  // Bank-confirmed vs Institution-submitted verification ratio
  const bankConfirmedCount = filteredInstruments.filter((i) => i.fdr_number_source === 'Bank-confirmed').length;
  const verificationRatio = filteredInstruments.length > 0 ? Math.round((bankConfirmedCount / filteredInstruments.length) * 100) : 0;

  // Bank Breakdown
  const bankGroups: { [key: string]: { count: number; total: number } } = {};
  filteredInstruments.forEach((i) => {
    if (!bankGroups[i.bank_name]) {
      bankGroups[i.bank_name] = { count: 0, total: 0 };
    }
    bankGroups[i.bank_name].count += 1;
    bankGroups[i.bank_name].total += i.amount;
  });

  const topBanks = Object.entries(bankGroups).sort((a, b) => b[1].total - a[1].total);

  // Maturity Horizons Breakdown
  const horizon30 = filteredInstruments.filter((i) => i.days_until_maturity > 0 && i.days_until_maturity <= 30).length;
  const horizon60 = filteredInstruments.filter((i) => i.days_until_maturity > 30 && i.days_until_maturity <= 60).length;
  const horizon90 = filteredInstruments.filter((i) => i.days_until_maturity > 60 && i.days_until_maturity <= 90).length;
  const horizonLong = filteredInstruments.filter((i) => i.days_until_maturity > 90).length;
  const maturedCount = filteredInstruments.filter((i) => i.days_until_maturity <= 0 && i.status !== 'Released').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Modern Hero & Role Context Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                {currentUser.role.replace('_', ' ')} Workspace
              </span>
              <span className="text-xs text-slate-400 font-medium">• Centralized Monitoring Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              AICTE Security Deposit &amp; FDR Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Automated reconciliation of institutional fixed deposit collateral, dual-source CBS lien validation,
              and multi-tier statutory clearance registry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {(currentUser.role === 'institution' || currentUser.role === 'admin') && (
              <button
                onClick={onOpenNewFdrModal}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs transition-all shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Building2 className="w-4 h-4" />
                <span>Submit New FDR</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('repository')}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <span>Explore Directory</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Monitored Deposits */}
        <div className="glass-card rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Value Monitored</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono tracking-tight">
            ₹{(totalAmount / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">₹{(totalAmount / 100000).toFixed(1)}L</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{filteredInstruments.length} Deposits</span>
          </div>
        </div>

        {/* Active & Verified */}
        <div className="glass-card rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active &amp; Secured</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono tracking-tight">
            {activeFDRs.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5">
            Valid institutional collateral in force
          </div>
        </div>

        {/* Expiring Soon (< 30 days) */}
        <div className="glass-card rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-orange-500/40">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Expiring (&le;30 Days)</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-400 mt-2 font-mono tracking-tight">
            {expiringSoonFDRs.length}
          </div>
          <div className="text-[11px] text-orange-300/80 mt-1.5">
            Automated alerts dispatched
          </div>
        </div>

        {/* Flagged Discrepancies */}
        <div className="glass-card rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/40">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Discrepancies Flagged</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2 font-mono tracking-tight">
            {flaggedDiscrepancies.length}
          </div>
          <div className="text-[11px] text-rose-300/80 mt-1.5">
            Rule or date mismatches
          </div>
        </div>

        {/* Pending Releases */}
        <div className="glass-card rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/40">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Pending Release</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2 font-mono tracking-tight">
            {pendingReleases.length}
          </div>
          <div className="text-[11px] text-cyan-300/80 mt-1.5">
            Clearance workflow active
          </div>
        </div>
      </div>

      {/* Signature Measurable Accuracy Bar */}
      <div className="glass-panel rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Bank-Confirmed Accuracy Index (CBS Ledger Reconciliation)
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Measures percentage of records verified directly against banking CBS ledgers vs self-declared college inputs.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-emerald-400 font-mono">{verificationRatio}%</div>
              <div className="text-[11px] text-slate-400">
                {bankConfirmedCount} of {filteredInstruments.length} FDRs Bank-Confirmed
              </div>
            </div>
            <div className="w-36 sm:w-56 bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_#10b981]"
                style={{ width: `${verificationRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Maturity Horizons, Bank Portfolio & Action Register */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maturity Forecast Horizons */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Maturity Horizon Breakdown</h3>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-mono text-slate-400">
              Daily Cron
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                  Matured / Overdue (&le; 0 days)
                </span>
                <span className="font-bold text-rose-400 font-mono">{maturedCount} FDRs</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${filteredInstruments.length ? (maturedCount / filteredInstruments.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
                  Expiring in &le; 30 Days (Critical)
                </span>
                <span className="font-bold text-orange-400 font-mono">{horizon30} FDRs</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full"
                  style={{ width: `${filteredInstruments.length ? (horizon30 / filteredInstruments.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Expiring in 31 - 60 Days
                </span>
                <span className="font-bold text-amber-300 font-mono">{horizon60} FDRs</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${filteredInstruments.length ? (horizon60 / filteredInstruments.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Expiring in 61 - 90 Days
                </span>
                <span className="font-bold text-blue-300 font-mono">{horizon90} FDRs</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full"
                  style={{ width: `${filteredInstruments.length ? (horizon90 / filteredInstruments.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  Safe Horizon (&gt; 90 Days)
                </span>
                <span className="font-bold text-emerald-400 font-mono">{horizonLong} FDRs</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full"
                  style={{ width: `${filteredInstruments.length ? (horizonLong / filteredInstruments.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Exposure Distribution */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Bank Portfolio Exposure</h3>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-mono text-slate-400">
              {topBanks.length} Banks
            </span>
          </div>

          <div className="space-y-3.5">
            {topBanks.slice(0, 5).map(([bank, data]) => {
              const pct = totalAmount > 0 ? (data.total / totalAmount) * 100 : 0;
              return (
                <div key={bank} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-semibold truncate max-w-[150px]">{bank}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ₹{(data.total / 100000).toFixed(1)}L ({data.count} FDRs)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Queue */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Action Required Today</h3>
              </div>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase">
                High Priority
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredInstruments
                .filter((i) => i.status === 'Submitted' || i.status === 'Discrepancy Flagged' || i.status === 'Expiring Soon')
                .slice(0, 3)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectInstrument(item.id)}
                    className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white font-mono group-hover:text-orange-400 transition-colors">
                        {item.fdr_number}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1.5 truncate">
                      {item.institution_name} • <span className="font-mono text-slate-300">₹{(item.amount / 100000).toFixed(1)}L</span>
                    </div>
                  </div>
                ))}

              {filteredInstruments.filter((i) => i.status === 'Submitted' || i.status === 'Discrepancy Flagged' || i.status === 'Expiring Soon').length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  All active cases are in compliance! No urgent actions pending.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('repository')}
            className="w-full mt-4 py-2.5 text-center text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors border-t border-slate-800 pt-3 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open Complete Action Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from './StatusBadge';
import { SourceBadge } from './SourceBadge';
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
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  onSelectInstrument: (id: string) => void;
  onOpenNewFdrModal: () => void;
  setActiveTab: (tab: string) => void;
}

export function DashboardView({ onSelectInstrument, onOpenNewFdrModal, setActiveTab }: DashboardViewProps) {
  const { filteredInstruments, currentUser, runDailyMaturityCheck } = useApp();

  // Metrics Calculations
  const totalAmount = filteredInstruments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const activeFDRs = filteredInstruments.filter((i) => i.status === 'Active' || i.status === 'Verified');
  const expiringSoonFDRs = filteredInstruments.filter((i) => i.status === 'Expiring Soon' || (i.days_until_maturity <= 30 && i.days_until_maturity > 0));
  const flaggedDiscrepancies = filteredInstruments.filter((i) => i.status === 'Discrepancy Flagged' || i.discrepancies.some((d) => d.status === 'open'));
  const pendingReleases = filteredInstruments.filter((i) => i.status === 'Release Requested');

  // Measurable Improvement metric (Section 13 in Guide):
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
    <div className="space-y-6">
      {/* Welcome & Role Context Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                {currentUser.role.replace('_', ' ')} Workbench
              </span>
              <span className="text-xs text-slate-400">• Operational Overview</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AICTE Security Deposit Central Monitoring
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Automated reconciliation of Fixed Deposit Receipts (FDRs), bank-confirmed lien validation,
              and lifecycle tracking across Indian technical institutes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(currentUser.role === 'institution' || currentUser.role === 'admin') && (
              <button
                onClick={onOpenNewFdrModal}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Submit New FDR</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('repository')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-2"
            >
              <span>Explore All FDRs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Monitored Deposits */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Value Monitored</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            ₹{(totalAmount / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>₹{(totalAmount / 100000).toFixed(1)} Lakhs</span>
            <span>•</span>
            <span className="text-emerald-400">{filteredInstruments.length} Instruments</span>
          </div>
        </div>

        {/* Active & Verified */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active &amp; Verified</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {activeFDRs.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Valid AICTE collateral in force
          </div>
        </div>

        {/* Expiring Soon (< 30 days) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Expiring Soon (&lt;30d)</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-orange-400 mt-2">
            {expiringSoonFDRs.length}
          </div>
          <div className="text-[11px] text-orange-300/80 mt-1">
            Automated alerts dispatched
          </div>
        </div>

        {/* Flagged Discrepancies */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Discrepancies Flagged</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-2">
            {flaggedDiscrepancies.length}
          </div>
          <div className="text-[11px] text-rose-300/80 mt-1">
            Rule or date mismatches
          </div>
        </div>

        {/* Pending Releases */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Release</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-2">
            {pendingReleases.length}
          </div>
          <div className="text-[11px] text-cyan-300/80 mt-1">
            Clearance workflow active
          </div>
        </div>
      </div>

      {/* Signature Measurable Improvement Bar (Section 13 from Guide) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Bank-Confirmed Accuracy Index (CBS Reconciliation)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Measures percentage of records verified directly against banking CBS ledgers vs self-declared college inputs.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xl font-extrabold text-emerald-400">{verificationRatio}%</div>
              <div className="text-[11px] text-slate-400">
                {bankConfirmedCount} of {filteredInstruments.length} FDRs Bank-Confirmed
              </div>
            </div>
            <div className="w-48 bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${verificationRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Maturity Horizons & Bank Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maturity Forecast Horizons */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Maturity Horizon Breakdown</h3>
            </div>
            <span className="text-[11px] text-slate-400">Automated Cron</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Matured / Overdue (&le; 0 days)
                </span>
                <span className="font-semibold text-rose-400">{maturedCount} FDRs</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${filteredInstruments.length ? (maturedCount / filteredInstruments.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Expiring in &le; 30 Days (Critical)
                </span>
                <span className="font-semibold text-orange-400">{horizon30} FDRs</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
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
                <span className="font-semibold text-amber-300">{horizon60} FDRs</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
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
                <span className="font-semibold text-blue-300">{horizon90} FDRs</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full"
                  style={{ width: `${filteredInstruments.length ? (horizon90 / filteredInstruments.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Safe Horizon (&gt; 90 Days)
                </span>
                <span className="font-semibold text-emerald-400">{horizonLong} FDRs</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full"
                  style={{ width: `${filteredInstruments.length ? (horizonLong / filteredInstruments.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Exposure Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Bank Portfolio Exposure</h3>
            </div>
            <span className="text-[11px] text-slate-400">{topBanks.length} Banks</span>
          </div>

          <div className="space-y-3">
            {topBanks.slice(0, 5).map(([bank, data]) => {
              const pct = totalAmount > 0 ? (data.total / totalAmount) * 100 : 0;
              return (
                <div key={bank}>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-medium truncate max-w-[160px]">{bank}</span>
                    <span className="text-slate-400">
                      ₹{(data.total / 100000).toFixed(1)}L ({data.count} FDRs)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Priority Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Action Required Today</h3>
              </div>
              <span className="text-[11px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-medium">
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
                    className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{item.fdr_number}</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      {item.institution_name} • ₹{(item.amount / 100000).toFixed(1)}L
                    </div>
                  </div>
                ))}

              {filteredInstruments.filter((i) => i.status === 'Submitted' || i.status === 'Discrepancy Flagged' || i.status === 'Expiring Soon').length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  All active cases are in compliance! No urgent actions pending.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('repository')}
            className="w-full mt-4 py-2 text-center text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors border-t border-slate-800 pt-3"
          >
            View Complete Action Register &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

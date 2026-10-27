'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from './StatusBadge';
import { Lock, Eye } from 'lucide-react';

interface ReleasesViewProps {
  onOpenReleaseModal: (instrumentId: string) => void;
}

export function ReleasesView({ onOpenReleaseModal }: ReleasesViewProps) {
  const { filteredInstruments } = useApp();

  const releaseItems = filteredInstruments.filter(
    (i) => i.status === 'Release Requested' || i.status === 'Released' || i.release_request !== undefined
  );

  const pendingCount = filteredInstruments.filter((i) => i.status === 'Release Requested').length;
  const releasedCount = filteredInstruments.filter((i) => i.status === 'Released').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase tracking-wider font-extrabold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Clearance &amp; Refund Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Deposit Release &amp; Refund Clearinghouse
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Track multi-stage clearance workflows for completed lock-ins, institutional closures, and refunded liens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative z-10">
          <div className="flex-1 sm:flex-none glass-card border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-h-[44px] flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Pending Scrutiny/Approval</span>
            <span className="text-base font-black text-cyan-400 font-mono">{pendingCount} Cases</span>
          </div>
          <div className="flex-1 sm:flex-none glass-card border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-h-[44px] flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Fully Released</span>
            <span className="text-base font-black text-emerald-400 font-mono">{releasedCount} Cases</span>
          </div>
        </div>
      </div>

      {/* Release List */}
      <div className="glass-panel border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between bg-slate-950/60">
          <span>Active Release Case Queue</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Sorted by submission urgency
          </span>
        </div>

        <div className="divide-y divide-slate-800/70">
          {releaseItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No release requests active. Institutions can initiate a release request from the FDR detail view.
            </div>
          ) : (
            releaseItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-slate-850/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-extrabold text-white text-base font-mono">{item.fdr_number}</span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-300 font-semibold">
                    {item.institution_name} • <span className="text-slate-400 font-normal">{item.bank_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Refund Amount: <strong className="text-emerald-400 font-mono">₹{item.amount.toLocaleString('en-IN')}</strong> • AICTE ID: <span className="font-mono text-slate-300">{item.institution_aicte_id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {item.release_request && (
                    <span className="text-xs text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-500/30 font-semibold">
                      Step: {item.release_request.status.replace('_', ' ')}
                    </span>
                  )}
                  <button
                    onClick={() => onOpenReleaseModal(item.id)}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20 cursor-pointer min-h-[44px]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Inspect Clearance Workflow</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

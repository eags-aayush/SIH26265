'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from './StatusBadge';
import { Lock, CheckCircle2, Clock, ArrowRight, Eye } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              Clearance &amp; Refund Management
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Deposit Release &amp; Refund Clearinghouse
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Track multi-stage clearance workflows for completed lock-ins, institutional closures, and refunded liens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pending Scrutiny/Approval</span>
            <span className="text-base font-bold text-cyan-400">{pendingCount} Cases</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fully Released</span>
            <span className="text-base font-bold text-emerald-400">{releasedCount} Cases</span>
          </div>
        </div>
      </div>

      {/* Release List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
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
                className="p-4 hover:bg-slate-850/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white text-sm font-mono">{item.fdr_number}</span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {item.institution_name} • <span className="text-slate-400">{item.bank_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Refund Amount: <strong className="text-emerald-400">₹{item.amount.toLocaleString('en-IN')}</strong> • AICTE ID: {item.institution_aicte_id}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.release_request && (
                    <span className="text-xs text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-500/30">
                      Step: {item.release_request.status.replace('_', ' ')}
                    </span>
                  )}
                  <button
                    onClick={() => onOpenReleaseModal(item.id)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
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

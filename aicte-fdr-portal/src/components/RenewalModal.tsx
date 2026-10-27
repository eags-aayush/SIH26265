'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, RotateCw, ArrowRight } from 'lucide-react';

interface RenewalModalProps {
  instrumentId: string | null;
  onClose: () => void;
  onSuccess: (newInstrumentId: string) => void;
}

export function RenewalModal({ instrumentId, onClose, onSuccess }: RenewalModalProps) {
  const { instruments, submitRenewalFdr } = useApp();

  const oldFdr = instruments.find((i) => i.id === instrumentId);

  const [newFdrNumber, setNewFdrNumber] = useState(oldFdr ? `${oldFdr.fdr_number}-R1` : '');
  const [newMaturityDate, setNewMaturityDate] = useState('2029-06-30');
  const [newAmount, setNewAmount] = useState(oldFdr ? String(oldFdr.amount) : '3500000');
  const [renewalRemarks, setRenewalRemarks] = useState('');

  if (!oldFdr || !instrumentId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = submitRenewalFdr(instrumentId, {
      fdr_number: newFdrNumber,
      maturity_date: newMaturityDate,
      amount: Number(newAmount),
      remarks: renewalRemarks,
    });

    if (res.success && res.newInstrument) {
      onSuccess(res.newInstrument.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel border border-slate-700/80 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Submit FDR Renewal / Replacement</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Link new deposit instrument to replace maturing receipt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700/90 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close renewal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Predecessor Strip */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Predecessor FDR:</span>
              <strong className="text-white font-mono text-sm">{oldFdr.fdr_number}</strong>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {oldFdr.bank_name} • ₹{oldFdr.amount.toLocaleString('en-IN')}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Maturity Status:</span>
              <span className="text-orange-400 font-bold">{oldFdr.status}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Renewed FDR Number <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={newFdrNumber}
              onChange={(e) => setNewFdrNumber(e.target.value)}
              required
              aria-label="New Renewed FDR Number"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono min-h-[44px] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Deposit Amount (INR ₹) <span className="text-orange-500">*</span>
              </label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                aria-label="New Deposit Amount"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[44px] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Extended Maturity Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                value={newMaturityDate}
                onChange={(e) => setNewMaturityDate(e.target.value)}
                required
                aria-label="New Extended Maturity Date"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[44px] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Renewal Remarks / Bank Advice Note
            </label>
            <textarea
              value={renewalRemarks}
              onChange={(e) => setRenewalRemarks(e.target.value)}
              placeholder="e.g. Rolled over with State Bank of India with added accrued interest..."
              rows={2}
              aria-label="Renewal Remarks"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer min-h-[44px]"
            >
              Confirm &amp; Link Renewal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

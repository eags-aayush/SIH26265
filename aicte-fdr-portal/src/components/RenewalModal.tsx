'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, RotateCw, Building2, ArrowRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Submit FDR Renewal / Replacement</h2>
              <p className="text-xs text-slate-400">
                Link new deposit instrument to replace maturing receipt
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Predecessor Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Predecessor FDR:</span>
              <strong className="text-white font-mono">{oldFdr.fdr_number}</strong>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {oldFdr.bank_name} • ₹{oldFdr.amount.toLocaleString('en-IN')}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-400" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Maturity Status:</span>
              <span className="text-orange-400 font-semibold">{oldFdr.status}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              New Renewed FDR Number <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={newFdrNumber}
              onChange={(e) => setNewFdrNumber(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Deposit Amount (INR ₹) <span className="text-orange-500">*</span>
              </label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Extended Maturity Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                value={newMaturityDate}
                onChange={(e) => setNewMaturityDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Renewal Remarks / Bank Advice Note
            </label>
            <textarea
              value={renewalRemarks}
              onChange={(e) => setRenewalRemarks(e.target.value)}
              placeholder="e.g. Rolled over with State Bank of India with added accrued interest..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Confirm &amp; Link Renewal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

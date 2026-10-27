'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings } = useApp();

  const [milestonesText, setMilestonesText] = useState(settings.reminder_milestones.join(', '));
  const [escalationDays, setEscalationDays] = useState(String(settings.auto_escalation_days));
  const [minDeposit, setMinDeposit] = useState(String(settings.min_deposit_amount));
  const [bankMode, setBankMode] = useState<'mock' | 'live'>(settings.bank_adapter_mode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMilestones = milestonesText
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    updateSettings({
      reminder_milestones: parsedMilestones,
      auto_escalation_days: parseInt(escalationDays) || 7,
      min_deposit_amount: parseInt(minDeposit) || 1500000,
      bank_adapter_mode: bankMode,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Administrative Configuration
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            System Rules &amp; Threshold Engine
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Tune automated validity milestones, auto-escalation periods, and mandatory security limits.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>System configuration parameters saved and logged to audit trail.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
            Maturity Notification Milestones (Days before expiry)
          </label>
          <input
            type="text"
            value={milestonesText}
            onChange={(e) => setMilestonesText(e.target.value)}
            aria-label="Maturity Notification Milestones"
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono min-h-[44px] transition-all"
          />
          <span className="text-[11px] text-slate-400 mt-1.5 block">
            Comma-separated day intervals when daily cron sends automated alert notifications (e.g. 90, 60, 30, 15, 7).
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Auto-Escalation Stalled Case Threshold (Days)
            </label>
            <input
              type="number"
              value={escalationDays}
              onChange={(e) => setEscalationDays(e.target.value)}
              aria-label="Auto Escalation Stalled Case Threshold"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[44px] transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              Cases unresolved past this period escalate to Member Secretary.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Minimum Statutory Deposit Amount (INR ₹)
            </label>
            <input
              type="number"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              aria-label="Minimum Statutory Deposit Amount"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono min-h-[44px] transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              Mandatory baseline for new institution approvals.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
            Bank Verification Adapter Gateway Mode
          </label>
          <select
            value={bankMode}
            onChange={(e) => setBankMode(e.target.value as 'mock' | 'live')}
            aria-label="Bank Verification Adapter Gateway Mode"
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[44px] transition-all"
          >
            <option value="mock">Simulated CBS Mock Adapter (Recommended for Demonstrations)</option>
            <option value="live">Live Banking Open-API Gateway (Requires Corporate Authorization)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

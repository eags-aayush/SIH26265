'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Settings, Save, CheckCircle2, ShieldAlert, Sliders } from 'lucide-react';

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
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Administrative Configuration
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            System Rules &amp; Threshold Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tune automated validity milestones, auto-escalation periods, and mandatory security limits.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System configuration parameters saved and logged to audit trail.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
            Maturity Notification Milestones (Days before expiry)
          </label>
          <input
            type="text"
            value={milestonesText}
            onChange={(e) => setMilestonesText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Comma-separated day intervals when daily cron sends automated alert notifications (e.g. 90, 60, 30, 15, 7).
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
              Auto-Escalation Stalled Case Threshold (Days)
            </label>
            <input
              type="number"
              value={escalationDays}
              onChange={(e) => setEscalationDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Cases unresolved past this period escalate to Member Secretary.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
              Minimum Statutory Deposit Amount (INR ₹)
            </label>
            <input
              type="number"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Mandatory baseline for new institution approvals.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
            Bank Verification Adapter Gateway Mode
          </label>
          <select
            value={bankMode}
            onChange={(e) => setBankMode(e.target.value as 'mock' | 'live')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="mock">Simulated CBS Mock Adapter (Recommended for Demonstrations)</option>
            <option value="live">Live Banking Open-API Gateway (Requires Corporate Authorization)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

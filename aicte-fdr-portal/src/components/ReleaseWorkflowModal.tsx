'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ReleaseChecklist } from '@/types';
import confetti from 'canvas-confetti';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';

interface ReleaseWorkflowModalProps {
  instrumentId: string | null;
  onClose: () => void;
}

export function ReleaseWorkflowModal({ instrumentId, onClose }: ReleaseWorkflowModalProps) {
  const {
    instruments,
    currentUser,
    requestRelease,
    recommendRelease,
    decideRelease,
  } = useApp();

  const instrument = instruments.find((i) => i.id === instrumentId);

  const existingRequest = instrument?.release_request;

  // Institution request form state
  const [justification, setJustification] = useState(
    existingRequest?.justification ||
      'Institution has successfully completed the mandated 5-year lockin duration without student grievances.'
  );
  const [checklist, setChecklist] = useState<ReleaseChecklist>(
    existingRequest?.checklist || {
      no_pending_compliance: true,
      valid_closure_noc: true,
      undertaking_submitted: true,
      bank_mandate_verified: true,
    }
  );

  // Scrutiny Officer remarks
  const [scrutinyRemarks, setScrutinyRemarks] = useState(
    existingRequest?.scrutiny_remarks || 'Verified against AICTE Approval Bureau clearance registry. Recommended.'
  );

  // Approver remarks
  const [decisionRemarks, setDecisionRemarks] = useState(
    existingRequest?.decision_remarks || 'Sanctioned for release. Bank lien to be dissolved.'
  );

  if (!instrument || !instrumentId) return null;

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestRelease(instrument.id, justification, checklist);
  };

  const handleOfficerAction = (approved: boolean) => {
    recommendRelease(instrument.id, scrutinyRemarks, approved);
  };

  const handleApproverAction = (approved: boolean) => {
    decideRelease(instrument.id, decisionRemarks, approved);
    if (approved) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Security Deposit Release &amp; Refund</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Multi-tier compliance workflow: Institution &rarr; Scrutiny Officer &rarr; Approving Authority
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700/90 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Instrument Summary Header */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">FDR Under Review:</span>
              <strong className="text-white font-mono text-sm">{instrument.fdr_number}</strong>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {instrument.institution_name} • {instrument.bank_name}
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Refund Value:</span>
              <strong className="text-emerald-400 font-mono text-base font-black">₹{instrument.amount.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Workflow Stepper */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Release Workflow Progress
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  existingRequest
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                1. Raised
              </div>
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  existingRequest?.status === 'scrutiny_recommended' || existingRequest?.status === 'approved'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : existingRequest?.status === 'scrutiny_rejected'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                2. Scrutiny
              </div>
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  instrument.status === 'Released'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-black shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                3. Sanction
              </div>
            </div>
          </div>

          {/* Step 1: Compliance Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Mandatory Clearance Checklist</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">4 Conditions</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={checklist.no_pending_compliance}
                  disabled={Boolean(existingRequest && currentUser.role === 'institution')}
                  onChange={(e) =>
                    setChecklist({ ...checklist, no_pending_compliance: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-200">No Pending Compliance / Student Grievances</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Institution has certified that no outstanding dues or student certificates are withheld.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={checklist.valid_closure_noc}
                  disabled={Boolean(existingRequest && currentUser.role === 'institution')}
                  onChange={(e) =>
                    setChecklist({ ...checklist, valid_closure_noc: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-200">Valid AICTE Regional Office NOC</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Clearance issued by AICTE Regional Bureau for program closure or lock-in completion.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={checklist.undertaking_submitted}
                  disabled={Boolean(existingRequest && currentUser.role === 'institution')}
                  onChange={(e) =>
                    setChecklist({ ...checklist, undertaking_submitted: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-200">Legal Undertaking Affidavit on Stamp Paper</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Official undertaking indemnity document uploaded in digital vault.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={checklist.bank_mandate_verified}
                  disabled={Boolean(existingRequest && currentUser.role === 'institution')}
                  onChange={(e) =>
                    setChecklist({ ...checklist, bank_mandate_verified: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 accent-cyan-500 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-200">College Bank Account Mandate Verified</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Cancelled cheque matching PFMS credit registry verified.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Justification Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Institution Justification for Release
            </label>
            <textarea
              value={justification}
              disabled={Boolean(existingRequest && currentUser.role === 'institution')}
              onChange={(e) => setJustification(e.target.value)}
              rows={2}
              aria-label="Institution Justification for Release"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 transition-all"
            />
          </div>

          {/* Action Area: Scrutiny Officer Workbench */}
          {(currentUser.role === 'scrutiny_officer' || currentUser.role === 'admin') && existingRequest && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Scrutiny Officer Recommendation Step</span>
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Scrutiny Bureau Remarks
                </label>
                <textarea
                  value={scrutinyRemarks}
                  onChange={(e) => setScrutinyRemarks(e.target.value)}
                  rows={2}
                  aria-label="Scrutiny Bureau Remarks"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOfficerAction(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  Reject at Scrutiny
                </button>
                <button
                  type="button"
                  onClick={() => handleOfficerAction(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer min-h-[44px]"
                >
                  Clear Checklist &amp; Forward to Approving Authority
                </button>
              </div>
            </div>
          )}

          {/* Action Area: Approving Authority Final Sanction */}
          {(currentUser.role === 'approving_authority' || currentUser.role === 'admin') &&
            existingRequest &&
            existingRequest.status === 'scrutiny_recommended' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>Approving Authority Digital Sanction Step</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Scrutiny clearance verified. Confirming this action dissolves the AICTE lien on FDR #
                  <span className="font-mono font-bold text-white"> {instrument.fdr_number}</span> and authorizes the refund to the institution bank account.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Authority Decision Remarks
                  </label>
                  <input
                    type="text"
                    value={decisionRemarks}
                    onChange={(e) => setDecisionRemarks(e.target.value)}
                    aria-label="Authority Decision Remarks"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[44px]"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleApproverAction(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-semibold cursor-pointer min-h-[44px]"
                  >
                    Deny Release
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproverAction(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/30 cursor-pointer min-h-[44px]"
                  >
                    ✓ Officially Sanction Release &amp; Refund
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          {!existingRequest && (
            <button
              onClick={handleRequestSubmit}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
            >
              Submit Release Request
            </button>
          )}
          {existingRequest && (
            <span className="text-xs text-slate-400">
              Request status: <strong className="text-cyan-400 uppercase font-mono font-bold">{existingRequest.status.replace('_', ' ')}</strong>
            </span>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs ml-auto transition-colors cursor-pointer min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

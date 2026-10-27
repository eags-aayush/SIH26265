'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ReleaseChecklist } from '@/types';
import confetti from 'canvas-confetti';
import { 
  X, 
  Lock, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Security Deposit Release &amp; Refund</h2>
              <p className="text-xs text-slate-400">
                Multi-tier compliance workflow: Institution &rarr; Scrutiny Officer &rarr; Approving Authority
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Instrument Summary Header */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">FDR Under Review:</span>
              <strong className="text-white font-mono text-sm">{instrument.fdr_number}</strong>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {instrument.institution_name} • {instrument.bank_name}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Refund Value:</span>
              <strong className="text-emerald-400 text-sm">₹{instrument.amount.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Workflow Stepper */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Release Workflow Progress
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div
                className={`p-2 rounded-xl border ${
                  existingRequest
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                1. Institution Raised
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  existingRequest?.status === 'scrutiny_recommended' || existingRequest?.status === 'approved'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                    : existingRequest?.status === 'scrutiny_rejected'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                2. Scrutiny Clearance
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  instrument.status === 'Released'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                3. Final Sanction
              </div>
            </div>
          </div>

          {/* Step 1: Compliance Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Mandatory Clearance Checklist</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">4 Conditions</span>
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.no_pending_compliance}
                  disabled={Boolean(existingRequest && currentUser.role === 'institution')}
                  onChange={(e) =>
                    setChecklist({ ...checklist, no_pending_compliance: e.target.checked })
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-200">No Pending Compliance / Student Grievances</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Institution has certified that no outstanding dues or student certificates are withheld.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.valid_closure_noc}
                  disabled={Boolean(existingRequest && currentUser.role === 'institution')}
                  onChange={(e) =>
                    setChecklist({ ...checklist, valid_closure_noc: e.target.checked })
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-200">Valid AICTE Regional Office NOC</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Clearance issued by AICTE Regional Bureau for program closure or lock-in completion.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.undertaking_submitted}
                  disabled={Boolean(existingRequest && currentUser.role === 'institution')}
                  onChange={(e) =>
                    setChecklist({ ...checklist, undertaking_submitted: e.target.checked })
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-200">Legal Undertaking Affidavit on Stamp Paper</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Official undertaking indemnity document uploaded in digital vault.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.bank_mandate_verified}
                  disabled={Boolean(existingRequest && currentUser.role === 'institution')}
                  onChange={(e) =>
                    setChecklist({ ...checklist, bank_mandate_verified: e.target.checked })
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-slate-200">College Bank Account Mandate Verified</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cancelled cheque matching PFMS credit registry verified.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Justification Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Institution Justification for Release
            </label>
            <textarea
              value={justification}
              disabled={Boolean(existingRequest && currentUser.role === 'institution')}
              onChange={(e) => setJustification(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
            />
          </div>

          {/* Action Area: Scrutiny Officer Workbench */}
          {(currentUser.role === 'scrutiny_officer' || currentUser.role === 'admin') && existingRequest && (
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Scrutiny Officer Recommendation Step</span>
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scrutiny Bureau Remarks
                </label>
                <textarea
                  value={scrutinyRemarks}
                  onChange={(e) => setScrutinyRemarks(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOfficerAction(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-medium cursor-pointer"
                >
                  Reject at Scrutiny
                </button>
                <button
                  type="button"
                  onClick={() => handleOfficerAction(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
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
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>Approving Authority Digital Sanction Step</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Scrutiny clearance verified. Confirming this action dissolves the AICTE lien on FDR #
                  {instrument.fdr_number} and authorizes the refund to the institution bank account.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Authority Decision Remarks
                  </label>
                  <input
                    type="text"
                    value={decisionRemarks}
                    onChange={(e) => setDecisionRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproverAction(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-medium cursor-pointer"
                  >
                    Deny Release
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproverAction(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    ✓ Officially Sanction Release &amp; Refund
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {!existingRequest && (
            <button
              onClick={handleRequestSubmit}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Submit Release Request
            </button>
          )}
          {existingRequest && (
            <span className="text-xs text-slate-400">
              Request status: <strong className="text-white uppercase">{existingRequest.status}</strong>
            </span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

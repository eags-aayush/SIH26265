'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from './StatusBadge';
import { SourceBadge } from './SourceBadge';
import confetti from 'canvas-confetti';
import { getDocumentDownloadUrl } from '@/lib/storage';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  RotateCw, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Download,
  ArrowRight
} from 'lucide-react';

interface FDRDetailModalProps {
  instrumentId: string;
  onClose: () => void;
  onOpenRenewalModal: (instrumentId: string) => void;
  onOpenReleaseModal: (instrumentId: string) => void;
}

export function FDRDetailModal({
  instrumentId,
  onClose,
  onOpenRenewalModal,
  onOpenReleaseModal,
}: FDRDetailModalProps) {
  const {
    instruments,
    currentUser,
    runRuleCheck,
    runBankVerification,
    resolveDiscrepancy,
  } = useApp();

  const [isVerifying, setIsVerifying] = useState(false);
  const [bankResultMsg, setBankResultMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const instrument = instruments.find((i) => i.id === instrumentId);

  if (!instrument) return null;

  const handleBankVerification = async () => {
    setIsVerifying(true);
    setBankResultMsg(null);
    try {
      const res = await runBankVerification(instrument.id);
      setBankResultMsg({ text: res.message, success: res.success });
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRuleCheck = () => {
    const res = runRuleCheck(instrument.id);
    if (res.passed) {
      setBankResultMsg({ text: 'Automated Rule Engine check PASSED: No discrepancies found.', success: true });
    } else {
      setBankResultMsg({
        text: `Automated Rule Engine flagged ${res.discrepancies.length} discrepancy(s).`,
        success: false,
      });
    }
  };

  const handleResolveSubmit = (discrepancyId: string) => {
    if (!resolutionText.trim()) return;
    resolveDiscrepancy(discrepancyId, resolutionText.trim());
    setResolvingId(null);
    setResolutionText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto animate-scaleUp">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">{instrument.fdr_number}</h2>
                <StatusBadge status={instrument.status} size="sm" />
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {instrument.institution_name} • AICTE ID: <span className="text-orange-400 font-mono font-semibold">{instrument.institution_aicte_id}</span>
              </div>
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

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Notification / Verification Toast Message */}
          {bankResultMsg && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 animate-fadeIn ${
                bankResultMsg.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {bankResultMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
                <span>{bankResultMsg.text}</span>
              </div>
              <button onClick={() => setBankResultMsg(null)} className="opacity-70 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Core Design Feature: Dual Source Inspector Box */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Dual Source Verification Matrix (Problem Statement Core Concept)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Institution Declared vs Bank CBS Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* FDR Number Field Source */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Instrument Identifier
                </div>
                <div className="text-sm font-bold text-white font-mono">{instrument.fdr_number}</div>
                <div>
                  <SourceBadge source={instrument.fdr_number_source} timestamp={instrument.fdr_number_confirmed_at} size="sm" />
                </div>
              </div>

              {/* Deposit Amount Field Source */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Lien Amount Held
                </div>
                <div className="text-sm font-bold text-white">
                  ₹{instrument.amount.toLocaleString('en-IN')}
                </div>
                <div>
                  <SourceBadge source={instrument.amount_source} timestamp={instrument.amount_confirmed_at} size="sm" />
                </div>
              </div>

              {/* Maturity Date Field Source */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Maturity Expiry Date
                </div>
                <div className="text-sm font-bold text-white">
                  {new Date(instrument.maturity_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div>
                  <SourceBadge source={instrument.maturity_date_source} timestamp={instrument.maturity_date_confirmed_at} size="sm" />
                </div>
              </div>
            </div>

            {/* Bank Details Strip */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div>
                Issuing Bank: <strong className="text-slate-200">{instrument.bank_name}</strong>
              </div>
              <div>
                Branch: <strong className="text-slate-200">{instrument.branch_name}</strong>
              </div>
              <div>
                IFSC: <strong className="text-slate-200 font-mono">{instrument.ifsc_code}</strong>
              </div>
              <div>
                Maturity Countdown:{' '}
                <strong className={instrument.days_until_maturity <= 30 ? 'text-orange-400' : 'text-emerald-400'}>
                  {instrument.days_until_maturity > 0
                    ? `${instrument.days_until_maturity} Days remaining`
                    : `Matured ${Math.abs(instrument.days_until_maturity)} days ago`}
                </strong>
              </div>
            </div>
          </div>

          {/* Verification Workbench for Scrutiny Officer / Admin */}
          {(currentUser.role === 'scrutiny_officer' || currentUser.role === 'admin') && (
            <div className="glass-card rounded-2xl p-4 sm:p-5 shadow space-y-3 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Scrutiny Officer Verification Workbench
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">Layer A &amp; Layer B Engines</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRuleCheck}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
                >
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span>Execute Rule Engine Check</span>
                </button>

                <button
                  onClick={handleBankVerification}
                  disabled={isVerifying}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifying ? 'Connecting to Bank CBS Gateway...' : 'Execute Bank CBS Verification'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Discrepancies Panel */}
          {instrument.discrepancies.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Flagged Discrepancies ({instrument.discrepancies.filter((d) => d.status === 'open').length} Open)
                  </h4>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                  Action Required
                </span>
              </div>

              <div className="space-y-2">
                {instrument.discrepancies.map((disc) => (
                  <div
                    key={disc.id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      disc.status === 'open'
                        ? 'bg-rose-900/20 border-rose-500/40 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span className="font-mono">{disc.rule_code}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                              disc.severity === 'critical'
                                ? 'bg-rose-500/30 text-rose-300'
                                : 'bg-amber-500/30 text-amber-300'
                            }`}
                          >
                            {disc.severity}
                          </span>
                        </div>
                        <p className="leading-relaxed text-slate-300">{disc.message}</p>
                        {disc.resolution_notes && (
                          <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
                            <strong>College Resolution:</strong> {disc.resolution_notes}
                          </div>
                        )}
                      </div>

                      {disc.status === 'open' && (
                        <div className="w-full sm:w-auto shrink-0">
                          {resolvingId === disc.id ? (
                            <div className="flex flex-col gap-2 min-w-[260px]">
                              <textarea
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                                placeholder="Enter college justification or explanation..."
                                aria-label="Enter college justification"
                                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                                rows={2}
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setResolvingId(null)}
                                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer min-h-[44px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleResolveSubmit(disc.id)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer min-h-[44px]"
                                >
                                  Submit Correction
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setResolvingId(disc.id);
                                setResolutionText('');
                              }}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-semibold cursor-pointer min-h-[44px] flex items-center justify-center"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Renewal Chain History (Feature 5) */}
          {(instrument.previous_fdr_number || instrument.renewed_fdr_number) && (
            <div className="glass-card rounded-2xl p-4 sm:p-5 shadow space-y-2 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <RotateCw className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Renewal &amp; Predecessor Chain (Lineage)
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                {instrument.previous_fdr_number && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Predecessor Matured FDR:</span>
                    <strong className="text-white font-mono">{instrument.previous_fdr_number}</strong>
                  </div>
                )}
                {instrument.previous_fdr_number && <ArrowRight className="w-4 h-4 text-slate-500" />}
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200">
                  <span className="text-[10px] text-indigo-400 block">Current Instrument:</span>
                  <strong className="font-mono">{instrument.fdr_number}</strong>
                </div>
                {instrument.renewed_fdr_number && <ArrowRight className="w-4 h-4 text-slate-500" />}
                {instrument.renewed_fdr_number && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Successor Renewed FDR:</span>
                    <strong className="text-white font-mono">{instrument.renewed_fdr_number}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Management & Version Tree (Feature 2) */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 shadow space-y-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Digital Document Vault (Version Controlled)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">Encrypted MinIO / S3 Storage</span>
            </div>

            <div className="space-y-2">
              {instrument.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="truncate max-w-[200px] sm:max-w-xs">{doc.file_name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono shrink-0">
                          v{doc.version}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {doc.doc_type} • {doc.file_size} • Uploaded by {doc.uploaded_by} on{' '}
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      const url = await getDocumentDownloadUrl(doc.file_name);
                      if (url) {
                        window.open(url, '_blank');
                      } else {
                        alert(`Secure document preview for: ${doc.file_name} (Version ${doc.version}). In Supabase Storage mode, this opens the temporary signed URL.`);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Download / View Signed Document"
                    aria-label={`Download document ${doc.file_name}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onOpenRenewalModal(instrument.id)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
            >
              <RotateCw className="w-4 h-4" />
              <span>Submit Renewal FDR</span>
            </button>

            {instrument.status !== 'Released' && (
              <button
                onClick={() => onOpenReleaseModal(instrument.id)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {instrument.release_request ? 'Inspect Release Workflow' : 'Initiate Release Request'}
                </span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { uploadFDRDocument } from '@/lib/storage';
import { 
  X, 
  Building2, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Scan,
  ShieldCheck
} from 'lucide-react';

interface NewFDRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newInstrumentId: string) => void;
}

export function NewFDRModal({ isOpen, onClose, onSuccess }: NewFDRModalProps) {
  const { addNewInstrument, settings } = useApp();

  const [fdrNumber, setFdrNumber] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [amount, setAmount] = useState('3500000');
  const [issueDate, setIssueDate] = useState('2024-05-01');
  const [maturityDate, setMaturityDate] = useState('2029-05-01');
  const [purpose, setPurpose] = useState('Security Deposit for New Institution Approval');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrExtracted, setOcrExtracted] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const banks = [
    'State Bank of India',
    'Punjab National Bank',
    'Canara Bank',
    'Bank of Baroda',
    'Union Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
  ];

  const handleSimulateOCR = () => {
    setOcrRunning(true);
    setTimeout(() => {
      setOcrRunning(false);
      setFdrNumber('FDR-SBI-2026-AUTO78');
      setBankName('State Bank of India');
      setBranchName('Parliament Street, New Delhi');
      setIfscCode('SBIN0000691');
      setAmount('3500000');
      setIssueDate('2026-03-01');
      setMaturityDate('2031-03-01');
      setOcrExtracted(
        'AI OCR Engine: Extracted FDR #FDR-SBI-2026-AUTO78, ₹35,00,000, Maturity 01-Mar-2031. Fields auto-aligned with document scan.'
      );
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setIsSubmitting(true);

    try {
      if (selectedFile) {
        const uploadRes = await uploadFDRDocument(selectedFile, fdrNumber, 1);
        if (!uploadRes.success && uploadRes.error) {
          console.warn('Supabase storage upload note:', uploadRes.error);
        }
      }

      const res = addNewInstrument(
        {
          fdr_number: fdrNumber,
          bank_name: bankName,
          branch_name: branchName,
          ifsc_code: ifscCode,
          amount: Number(amount),
          issue_date: issueDate,
          maturity_date: maturityDate,
          purpose,
          state: 'Delhi',
        },
        selectedFile
      );

      if (res.success && res.instrument) {
        onSuccess(res.instrument.id);
        onClose();
      } else if (res.errors) {
        setFormErrors(res.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Submit New FDR Instrument</h2>
              <p className="text-xs text-slate-400">
                Register fixed deposit receipt security guarantee with AICTE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {formErrors.length > 0 && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 space-y-1.5 animate-fadeIn">
              {formErrors.map((err, idx) => (
                <div key={idx} className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* OCR Assistant Card with Laser Scanner Effect */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/25 overflow-hidden">
            {ocrRunning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-laser shadow-[0_0_15px_#f97316]" />
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300">
                  <Scan className="w-4 h-4 text-orange-400" />
                  <span>AI Vision / OCR Auto-Extraction Helper</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Upload your receipt and auto-populate all deposit fields instantly via vision AI.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSimulateOCR}
                disabled={ocrRunning}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shrink-0 transition-all shadow-md shadow-orange-600/30 disabled:opacity-50 cursor-pointer min-h-[40px] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{ocrRunning ? 'Scanning Receipt...' : 'Simulate OCR'}</span>
              </button>
            </div>
          </div>

          {ocrExtracted && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{ocrExtracted}</span>
            </div>
          )}

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Issuing Bank <span className="text-orange-500">*</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
              >
                {banks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                FDR Receipt Number <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. FDR-SBI-2024-9982"
                value={fdrNumber}
                onChange={(e) => setFdrNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                placeholder="e.g. Parliament Street, New Delhi"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Branch IFSC Code
              </label>
              <input
                type="text"
                placeholder="e.g. SBIN0000691"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase font-mono focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Deposit Amount (INR ₹) <span className="text-orange-500">*</span>
              </label>
              <input
                type="number"
                placeholder="3500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono font-bold focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard mandatory minimum: ₹{settings.min_deposit_amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Deposit Issue Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Maturity Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Approval Purpose / Category
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
              />
            </div>
          </div>

          {/* Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Upload Official FDR Receipt Scan (PDF or Image) <span className="text-orange-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-orange-500/60 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-950 group">
              <Upload className="w-7 h-7 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-slate-200 font-bold">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop official scan'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                PDF, PNG, JPG up to 10MB • Saved with version control to Supabase Storage
              </p>
              <input
                type="file"
                className="hidden"
                id="fdr_file_input"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('fdr_file_input')?.click()}
                className="mt-3 px-4 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 cursor-pointer min-h-[36px]"
              >
                Choose File
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs transition-all shadow-lg shadow-orange-600/30 disabled:opacity-50 cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Uploading & Submitting...' : 'Submit for AICTE Scrutiny'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

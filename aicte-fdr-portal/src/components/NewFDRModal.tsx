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
  FileText 
} from 'lucide-react';

interface NewFDRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newInstrumentId: string) => void;
}

export function NewFDRModal({ isOpen, onClose, onSuccess }: NewFDRModalProps) {
  const { addNewInstrument, currentUser, settings } = useApp();

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

  // OCR Auto-Reader Simulator (Feature 3 in Guide)
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
        'OCR Vision Model: Extracted FDR #FDR-SBI-2026-AUTO78, ₹35,00,000, Maturity 01-Mar-2031. Fields auto-aligned.'
      );
    }, 1000);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setIsSubmitting(true);

    try {
      if (selectedFile) {
        // Upload to Supabase Storage if configured
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Submit New FDR Instrument</h2>
              <p className="text-xs text-slate-400">
                Register fixed deposit receipt security guarantee with AICTE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {formErrors.length > 0 && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-1">
              {formErrors.map((err, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* OCR Assistant Bar */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>AI Vision / OCR Auto-Extraction Helper</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Upload your FDR scanned document and auto-populate all receipt fields instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSimulateOCR}
              disabled={ocrRunning}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
            >
              {ocrRunning ? 'Reading Document Scan...' : '⚡ Simulate OCR Extraction'}
            </button>
          </div>

          {ocrExtracted && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{ocrExtracted}</span>
            </div>
          )}

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Issuing Bank <span className="text-orange-500">*</span>
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                {banks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                FDR Receipt Number <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. FDR-SBI-2024-9982"
                value={fdrNumber}
                onChange={(e) => setFdrNumber(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Branch Name
              </label>
              <input
                type="text"
                placeholder="e.g. Parliament Street, New Delhi"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Branch IFSC Code
              </label>
              <input
                type="text"
                placeholder="e.g. SBIN0000691"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deposit Amount (INR ₹) <span className="text-orange-500">*</span>
              </label>
              <input
                type="number"
                placeholder="3500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard mandatory minimum: ₹{settings.min_deposit_amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deposit Issue Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Maturity Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Approval Purpose / Category
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Document Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Upload Official FDR Scan (PDF or Image) <span className="text-orange-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-orange-500/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-950">
              <Upload className="w-6 h-6 text-orange-400 mx-auto mb-1.5" />
              <div className="text-xs text-slate-300 font-medium">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop official scan'}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                PDF, PNG, JPG up to 10MB • Version 1 will be digitally preserved in MinIO
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
                className="mt-2.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Choose File
              </button>
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
            >
              Submit for AICTE Scrutiny
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

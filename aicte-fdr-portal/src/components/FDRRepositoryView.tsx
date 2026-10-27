'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from './StatusBadge';
import { SourceBadge } from './SourceBadge';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  ShieldCheck, 
  Building2, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface FDRRepositoryViewProps {
  onSelectInstrument: (id: string) => void;
  onOpenNewFdrModal: () => void;
}

export function FDRRepositoryView({ onSelectInstrument, onOpenNewFdrModal }: FDRRepositoryViewProps) {
  const {
    filteredInstruments,
    instruments,
    currentUser,
    searchTerm,
    setSearchTerm,
    selectedStatusFilter,
    setSelectedStatusFilter,
    selectedBankFilter,
    setSelectedBankFilter,
    selectedStateFilter,
    setSelectedStateFilter,
  } = useApp();

  // Extract unique banks and states for dropdowns
  const uniqueBanks = Array.from(new Set(instruments.map((i) => i.bank_name))).sort();
  const uniqueStates = Array.from(new Set(instruments.map((i) => i.state))).sort();

  const statuses = [
    'ALL',
    'Submitted',
    'Under Scrutiny',
    'Discrepancy Flagged',
    'Verified',
    'Active',
    'Expiring Soon',
    'Matured',
    'Renewed',
    'Release Requested',
    'Released',
  ];

  // Export filtered to CSV
  const handleExportCSV = () => {
    const headers = [
      'FDR Number',
      'FDR Source',
      'Institution Name',
      'AICTE ID',
      'State',
      'Bank Name',
      'Branch',
      'IFSC',
      'Amount (INR)',
      'Amount Source',
      'Issue Date',
      'Maturity Date',
      'Maturity Source',
      'Status',
      'Days Remaining',
    ];

    const rows = filteredInstruments.map((i) => [
      `"${i.fdr_number}"`,
      `"${i.fdr_number_source}"`,
      `"${i.institution_name}"`,
      `"${i.institution_aicte_id}"`,
      `"${i.state}"`,
      `"${i.bank_name}"`,
      `"${i.branch_name}"`,
      `"${i.ifsc_code}"`,
      i.amount,
      `"${i.amount_source}"`,
      i.issue_date,
      i.maturity_date,
      `"${i.maturity_date_source}"`,
      `"${i.status}"`,
      i.days_until_maturity,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_FDR_Registry_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Central FDR Deposit Repository</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {filteredInstruments.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-state inventory of financial security instruments with dual-source validation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer"
            title="Download CSV export"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {(currentUser.role === 'institution' || currentUser.role === 'admin') && (
            <button
              onClick={onOpenNewFdrModal}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-orange-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New FDR</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by FDR #, College Name, Bank, or AICTE ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Bank Filter */}
          <div>
            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="ALL">All Banks ({uniqueBanks.length})</option>
              {uniqueBanks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="ALL">All States ({uniqueStates.length})</option>
              {uniqueStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStatusFilter === st
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main FDR Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">FDR Instrument No.</th>
                <th className="py-3.5 px-4">Institution &amp; AICTE ID</th>
                <th className="py-3.5 px-4">Deposit Amount (₹)</th>
                <th className="py-3.5 px-4">Issuing Bank &amp; Branch</th>
                <th className="py-3.5 px-4">Maturity Date &amp; Horizon</th>
                <th className="py-3.5 px-4">Lifecycle Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredInstruments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-300">No FDR records match the active criteria</div>
                    <div className="text-xs text-slate-500 mt-1">Try resetting the status filter or search query.</div>
                  </td>
                </tr>
              ) : (
                filteredInstruments.map((item) => {
                  const daysLeft = item.days_until_maturity;
                  const hasDiscrepancy = item.discrepancies.some((d) => d.status === 'open');

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectInstrument(item.id)}
                    >
                      {/* FDR Number + Source Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-orange-400 transition-colors">
                          {item.fdr_number}
                        </div>
                        <div className="mt-1">
                          <SourceBadge source={item.fdr_number_source} timestamp={item.fdr_number_confirmed_at} />
                        </div>
                      </td>

                      {/* Institution & State */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-200 truncate" title={item.institution_name}>
                          {item.institution_name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-orange-400/90">{item.institution_aicte_id}</span>
                          <span>•</span>
                          <span>{item.state}</span>
                        </div>
                      </td>

                      {/* Deposit Amount + Source Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-100">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="mt-1">
                          <SourceBadge source={item.amount_source} timestamp={item.amount_confirmed_at} />
                        </div>
                      </td>

                      {/* Issuing Bank */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{item.bank_name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[170px]" title={item.branch_name}>
                          {item.branch_name}
                        </div>
                      </td>

                      {/* Maturity Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {new Date(item.maturity_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {daysLeft > 0 ? (
                            <span className={daysLeft <= 30 ? 'text-orange-400 font-semibold' : 'text-slate-400'}>
                              {daysLeft} days remaining
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold">Matured ({Math.abs(daysLeft)}d ago)</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={item.status} size="sm" />
                          {hasDiscrepancy && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                              <AlertCircle className="w-3 h-3" />
                              Action Needed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInstrument(item.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-orange-400" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

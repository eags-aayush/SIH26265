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
  AlertCircle, 
  ArrowRight
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
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Central FDR Deposit Registry</span>
            <span className="text-xs bg-slate-800/80 text-orange-400 font-bold px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
              {filteredInstruments.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-state inventory of financial security instruments with dual-source validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
            title="Download CSV export"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {(currentUser.role === 'institution' || currentUser.role === 'admin') && (
            <button
              onClick={onOpenNewFdrModal}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/30 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New FDR</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by FDR #, College Name, Bank, or AICTE ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
            />
          </div>

          {/* Bank Filter */}
          <div>
            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
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
              className="w-full px-3 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
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

        {/* Status Filter Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 pb-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 text-orange-400" /> Filter:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedStatusFilter === st
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW: Responsive Interactive Cards (Replaces wide horizontal overflow table on small screens) */}
      <div className="block md:hidden space-y-3">
        {filteredInstruments.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 text-xs">
            No FDR records match the active criteria.
          </div>
        ) : (
          filteredInstruments.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectInstrument(item.id)}
              className="glass-card rounded-2xl p-4.5 space-y-3 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-extrabold text-sm text-white font-mono">{item.fdr_number}</div>
                  <div className="mt-1">
                    <SourceBadge source={item.fdr_number_source} timestamp={item.fdr_number_confirmed_at} />
                  </div>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <div className="text-xs text-slate-300 font-semibold">
                {item.institution_name}
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  AICTE: {item.institution_aicte_id} • {item.state}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Deposit Value:</span>
                  <strong className="text-emerald-400 font-mono">₹{item.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Maturity Date:</span>
                  <strong className="text-slate-200">
                    {new Date(item.maturity_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{item.bank_name}</span>
                <span className="text-xs text-orange-400 font-bold flex items-center gap-1">
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW: Sleek Glass Data Table */}
      <div className="hidden md:block glass-panel rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-4 px-5">FDR Instrument No.</th>
                <th className="py-4 px-5">Institution &amp; AICTE ID</th>
                <th className="py-4 px-5">Deposit Amount (₹)</th>
                <th className="py-4 px-5">Issuing Bank &amp; Branch</th>
                <th className="py-4 px-5">Maturity Horizon</th>
                <th className="py-4 px-5">Lifecycle Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredInstruments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-850 flex items-center justify-center mx-auto mb-3 text-slate-500 border border-slate-700/60">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-200">No matching FDR records found</div>
                    <div className="text-xs text-slate-500 mt-1">Try broadening your search query or reset the status filters.</div>
                  </td>
                </tr>
              ) : (
                filteredInstruments.map((item) => {
                  const daysLeft = item.days_until_maturity;
                  const hasDiscrepancy = item.discrepancies.some((d) => d.status === 'open');

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectInstrument(item.id)}
                    >
                      {/* FDR Number + Source Badge */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-white group-hover:text-orange-400 transition-colors font-mono">
                          {item.fdr_number}
                        </div>
                        <div className="mt-1.5">
                          <SourceBadge source={item.fdr_number_source} timestamp={item.fdr_number_confirmed_at} />
                        </div>
                      </td>

                      {/* Institution & State */}
                      <td className="py-4 px-5 max-w-[220px]">
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
                      <td className="py-4 px-5">
                        <div className="font-black text-slate-100 font-mono">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="mt-1.5">
                          <SourceBadge source={item.amount_source} timestamp={item.amount_confirmed_at} />
                        </div>
                      </td>

                      {/* Issuing Bank */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-200">{item.bank_name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[170px]" title={item.branch_name}>
                          {item.branch_name}
                        </div>
                      </td>

                      {/* Maturity Date */}
                      <td className="py-4 px-5">
                        <div className="font-medium text-slate-200">
                          {new Date(item.maturity_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {daysLeft > 0 ? (
                            <span className={daysLeft <= 30 ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                              {daysLeft} days remaining
                            </span>
                          ) : (
                            <span className="text-rose-400 font-black">Matured ({Math.abs(daysLeft)}d ago)</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={item.status} size="sm" />
                          {hasDiscrepancy && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                              <AlertCircle className="w-3 h-3" />
                              Action Needed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInstrument(item.id);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer group-hover:border-slate-600"
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

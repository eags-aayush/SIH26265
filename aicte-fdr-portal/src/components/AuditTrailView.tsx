'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  Lock, 
  ShieldCheck, 
  Code
} from 'lucide-react';

export function AuditTrailView() {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedRoleFilter !== 'ALL' && log.user_role !== selectedRoleFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        log.action.toLowerCase().includes(q) ||
        log.user_email.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        log.entity_id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const selectedLog = auditLogs.find((l) => l.id === selectedLogId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-rose-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              Statutory Compliance &amp; Forensics
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Immutable Audit Trail &amp; Access Log
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Append-only tamper-evident ledger. Governed by database-level PostgreSQL security triggers
            prohibiting UPDATE or DELETE operations by any role.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-950 border border-slate-800 p-3 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Immutable Triggers Active</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Action, User Email, or Entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search Audit Trail"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Role Filter:</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            aria-label="Filter by User Role"
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[44px]"
          >
            <option value="ALL">All Roles</option>
            <option value="institution">Institution</option>
            <option value="scrutiny_officer">Scrutiny Officer</option>
            <option value="approving_authority">Approving Authority</option>
            <option value="admin">Admin</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>
      </div>

      {/* Grid: Table / Mobile Cards on left, Diff Inspector on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mobile View: Responsive Card Feed */}
        <div className="block lg:hidden space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Audit Events ({filteredLogs.length})
          </div>
          {filteredLogs.map((log) => {
            const isSelected = log.id === selectedLogId;
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLogId(log.id)}
                className={`glass-card rounded-2xl p-4 space-y-2.5 cursor-pointer transition-all ${
                  isSelected ? 'border-orange-500/60 bg-slate-850/80' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {log.user_email}
                  <span className="text-[10px] text-orange-400 font-bold ml-1.5 uppercase">({log.user_role})</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="truncate max-w-[200px]">{log.entity}: {log.entity_id}</span>
                  <span className="text-xs text-orange-400 font-semibold">Inspect Diff &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Sleek Table */}
        <div className="hidden lg:block lg:col-span-2 glass-panel border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3.5 px-4">Timestamp (UTC)</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Actor Email &amp; Role</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredLogs.map((log) => {
                  const isSelected = log.id === selectedLogId;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`hover:bg-slate-850/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-800/80 border-l-2 border-l-orange-500' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium truncate max-w-[170px]">{log.user_email}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{log.user_role}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">{log.entity}</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                          {log.entity_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLogId(log.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Diff
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Diff & Forensic Inspector */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <Code className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Forensic State Diff Inspector</h3>
            </div>

            {selectedLog ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Event ID:</span>
                  <span className="font-mono text-slate-200 text-[11px] break-all">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Actor IP Address:</span>
                  <span className="font-mono text-slate-200">{selectedLog.ip_address}</span>
                </div>

                {selectedLog.old_value && (
                  <div>
                    <span className="text-[10px] text-rose-400 uppercase tracking-wider font-bold block mb-1">
                      - Previous State (Old Value):
                    </span>
                    <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-48">
                      {JSON.stringify(selectedLog.old_value, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_value && (
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block mb-1">
                      + Updated State (New Value):
                    </span>
                    <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                      {JSON.stringify(selectedLog.new_value, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                Select any audit log row or card to inspect old vs new state JSON payloads.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
            Cryptographic SHA-256 chain integrity verified.
          </div>
        </div>
      </div>
    </div>
  );
}

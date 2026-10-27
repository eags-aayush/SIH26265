'use client';

import React from 'react';
import { FDRStatus } from '@/types';
import { 
  FileCheck2, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  History, 
  Lock, 
  RotateCw, 
  Clock 
} from 'lucide-react';

interface StatusBadgeProps {
  status: FDRStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const getStatusConfig = (st: FDRStatus) => {
    switch (st) {
      case 'Submitted':
        return {
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400 shadow-[0_0_6px_#60a5fa]',
          icon: Clock,
          label: 'Submitted',
        };
      case 'Under Scrutiny':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]',
          icon: Search,
          label: 'Under Scrutiny',
        };
      case 'Discrepancy Flagged':
        return {
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10',
          dot: 'bg-rose-400 shadow-[0_0_6px_#f43f5e] animate-ping',
          icon: AlertTriangle,
          label: 'Discrepancy Flagged',
        };
      case 'Verified':
        return {
          bg: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
          dot: 'bg-teal-400 shadow-[0_0_6px_#2dd4bf]',
          icon: FileCheck2,
          label: 'Verified',
        };
      case 'Active':
        return {
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
          dot: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
          icon: CheckCircle2,
          label: 'Active & Secured',
        };
      case 'Expiring Soon':
        return {
          bg: 'bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-sm shadow-orange-500/20',
          dot: 'bg-orange-400 shadow-[0_0_8px_#fb923c] animate-pulse',
          icon: ShieldAlert,
          label: 'Expiring Soon',
        };
      case 'Matured':
        return {
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400 shadow-[0_0_6px_#c084fc]',
          icon: History,
          label: 'Matured',
        };
      case 'Renewed':
        return {
          bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
          dot: 'bg-indigo-400 shadow-[0_0_6px_#818cf8]',
          icon: RotateCw,
          label: 'Renewed & Linked',
        };
      case 'Release Requested':
        return {
          bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          dot: 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]',
          icon: Lock,
          label: 'Release Requested',
        };
      case 'Released':
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          icon: CheckCircle2,
          label: 'Released & Closed',
        };
      default:
        return {
          bg: 'bg-gray-500/10 text-gray-300 border-gray-500/30',
          dot: 'bg-gray-400',
          icon: Clock,
          label: st,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all duration-200 cursor-default select-none ${config.bg} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span className="font-semibold">{config.label}</span>
    </span>
  );
}

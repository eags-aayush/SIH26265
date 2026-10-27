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
          bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          icon: Clock,
          label: 'Submitted',
        };
      case 'Under Scrutiny':
        return {
          bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          icon: Search,
          label: 'Under Scrutiny',
        };
      case 'Discrepancy Flagged':
        return {
          bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          icon: AlertTriangle,
          label: 'Discrepancy Flagged',
        };
      case 'Verified':
        return {
          bg: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
          icon: FileCheck2,
          label: 'Verified',
        };
      case 'Active':
        return {
          bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          icon: CheckCircle2,
          label: 'Active & Secured',
        };
      case 'Expiring Soon':
        return {
          bg: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40 animate-pulse',
          icon: ShieldAlert,
          label: 'Expiring Soon',
        };
      case 'Matured':
        return {
          bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
          icon: History,
          label: 'Matured',
        };
      case 'Renewed':
        return {
          bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
          icon: RotateCw,
          label: 'Renewed & Linked',
        };
      case 'Release Requested':
        return {
          bg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
          icon: Lock,
          label: 'Release Requested',
        };
      case 'Released':
        return {
          bg: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
          icon: CheckCircle2,
          label: 'Released & Closed',
        };
      default:
        return {
          bg: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30',
          icon: Clock,
          label: st,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-4 h-4 shrink-0'} />
      <span>{config.label}</span>
    </span>
  );
}

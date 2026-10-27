'use client';

import React from 'react';
import { FieldSourceType } from '@/types';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface SourceBadgeProps {
  source: FieldSourceType;
  timestamp?: string;
  size?: 'sm' | 'md';
}

export function SourceBadge({ source, timestamp, size = 'sm' }: SourceBadgeProps) {
  const isBank = source === 'Bank-confirmed';

  return (
    <span
      title={
        isBank
          ? `Verified by Bank Core Banking System (CBS)${timestamp ? ` on ${new Date(timestamp).toLocaleDateString()}` : ''}`
          : 'Self-declared value submitted by Institution. Pending bank verification.'
      }
      className={`inline-flex items-center gap-1 font-medium rounded-full transition-all duration-150 ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${
        isBank
          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-400/30'
      }`}
    >
      {isBank ? (
        <>
          <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-600 dark:text-emerald-400' : 'w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400'} />
          <span>Bank-confirmed</span>
        </>
      ) : (
        <>
          <UserCheck className={size === 'sm' ? 'w-3 h-3 text-slate-500' : 'w-3.5 h-3.5 text-slate-500'} />
          <span>Institution-submitted</span>
        </>
      )}
    </span>
  );
}

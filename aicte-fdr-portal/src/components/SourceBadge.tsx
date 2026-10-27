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
      className={`inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200 cursor-default select-none ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${
        isBank
          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 hover:bg-emerald-500/20'
          : 'bg-slate-800/80 text-slate-300 border border-slate-700/60 shadow-sm hover:bg-slate-800'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isBank ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-400'
        }`}
      />
      {isBank ? (
        <>
          <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />
          <span className="font-semibold tracking-tight">Bank-confirmed</span>
        </>
      ) : (
        <>
          <UserCheck className={size === 'sm' ? 'w-3 h-3 text-slate-400' : 'w-3.5 h-3.5 text-slate-400'} />
          <span className="tracking-tight">Institution-submitted</span>
        </>
      )}
    </span>
  );
}

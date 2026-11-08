import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  switch (s) {
    case 'PAID':
    case 'PRESENT':
    case 'ACTIVE':
    case 'PASS':
    case 'COMPLETED':
      return <Badge variant="success">{status}</Badge>;
    case 'PARTIAL':
    case 'LATE':
    case 'SCHEDULED':
      return <Badge variant="warning">{status}</Badge>;
    case 'UNPAID':
    case 'ABSENT':
    case 'INACTIVE':
    case 'FAIL':
      return <Badge variant="danger">{status}</Badge>;
    case 'OVERDUE':
      return <Badge variant="danger" className="bg-red-100 text-red-800 font-bold animate-pulse">OVERDUE</Badge>;
    case 'LEAVE':
    case 'ONGOING':
      return <Badge variant="info">{status}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

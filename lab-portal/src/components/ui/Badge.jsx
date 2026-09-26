import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
    primary: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const normStatus = (status || '').toUpperCase();

  let variant = 'default';
  let label = status || 'Unknown';
  let dotColor = 'bg-slate-400';

  if (['COMPLETED', 'RELEASED', 'VERIFIED', 'ACTIVE', 'PAID', 'APPROVED'].includes(normStatus)) {
    variant = 'success';
    dotColor = 'bg-emerald-500';
  } else if (['PENDING', 'PROCESSING', 'RECEIVED', 'IN_PROGRESS', 'AWAITING_REVIEW'].includes(normStatus)) {
    variant = 'warning';
    dotColor = 'bg-amber-500';
  } else if (['CRITICAL', 'ABNORMAL', 'REJECTED', 'FAILED', 'CANCELLED', 'HIGH', 'STAT'].includes(normStatus)) {
    variant = 'danger';
    dotColor = 'bg-rose-500';
  } else if (['ORDERED', 'SCHEDULED', 'CONFIRMED', 'COLLECTED'].includes(normStatus)) {
    variant = 'info';
    dotColor = 'bg-sky-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full text-xs px-2.5 py-0.5 border ${
        variant === 'success'
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
          : variant === 'warning'
          ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
          : variant === 'danger'
          ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
          : variant === 'info'
          ? 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300'
          : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

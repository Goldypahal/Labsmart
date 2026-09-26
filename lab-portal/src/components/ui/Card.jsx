import React from 'react';

export function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-all ${className}`}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'teal',
  className = '',
  onClick,
}) {
  const colorStyles = {
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
    blue: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorStyles[color] || colorStyles.teal}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
        {trend && (
          <span
            className={`text-xs font-medium flex items-center ${
              trendDirection === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trendDirection === 'down'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}

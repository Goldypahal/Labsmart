import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import Button from './Button';

export function LoadingState({ message = 'Loading records...' }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="w-9 h-9 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{message}</p>
      <span className="text-xs text-slate-400 mt-1">Connecting to diagnostic data repository...</span>
    </div>
  );
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no active records in this view.',
  actionText,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="py-14 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'A server connection or processing error occurred.',
  onRetry,
}) {
  return (
    <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-4">
      <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg">
        <AlertCircle className="w-5 h-5 shrink-0" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">{title}</h4>
        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{message}</p>
        {onRetry && (
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
              Retry Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

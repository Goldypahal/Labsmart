import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, User } from 'lucide-react';

export default function AuditTimeline({ steps = [] }) {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {steps.map((step, idx) => {
        const isDone = step.status === 'completed';
        const isCurrent = step.status === 'in_progress';
        const isError = step.status === 'error';

        return (
          <div key={idx} className="relative group">
            {/* Dot */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                isDone
                  ? 'bg-emerald-500 border-white text-white shadow-xs'
                  : isCurrent
                  ? 'bg-white border-teal-600 text-teal-600 animate-pulse'
                  : isError
                  ? 'bg-rose-500 border-white text-white'
                  : 'bg-white border-slate-300 text-slate-300 dark:bg-slate-900 dark:border-slate-700'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
              ) : isCurrent ? (
                <Clock className="w-3 h-3" />
              ) : isError ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              )}
            </div>

            {/* Content */}
            <div className="bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </span>
                {step.timestamp && (
                  <span className="text-[11px] text-slate-400 shrink-0">{step.timestamp}</span>
                )}
              </div>
              {step.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {step.description}
                </p>
              )}
              {step.actor && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Action by: <span className="font-medium text-slate-700 dark:text-slate-300">{step.actor}</span></span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

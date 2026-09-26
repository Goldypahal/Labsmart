import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { IS_DEMO_MODE } from '../../config/env';

export default function DemoEnvironmentBanner() {
  if (!IS_DEMO_MODE) return null;

  return (
    <aside
      aria-label="Demo environment warning"
      className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-xs shrink-0 select-none tracking-wide"
    >
      <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
      <span>DEMO ENVIRONMENT • SYNTHETIC DATA • NOT REAL PATIENT DATA</span>
    </aside>
  );
}

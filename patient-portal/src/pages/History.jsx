import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, ShieldAlert, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { patientApi } from '../services/api';

export default function History() {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    patientApi.getHealthTrends().then((t) => setTrends(t));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Longitudinal Biomarker Health Trends"
        subtitle="Track historical changes in your blood chemistry across diagnostic visits."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Biomarker Trends' }]}
      />

      {/* Mandatory Healthcare UX Disclaimer Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-xl text-xs space-y-1 text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Clinical Notice & Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          Biomarker trends are displayed for longitudinal monitoring. Laboratory reference intervals and personal target ranges must always be evaluated in consultation with your attending physician. Do not alter medication doses without physician advice.
        </p>
      </div>

      <div className="space-y-6">
        {trends.map((item, idx) => (
          <Card
            key={idx}
            header={
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.biomarker}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Target: {item.target} {item.unit}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {item.unit}
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {item.history.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1"
                  >
                    <span className="text-[11px] text-slate-400 font-mono block">{h.date}</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white block font-mono">
                      {h.value} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        h.flag === 'NORMAL'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {h.flag}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Bar Visualization */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Baseline ({item.history[0].date})</span>
                  <span>Latest Value ({item.history[item.history.length - 1].date})</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-teal-600 transition-all rounded-full"
                    style={{ width: `${Math.min(100, (item.history[item.history.length - 1].value / 250) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

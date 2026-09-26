import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card, StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { labApi } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, o] = await Promise.all([labApi.getSamples(), labApi.getOrders()]);
      setSamples(s);
      setOrders(o);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingSamples = samples.filter((s) => s.status === 'PROCESSING' || s.status === 'RECEIVED');
  const criticalAwaiting = samples.filter((s) => s.status === 'CRITICAL' || s.status === 'AWAITING_REVIEW');
  const verifiedCount = samples.filter((s) => s.status === 'VERIFIED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Laboratory Information System (LIMS) Dashboard"
        subtitle="Specimen accession intake, analyzer batch progress, and critical value verification."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Layers}
              onClick={() => navigate('/orders')}
            >
              Accession Queue
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={FileSpreadsheet}
              onClick={() => navigate('/results')}
            >
              Enter Test Results
            </Button>
          </div>
        }
      />

      {/* STAT Alert if critical results are pending authorization */}
      {criticalAwaiting.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Action Required: {criticalAwaiting.length} Specimen Result(s) Awaiting Pathologist Authorization
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Technical entry completed. Second pathologist review and electronic signature sign-off required prior to report release.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/verification')}
            className="shrink-0"
          >
            Review & Authorize →
          </Button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Accession Intake"
          value={orders.length + samples.length}
          subtitle="Total samples registered today"
          icon={Layers}
          color="blue"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="In Processing"
          value={pendingSamples.length}
          subtitle="Analyzers actively processing"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/results')}
        />
        <StatCard
          title="Verified & Released"
          value={verifiedCount}
          subtitle="Official reports signed off"
          icon={CheckCircle2}
          color="teal"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Revenue Reconciled"
          value="₹1,400"
          subtitle="Daily collected diagnostics"
          icon={CreditCard}
          color="purple"
          onClick={() => navigate('/billing')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Specimen Queue (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Active Specimen Processing Stream
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/orders')}
                >
                  View Queue →
                </Button>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {samples.map((s) => (
                <div key={s.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {s.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {s.patientName}
                      </span>
                      <span className="text-[11px] text-slate-400">({s.age}y / {s.gender})</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Panel: <span className="font-semibold text-teal-600">{s.testPanel}</span> • Specimen: {s.specimen}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Barcode: {s.accessionNumber} • Intake: {s.collectionTime}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!s.resultsEntered ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/results?sampleId=${s.id}`)}
                      >
                        Enter Results
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/reports')}
                      >
                        View Report
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Analyzer Health & Quick Shortcuts (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Analyzer Connectivity</h3>}>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Sysmex XN-1000 (Hematology)</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Last QC: 07:00 AM • Calibration Verified</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Cobas c311 (Biochemistry)</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Last QC: 07:30 AM • Water Blank OK</span>
              </div>
            </div>
          </Card>

          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">LIMS Quick Actions</h3>}>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Accession New Specimen
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/results')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Structured Result Entry
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/verification')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Pathologist Verification Sign-off
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

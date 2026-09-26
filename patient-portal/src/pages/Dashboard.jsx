import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Compass,
  TrendingUp,
  Download,
  Clock,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card, StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { patientApi } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [liveCollection, setLiveCollection] = useState(null);
  const patient = patientApi.getCurrentUser();

  useEffect(() => {
    patientApi.getReports().then((r) => setReports(r));
    patientApi.getLiveCollection().then((c) => setLiveCollection(c));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-teal-200 font-semibold">
            Ayushman Bharat Connected EMR
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {patient.name}
          </h2>
          <p className="text-xs text-teal-100 max-w-lg leading-relaxed">
            Your certified diagnostic health record is synced with Pahal Diagnostic Hospital and verified under ABHA ID #{patient.abhaId}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate('/book-test')}
          >
            Book New Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-teal-300 hover:bg-teal-700"
            icon={FileText}
            onClick={() => navigate('/reports')}
          >
            View Lab Reports
          </Button>
        </div>
      </div>

      {/* Active Home Collection Milestone Tracking Banner */}
      {liveCollection && (
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600 animate-spin" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Sample Collection Tracking
                </h3>
              </div>
              <StatusBadge status={liveCollection.status} />
            </div>
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {liveCollection.testName}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Mode: {liveCollection.mode} • Slot: <span className="font-semibold text-teal-600">{liveCollection.slot}</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Phlebotomist: <span className="font-medium text-slate-700 dark:text-slate-300">{liveCollection.phlebotomist.name}</span> ({liveCollection.phlebotomist.credential || 'Certified'})
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Compass}
              onClick={() => navigate('/live-map')}
            >
              Track Phlebotomist Live →
            </Button>
          </div>
        </Card>
      )}

      {/* High-Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Verified Reports"
          value={reports.length}
          subtitle="Signed by Dr. Sarah Pathologist"
          icon={FileText}
          color="teal"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Active Tests"
          value={liveCollection ? 1 : 0}
          subtitle="Scheduled home collections"
          icon={Calendar}
          color="blue"
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          title="Longitudinal Trends"
          value="3"
          subtitle="Key biomarkers tracked"
          icon={TrendingUp}
          color="amber"
          onClick={() => navigate('/history')}
        />
      </div>

      {/* Recent Diagnostic Reports */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Diagnostic Reports
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              All Reports →
            </Button>
          </div>
        }
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reports.map((rep) => (
            <div key={rep.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rep.testPanel}
                  </h4>
                  <StatusBadge status={rep.status} />
                </div>
                <div className="text-xs text-slate-500">
                  Sample #{rep.sampleId} • Reported on {rep.reportingDate}
                </div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  Verified by: {rep.verifiedBy} • Reviewed by Dr. Smith
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/reports/${rep.id}`)}
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Download}
                  onClick={() => window.print()}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

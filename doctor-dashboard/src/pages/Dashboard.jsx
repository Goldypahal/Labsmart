import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileCheck2,
  Calendar,
  Users,
  Stethoscope,
  ArrowRight,
  Clock,
  CheckCircle2,
  Video,
  FileText,
} from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/Tabs';
import { clinicalApi } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pts, reps, apts, rx] = await Promise.all([
        clinicalApi.getPatients(),
        clinicalApi.getReports(),
        clinicalApi.getAppointments(),
        clinicalApi.getPrescriptions(),
      ]);
      setPatients(pts);
      setReports(reps);
      setAppointments(apts);
      setPrescriptions(rx);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (reportId) => {
    await clinicalApi.acknowledgeCriticalResult(reportId);
    loadData();
  };

  const criticalReports = reports.filter((r) => r.status === 'CRITICAL' && !r.criticalAcknowledged);
  const pendingReviewReports = reports.filter((r) => !r.reviewedByDoctor);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Clinician Command Center"
        subtitle="Real-time clinical telemetry, critical diagnostic alerts, and patient follow-ups."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Users}
              onClick={() => navigate('/patients')}
            >
              Patient Directory
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Stethoscope}
              onClick={() => navigate('/order')}
            >
              Order Diagnostic Tests
            </Button>
          </div>
        }
      />

      {/* Critical STAT Alert Banner if unacknowledged */}
      {criticalReports.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-600 rounded-r-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                  CRITICAL VALUE ALERT: Immediate Review Required
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  {criticalReports.length} STAT Case(s)
                </span>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                Pathology has released test results exceeding safety thresholds. Clinical acknowledgement is required by healthcare protocol.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/reports')}
            className="shrink-0"
          >
            Review STAT Queue
          </Button>
        </div>
      )}

      {/* High-Level Clinical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Critical Alerts"
          value={criticalReports.length}
          subtitle="Unacknowledged lab values"
          icon={AlertTriangle}
          color="rose"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Pending Reports"
          value={pendingReviewReports.length}
          subtitle="Ready for clinical sign-off"
          icon={FileCheck2}
          color="amber"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Today's Schedule"
          value={appointments.length}
          subtitle="2 Teleconsults, 1 In-clinic"
          icon={Calendar}
          color="teal"
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          title="Active Orders"
          value={prescriptions.length}
          subtitle="Diagnostic requisitions active"
          icon={Stethoscope}
          color="blue"
          onClick={() => navigate('/prescriptions')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Critical Values & Pending Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Value Action Queue */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Critical Value Action Queue
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Live Hospital Feed</span>
              </div>
            }
          >
            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No reports loaded.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.slice(0, 3).map((rep) => (
                  <div key={rep.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {rep.patientName}
                        </span>
                        <span className="text-[11px] text-slate-400">({rep.age}y / {rep.gender})</span>
                        <StatusBadge status={rep.status} />
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {rep.testPanel} • <span className="font-mono text-slate-400">{rep.sampleId}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Reported: {rep.reportingDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rep.status === 'CRITICAL' && !rep.criticalAcknowledged ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleAcknowledge(rep.id)}
                        >
                          Acknowledge STAT
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={FileText}
                          onClick={() => navigate(`/reports/${rep.id}`)}
                        >
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Orders Overview */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent Diagnostic Requisitions
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/prescriptions')}
                >
                  View All Orders →
                </Button>
              </div>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prescriptions.map((p) => {
                const pat = patients.find((pt) => pt.id === p.patientId);
                return (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          Order #{p.id}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Patient: <span className="font-medium text-slate-700 dark:text-slate-300">{pat?.name || `Patient #${p.patientId}`}</span>
                      </div>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">
                        Tests: {p.tests ? (Array.isArray(p.tests) ? p.tests.join(', ') : p.tests) : 'Comprehensive Panel'}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Col: Today's Appointments & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Today's Appointments */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today&apos;s Schedule
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                  {appointments.length} Consults
                </span>
              </div>
            }
          >
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {apt.patientName}
                    </span>
                    <span className="text-xs font-semibold text-teal-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {apt.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>{apt.type}</span>
                    <StatusBadge status={apt.status} />
                  </div>
                  {apt.type === 'Teleconsultation' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Video}
                        onClick={() => navigate('/teleconsult')}
                      >
                        Start Call
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Clinical Shortcuts */}
          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h3>}>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/order')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>New Diagnostic Requisition</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/notes')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Document Encounter Notes</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/patients')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Search Patient Longitudinal EMR</span>
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  FileText,
  Activity,
  Calendar,
  AlertTriangle,
  Stethoscope,
  Clock,
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { PageHeader, Tabs } from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { LoadingState, EmptyState } from '../components/ui/FeedbackStates';
import { clinicalApi } from '../services/api';

export default function Emr() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patientId = id ? Number(id) : 5; // Default to Rajesh Verma if /emr root

  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('labs');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setIsLoading(true);
    try {
      const p = await clinicalApi.getPatientById(patientId);
      const allReports = await clinicalApi.getReports();
      const allRx = await clinicalApi.getPrescriptions();
      const allNotes = await clinicalApi.getClinicalNotes(patientId);

      setPatient(p);
      setReports(allReports.filter((r) => r.patientId === patientId));
      setPrescriptions(allRx.filter((r) => r.patientId === patientId));
      setNotes(allNotes);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading patient health record..." />;
  if (!patient) return <EmptyState title="Patient not found" description="The requested patient ID was not located in the clinical database." />;

  const tabs = [
    { id: 'labs', label: 'Diagnostic Reports', count: reports.length, icon: FileText },
    { id: 'orders', label: 'Orders & Requisitions', count: prescriptions.length, icon: Stethoscope },
    { id: 'notes', label: 'Clinical Encounter Notes', count: notes.length, icon: Activity },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/patients')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Patient Directory
        </button>
      </div>

      {/* Patient Clinical Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {patient.name}
                </h2>
                <Badge variant="primary">ID #{patient.id}</Badge>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
                  Blood Group: {patient.bloodGroup}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {patient.age} Years • {patient.gender} • Phone: {patient.phone} • Email: {patient.email}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>ABHA ID: <span className="font-semibold text-slate-900 dark:text-white">{patient.abhaId}</span></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={Calendar}
              onClick={() => navigate('/appointments')}
            >
              Schedule Consult
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Stethoscope}
              onClick={() => navigate(`/order?patientId=${patient.id}`)}
            >
              Order Lab Test
            </Button>
          </div>
        </div>

        {/* Clinical Flags Bar */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Allergies</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {patient.allergies?.map((a, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900">
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Chronic Conditions</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {patient.chronicConditions?.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-900">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Residential Address</span>
            <span className="mt-1 block text-slate-700 dark:text-slate-300 truncate">{patient.address}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Diagnostic Reports */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <EmptyState
              title="No diagnostic reports on record"
              description="No authorized pathology or radiology reports exist for this patient yet."
              actionText="Order Diagnostic Test"
              onAction={() => navigate(`/order?patientId=${patient.id}`)}
            />
          ) : (
            reports.map((rep) => (
              <Card
                key={rep.id}
                header={
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {rep.testPanel}
                        </h3>
                        <StatusBadge status={rep.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sample #{rep.sampleId} • Reported on {rep.reportingDate} • Verified by {rep.verifiedBy}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/reports/${rep.id}`)}
                    >
                      View Official Report →
                    </Button>
                  </div>
                }
              >
                {/* Result Parameters Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Test Parameter</th>
                        <th className="px-3 py-2">Observed Result</th>
                        <th className="px-3 py-2">Reference Range</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2">Clinical Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rep.results?.map((res, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                            {res.parameter}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                            {res.value}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 font-mono">
                            {res.refRange}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">{res.unit}</td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                res.status === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                                  : res.status === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : res.status === 'LOW'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rep.interpretation && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Pathologist Impression:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-300">{rep.interpretation}</span>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Orders & Requisitions */}
      {activeTab === 'orders' && (
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Requisition History</h3>}>
          {prescriptions.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No previous orders for this patient.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Order #{rx.id}
                      </span>
                      <StatusBadge status={rx.status} />
                    </div>
                    <p className="text-xs text-teal-600 font-medium mt-0.5">
                      {Array.isArray(rx.tests) ? rx.tests.join(', ') : rx.tests}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Created: {new Date(rx.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Clinical Notes */}
      {activeTab === 'notes' && (
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Encounter Notes</h3>}>
          {notes.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No encounter notes logged yet.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((n) => (
                <div key={n.id} className="p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{n.diagnosis}</span>
                    <span className="text-[11px] text-slate-400">{n.date} • {n.doctor}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{n.content}</p>
                  {n.prescriptions && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] font-semibold text-slate-500">Rx Prescribed:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {n.prescriptions.map((p, idx) => (
                          <Badge key={idx} variant="primary" size="sm">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { PageHeader, Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/Modal';
import { clinicalApi } from '../services/api';

export default function Reports() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showAcknowledgeDialog, setShowAcknowledgeDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (id && reports.length > 0) {
      const rep = reports.find((r) => r.id === id);
      if (rep) setActiveReport(rep);
    }
  }, [id, reports]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await clinicalApi.getReports();
      setReports(data);
      if (id) {
        const found = data.find((r) => r.id === id);
        if (found) setActiveReport(found);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!activeReport) return;
    setIsProcessing(true);
    try {
      await clinicalApi.acknowledgeCriticalResult(activeReport.id);
      await clinicalApi.markReportReviewed(activeReport.id);
      setShowAcknowledgeDialog(false);
      await loadReports();
      const updated = await clinicalApi.getReportById(activeReport.id);
      setActiveReport(updated);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterTab === 'CRITICAL') return r.status === 'CRITICAL';
    if (filterTab === 'UNREVIEWED') return !r.reviewedByDoctor;
    if (filterTab === 'VERIFIED') return r.status === 'VERIFIED';
    return true;
  });

  const tabs = [
    { id: 'ALL', label: 'All Reports', count: reports.length },
    { id: 'CRITICAL', label: 'STAT Critical', count: reports.filter((r) => r.status === 'CRITICAL').length },
    { id: 'UNREVIEWED', label: 'Pending Review', count: reports.filter((r) => !r.reviewedByDoctor).length },
    { id: 'VERIFIED', label: 'Normal / Verified', count: reports.filter((r) => r.status === 'VERIFIED').length },
  ];

  const columns = [
    {
      key: 'id',
      label: 'Report ID & Sample',
      render: (val, r) => (
        <div>
          <span className="font-mono font-semibold text-slate-900 dark:text-white block">{val}</span>
          <span className="text-[11px] text-slate-400 font-mono">Sample: {r.sampleId}</span>
        </div>
      ),
    },
    {
      key: 'patientName',
      label: 'Patient',
      render: (val, r) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">{val}</span>
          <span className="text-[11px] text-slate-400">{r.age} yrs • {r.gender}</span>
        </div>
      ),
    },
    {
      key: 'testPanel',
      label: 'Diagnostic Panel',
      render: (val) => <span className="font-medium text-xs text-teal-600 dark:text-teal-400">{val}</span>,
    },
    {
      key: 'reportingDate',
      label: 'Released At',
      render: (val) => <span className="text-xs text-slate-500 font-mono">{val}</span>,
    },
    {
      key: 'status',
      label: 'Clinical State',
      render: (val, r) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={val} />
          {r.status === 'CRITICAL' && !r.criticalAcknowledged && (
            <span className="text-[10px] font-bold text-rose-600 animate-pulse">Awaiting STAT Ack</span>
          )}
          {r.reviewedByDoctor && (
            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Reviewed
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Inspect',
      sortable: false,
      render: (_, r) => (
        <Button
          variant={r.status === 'CRITICAL' && !r.criticalAcknowledged ? 'danger' : 'outline'}
          size="sm"
          onClick={() => setActiveReport(r)}
        >
          {r.status === 'CRITICAL' && !r.criticalAcknowledged ? 'Acknowledge STAT' : 'Inspect'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Diagnostic Laboratory Reports"
        subtitle="Review certified pathology and radiology results, acknowledge critical values, and audit patient records."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Reports' }]}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={filterTab} onChange={setFilterTab} />

      {/* Main Grid: Table on left, Report Inspector on right if selected */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={activeReport ? 'lg:col-span-6' : 'lg:col-span-12'}>
          <DataTable
            columns={columns}
            data={filteredReports}
            searchKey="patientName"
            searchPlaceholder="Search by patient name or report ID..."
            isLoading={isLoading}
            onRowClick={(r) => setActiveReport(r)}
          />
        </div>

        {activeReport && (
          <div className="lg:col-span-6 animate-fade-in">
            <Card
              className="sticky top-6"
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Report: {activeReport.id}
                    </h3>
                    <StatusBadge status={activeReport.status} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Printer}
                      onClick={() => window.print()}
                    >
                      Print
                    </Button>
                    <button
                      onClick={() => setActiveReport(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              }
            >
              <div className="space-y-4">
                {/* Header Information */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Patient</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeReport.patientName}</span>
                    <span className="text-slate-500 block">{activeReport.age}y / {activeReport.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Accreditation</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> NABL Accredited
                    </span>
                    <span className="text-slate-500 text-[11px] block">Cert #NABL-MD-8812</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Ordered By</span>
                    <span className="text-slate-700 dark:text-slate-300">{activeReport.orderedBy}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Pathologist Verification</span>
                    <span className="text-slate-700 dark:text-slate-300">{activeReport.verifiedBy}</span>
                  </div>
                </div>

                {/* Critical Alert Warning if applicable */}
                {activeReport.status === 'CRITICAL' && (
                  <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                    activeReport.criticalAcknowledged
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                  }`}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      {activeReport.criticalAcknowledged ? (
                        <div>
                          <span className="font-bold block">STAT Critical Result Acknowledged</span>
                          <span className="text-[11px]">Reviewed and acknowledged by Dr. Smith.</span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold block">ACTION REQUIRED: STAT Critical Lab Result</span>
                          <span className="text-[11px]">Values in this report fall within critical panic limits. Please review and acknowledge.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Parameters Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Parameter</th>
                        <th className="px-3 py-2">Result</th>
                        <th className="px-3 py-2">Ref. Range</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeReport.results?.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                            {r.parameter}
                          </td>
                          <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">
                            {r.value}
                          </td>
                          <td className="px-3 py-2 text-slate-500 font-mono">{r.refRange}</td>
                          <td className="px-3 py-2 text-slate-500">{r.unit}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                r.status === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : r.status === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : r.status === 'LOW'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {activeReport.interpretation && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs border border-slate-200/80 dark:border-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                      Clinical Pathology Impression:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {activeReport.interpretation}
                    </p>
                  </div>
                )}

                {/* Review / Acknowledgement Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    Status: <span className="font-semibold text-slate-900 dark:text-white">{activeReport.reviewedByDoctor ? 'Clinically Reviewed' : 'Pending Review'}</span>
                  </div>
                  {!activeReport.reviewedByDoctor && (
                    <Button
                      variant={activeReport.status === 'CRITICAL' ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => setShowAcknowledgeDialog(true)}
                    >
                      {activeReport.status === 'CRITICAL' ? 'Acknowledge Critical Result' : 'Mark as Reviewed'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showAcknowledgeDialog}
        onClose={() => setShowAcknowledgeDialog(false)}
        onConfirm={handleAcknowledge}
        title="Clinical Result Review Confirmation"
        message={`Confirming will log your digital clinician signature for ${activeReport?.patientName}'s ${activeReport?.testPanel} report. This action is permanently audited in hospital EMR.`}
        confirmText="Sign & Acknowledge"
        isLoading={isProcessing}
      />
    </div>
  );
}

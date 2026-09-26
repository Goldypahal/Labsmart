import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { patientApi } from '../services/api';

export default function Reports() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    patientApi.getReports().then((all) => {
      setReports(all);
      if (id) {
        const found = all.find((r) => r.id === id);
        if (found) setSelectedReport(found);
      } else if (all.length > 0) {
        setSelectedReport(all[0]);
      }
    });
  }, [id]);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <PageHeader
        title="My Diagnostic Lab Reports"
        subtitle="Chronological medical reports with structured parameter breakdowns and clinician guidance."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Download / Print Official PDF
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Available Reports</h3>}>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-3.5 cursor-pointer rounded-xl transition-all ${
                    selectedReport?.id === rep.id
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border border-teal-500 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{rep.testPanel}</span>
                    <StatusBadge status={rep.status} />
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Reported on {rep.reportingDate}
                  </span>
                  <span className="text-[11px] text-teal-600 font-mono block mt-0.5">
                    {rep.id}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Structured Report Detail (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedReport && (
            <Card
              header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedReport.testPanel}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Report #{selectedReport.id} • Sample #{selectedReport.sampleId}
                    </p>
                  </div>
                  <StatusBadge status={selectedReport.status} />
                </div>
              }
            >
              <div className="space-y-6">
                {/* Clinician Review Context Banner */}
                <div className="p-3.5 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-xl text-xs flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-teal-950 dark:text-teal-200 block">
                      Certified Pathology Results
                    </span>
                    <p className="text-teal-800 dark:text-teal-300 leading-relaxed">
                      Authorized by {selectedReport.verifiedBy}. Clinician Dr. Smith has reviewed these findings. Interpretation is provided for consultation context.
                    </p>
                  </div>
                </div>

                {/* Parameters Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3.5 py-2.5">Biomarker</th>
                        <th className="px-3.5 py-2.5">Your Value</th>
                        <th className="px-3.5 py-2.5">Healthy Biological Range</th>
                        <th className="px-3.5 py-2.5">Unit</th>
                        <th className="px-3.5 py-2.5">Result Indicator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedReport.results?.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-3.5 py-3 font-semibold text-slate-900 dark:text-white">
                            {res.parameter}
                          </td>
                          <td className="px-3.5 py-3 font-bold text-slate-900 dark:text-white text-sm">
                            {res.value}
                          </td>
                          <td className="px-3.5 py-3 text-slate-500 font-mono">
                            {res.refRange}
                          </td>
                          <td className="px-3.5 py-3 text-slate-500">{res.unit}</td>
                          <td className="px-3.5 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                res.status === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : res.status === 'HIGH' || res.status === 'LOW'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {res.status === 'NORMAL' ? 'Normal / Healthy' : res.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Doctor's Clinical Note */}
                {selectedReport.interpretation && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Doctor&apos;s Clinical Assessment:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedReport.interpretation}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

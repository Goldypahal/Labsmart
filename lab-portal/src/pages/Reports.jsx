import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { labApi } from '../services/api';

export default function Reports() {
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    labApi.getSamples().then((all) => {
      setSamples(all);
      if (all.length > 0) setSelectedSample(all[0]);
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Official Certified Medical Reports"
        subtitle="NABL-accredited diagnostic report generation, QR verification code, and electronic distribution."
        breadcrumbs={[{ label: 'LIMS Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print / Save PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Released Lab Reports</h3>}>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {samples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSample(s)}
                  className={`p-3 cursor-pointer rounded-lg transition-colors ${
                    selectedSample?.id === s.id
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border border-teal-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{s.id}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mt-1">
                    {s.patientName}
                  </span>
                  <span className="text-[11px] text-teal-600 block">{s.testPanel}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: High-fidelity Medical Report Template (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedSample && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header Letterhead */}
              <div className="border-b-2 border-teal-600 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    CITY CENTRAL DIAGNOSTIC HOSPITAL & PATHOLOGY
                  </h2>
                  <p className="text-xs text-slate-500">
                    Main Road, Indiranagar, Bengaluru - 560038 • Ph: +91 80 2345 6789
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> NABL Accredited Laboratory (ISO 15189:2022)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Reg #MED-BLR-88421</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="w-16 h-16 border-2 border-slate-300 dark:border-slate-700 rounded-lg p-1.5 flex items-center justify-center ml-auto">
                    <QrCode className="w-full h-full text-slate-800 dark:text-slate-200" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">Scan for Authentic EMR</span>
                </div>
              </div>

              {/* Patient & Requisition Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Patient Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedSample.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Age / Gender</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedSample.age} Yrs / {selectedSample.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Sample Barcode</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedSample.accessionNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Collection Date</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedSample.collectionTime}</span>
                </div>
              </div>

              {/* Parameter Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                  DEPARTMENT OF {selectedSample.testPanel.toUpperCase()}
                </h4>
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2">Test Parameter</th>
                      <th className="py-2">Observed Result</th>
                      <th className="py-2">Biological Reference Interval</th>
                      <th className="py-2">Units</th>
                      <th className="py-2">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedSample.results && selectedSample.results.length > 0 ? (
                      selectedSample.results.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{r.parameter}</td>
                          <td className="py-2 font-bold text-slate-900 dark:text-white">{r.value}</td>
                          <td className="py-2 text-slate-500 font-mono">{r.refRange}</td>
                          <td className="py-2 text-slate-500">{r.unit}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                r.status === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : r.status === 'HIGH' || r.status === 'LOW'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          Parameters pending technical validation.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pathologist Notes & Interpretation */}
              {selectedSample.pathologistNotes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    Clinical Pathologist Interpretation:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedSample.pathologistNotes}
                  </p>
                </div>
              )}

              {/* Sign-off Footer */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Analyzed using Automated Photometry / Flow Cytometry</span>
                  <span className="text-slate-500">Report Generated on {new Date().toLocaleString()}</span>
                </div>
                <div className="text-right">
                  {/* Signatory comes from the authorizing doctor's record (FR-051); never a hardcoded name. */}
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {selectedSample.verifiedBy || 'Not yet authorized'}
                  </span>
                  <span className="text-slate-400 text-[10px]">Authorized signatory</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

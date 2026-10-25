import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Clock,
  Printer,
  Edit3,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/Modal';
import { labApi } from '../services/api';

export default function Verification() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    const all = await labApi.getSamples();
    setSamples(all);
    if (!selectedSample && all.length > 0) {
      setSelectedSample(all[0]);
    }
  };

  const handleAuthorize = async () => {
    if (!selectedSample) return;
    setIsAuthorizing(true);
    try {
      setAuthError('');
      await labApi.verifyAndReleaseReport(selectedSample.id);
      setShowConfirm(false);
      await loadSamples();
      const updated = await labApi.getSampleById(selectedSample.id);
      setSelectedSample(updated);
    } catch (err) {
      setShowConfirm(false);
      setAuthError(err.message || 'Authorization failed. Nothing was released.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pathologist Verification & Digital Authorization"
        subtitle="Mandatory second-review sign-off for critical and released medical diagnostic reports."
        breadcrumbs={[{ label: 'LIMS Dashboard', href: '/dashboard' }, { label: 'Verification' }]}
      />

      {authError && (
        <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl text-xs">
          {authError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Specimen Verification List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Authorization Queue</h3>}>
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
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {s.id}
                    </span>
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

        {/* Right Column: Specimen Review Sheet (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedSample ? (
            <Card
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Review Sheet: {selectedSample.id}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        {selectedSample.patientName} • {selectedSample.testPanel}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={selectedSample.status} />
                </div>
              }
            >
              <div className="space-y-5">
                {/* Specimen Metadata Banner */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Barcode</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {selectedSample.accessionNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Intake Time</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {selectedSample.collectionTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] block">Verified By</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {selectedSample.verifiedBy || 'Pending Sign-off'}
                    </span>
                  </div>
                </div>

                {/* Results Table */}
                {selectedSample.results && selectedSample.results.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-3 py-2.5">Parameter</th>
                          <th className="px-3 py-2.5">Result</th>
                          <th className="px-3 py-2.5">Reference Range</th>
                          <th className="px-3 py-2.5">Unit</th>
                          <th className="px-3 py-2.5">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedSample.results.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{r.parameter}</td>
                            <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{r.value}</td>
                            <td className="px-3 py-2 text-slate-500 font-mono">{r.refRange}</td>
                            <td className="px-3 py-2 text-slate-500">{r.unit}</td>
                            <td className="px-3 py-2">
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No results recorded for this specimen yet.{' '}
                    <button
                      onClick={() => navigate(`/results?sampleId=${selectedSample.id}`)}
                      className="text-teal-600 font-bold underline"
                    >
                      Enter Results Now
                    </button>
                  </p>
                )}

                {/* Pathologist Notes */}
                {selectedSample.pathologistNotes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                      Technician & Pathologist Clinical Notes:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">{selectedSample.pathologistNotes}</p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Audit Status: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSample.lifecycle}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/results?sampleId=${selectedSample.id}`)}
                    >
                      Edit Entries
                    </Button>
                    {selectedSample.lifecycle !== 'RELEASED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => setShowConfirm(true)}
                        disabled={!selectedSample.resultsEntered}
                      >
                        Authorize & Release Report
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <p className="text-xs text-slate-500">Select a specimen from the queue to verify.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleAuthorize}
        title="Pathologist Electronic Sign-Off Confirmation"
        message={`Authorize and digitally sign diagnostic test results for ${selectedSample?.patientName}? This releases the official medical report to clinician Dr. Smith and the patient portal.`}
        confirmText="Authorize & Sign"
        isLoading={isAuthorizing}
      />
    </div>
  );
}

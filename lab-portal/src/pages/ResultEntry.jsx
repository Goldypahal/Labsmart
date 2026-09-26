import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Check,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { labApi } from '../services/api';

export default function ResultEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedSampleId = searchParams.get('sampleId');

  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(preSelectedSampleId || '');
  const [values, setValues] = useState({});
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const catalog = labApi.getTestCatalog();

  useEffect(() => {
    labApi.getSamples().then((allSamples) => {
      setSamples(allSamples);
      const chosen = preSelectedSampleId || (allSamples.length > 0 ? allSamples[0].id : '');
      setSelectedSampleId(chosen);
      loadSampleValues(chosen, allSamples);
    });
  }, [preSelectedSampleId]);

  const loadSampleValues = (sId, allSamples) => {
    const s = allSamples.find((item) => item.id === sId);
    if (s && s.results && s.results.length > 0) {
      const v = {};
      s.results.forEach((r) => {
        v[r.parameter] = r.value;
      });
      setValues(v);
      setTechnicianNotes(s.pathologistNotes || '');
    } else {
      // Clear or set defaults
      setValues({});
      setTechnicianNotes('');
    }
  };

  const handleSampleChange = (id) => {
    setSelectedSampleId(id);
    loadSampleValues(id, samples);
  };

  const currentSample = samples.find((s) => s.id === selectedSampleId);

  // Match test panel in catalog
  const currentPanel = catalog.find(
    (p) => currentSample && currentSample.testPanel.toLowerCase().includes(p.category.toLowerCase()) ||
           currentSample && currentSample.testPanel.toLowerCase().includes(p.id.toLowerCase())
  ) || catalog[0]; // fallback to CBC if not matched

  const handleInputChange = (paramName, val) => {
    setValues((prev) => ({ ...prev, [paramName]: val }));
  };

  const getFlag = (param, val) => {
    if (val === undefined || val === '') return null;
    const num = parseFloat(val);
    if (isNaN(num)) return null;

    if (param.criticalLow !== undefined && num <= param.criticalLow) return 'CRITICAL';
    if (param.criticalHigh !== undefined && num >= param.criticalHigh) return 'CRITICAL';
    if (num < param.min) return 'LOW';
    if (num > param.max) return 'HIGH';
    return 'NORMAL';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentSample) return;

    setIsSaving(true);
    try {
      const formattedResults = currentPanel.parameters.map((p) => {
        const val = values[p.name] !== undefined ? values[p.name] : (p.min + (p.max - p.min) / 2).toFixed(1);
        const flag = getFlag(p, val) || 'NORMAL';
        return {
          parameter: p.name,
          value: parseFloat(val) || val,
          unit: p.unit,
          refRange: `${p.min} - ${p.max}`,
          status: flag,
        };
      });

      await labApi.saveTestResults(currentSample.id, formattedResults, technicianNotes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Diagnostic Laboratory Result Entry Workbench"
        subtitle="Structured parameter input, automated biological range validation, and clinical panic flagging."
        breadcrumbs={[{ label: 'LIMS Dashboard', href: '/dashboard' }, { label: 'Result Entry' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => loadSampleValues(selectedSampleId, samples)}
            >
              Reset Entries
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSave}
              icon={Save}
            >
              Save & Transmit for Verification
            </Button>
          </div>
        }
      />

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Results successfully recorded and queued for Pathologist Verification.</span>
        </div>
      )}

      {/* Active Specimen Selector */}
      <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Accession Specimen</h3>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Sample from Accession Queue
            </label>
            <select
              value={selectedSampleId}
              onChange={(e) => handleSampleChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            >
              {samples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} ({s.accessionNumber}) — {s.patientName} [{s.testPanel}]
                </option>
              ))}
            </select>
          </div>

          {currentSample && (
            <>
              <div>
                <span className="text-slate-400 block uppercase text-[10px]">Patient Record</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {currentSample.patientName}
                </span>
                <span className="text-slate-500">
                  {currentSample.age}y / {currentSample.gender} • ID #{currentSample.patientId}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block uppercase text-[10px]">Tube & Priority</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">
                  {currentSample.specimen}
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatusBadge status={currentSample.priority} />
                  <StatusBadge status={currentSample.status} />
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Parameter Entry Table */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentPanel.name}
              </h3>
            </div>
            <Badge variant="primary">{currentPanel.category}</Badge>
          </div>
        }
      >
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Parameter Name</th>
                <th className="px-4 py-3">Observed Value</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Biological Reference Range</th>
                <th className="px-4 py-3">Clinical Severity Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentPanel.parameters.map((param, idx) => {
                const val = values[param.name] ?? '';
                const flag = getFlag(param, val);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {param.name}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={val}
                        onChange={(e) => handleInputChange(param.name, e.target.value)}
                        placeholder={`${param.min} - ${param.max}`}
                        className={`w-32 px-3 py-1.5 text-xs font-bold font-mono rounded-lg border focus:ring-2 focus:ring-teal-500 ${
                          flag === 'CRITICAL'
                            ? 'bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                            : flag === 'HIGH' || flag === 'LOW'
                            ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{param.unit}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">
                      {param.min} - {param.max}
                    </td>
                    <td className="px-4 py-3">
                      {flag && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            flag === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                              : flag === 'HIGH' || flag === 'LOW'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {flag}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Technician Notes */}
        <div className="mt-4 space-y-1.5 text-xs">
          <label className="block font-semibold text-slate-700 dark:text-slate-300">
            Technician Observation & Quality Notes
          </label>
          <textarea
            rows={2}
            value={technicianNotes}
            onChange={(e) => setTechnicianNotes(e.target.value)}
            placeholder="e.g. Sample clear, no hemolysis observed. Calibration checked with Control Lot #8812."
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
          />
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Stethoscope,
  Search,
  Check,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { clinicalApi } from '../services/api';

export default function OrderTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatientId || '');
  const [selectedTests, setSelectedTests] = useState([]);
  const [priority, setPriority] = useState('Routine');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [testSearch, setTestSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const catalog = clinicalApi.getTestCatalog();

  useEffect(() => {
    clinicalApi.getPatients().then((pts) => {
      setPatients(pts);
      if (!selectedPatientId && pts.length > 0) {
        setSelectedPatientId(String(pts[0].id));
      }
    });
  }, [selectedPatientId]);

  const toggleTest = (testName) => {
    setSelectedTests((prev) =>
      prev.includes(testName)
        ? prev.filter((t) => t !== testName)
        : [...prev, testName]
    );
  };

  const filteredCatalog = catalog.filter((test) =>
    test.name.toLowerCase().includes(testSearch.toLowerCase()) ||
    test.id.toLowerCase().includes(testSearch.toLowerCase()) ||
    test.category.toLowerCase().includes(testSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || selectedTests.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await clinicalApi.createDiagnosticOrder({
        patientId: Number(selectedPatientId),
        tests: selectedTests,
        priority,
        clinicalNotes: clinicalIndication,
      });
      setSubmittedOrder(res);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPatient = patients.find((p) => String(p.id) === String(selectedPatientId));

  if (submittedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6 animate-scale-up text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Diagnostic Requisition Submitted
          </h2>
          <p className="text-sm text-slate-500">
            Order #{submittedOrder.id} has been transmitted to City Central Laboratory (LIMS).
          </p>
        </div>

        <Card className="text-left max-w-md mx-auto">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Patient:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{selectedPatient?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Priority:</span>
              <span className={`font-bold ${submittedOrder.priority === 'STAT' ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                {submittedOrder.priority || priority}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Tests ({selectedTests.length}):</span>
              <span className="font-semibold text-teal-600 text-right">{selectedTests.join(', ')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Sample Intake:</span>
              <span className="text-slate-600 dark:text-slate-300">Specimen Barcode Pending</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmittedOrder(null);
              setSelectedTests([]);
              setClinicalIndication('');
            }}
          >
            Create Another Order
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/prescriptions')}
          >
            View Active Orders →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Diagnostic Test Requisition"
        subtitle="Select patient, configure test panels, and submit orders directly to Pathology."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Order Test' }]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Patient Selection */}
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Select Patient</h3>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Patient Record
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}y, {p.gender}) — ABHA: {p.abhaId}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-teal-900 dark:text-teal-200">Patient Snapshot</span>
                <p className="text-teal-800 dark:text-teal-300">
                  Blood Group: <span className="font-bold">{selectedPatient.bloodGroup}</span> • Phone: {selectedPatient.phone}
                </p>
                <p className="text-teal-700 dark:text-teal-400">
                  Known Allergies: {selectedPatient.allergies?.join(', ') || 'None reported'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Step 2: Test Catalog Selection */}
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Select Diagnostic Panels ({selectedTests.length} selected)
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter catalog..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCatalog.map((test) => {
              const isSelected = selectedTests.includes(test.name);
              return (
                <div
                  key={test.id}
                  onClick={() => toggleTest(test.name)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {test.name}
                      </span>
                      <Badge variant="primary" size="sm">
                        {test.category}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                      <span>Sample: {test.sampleType}</span>
                      <span>• TAT: {test.tatHours}h</span>
                      {test.fastingRequired && (
                        <span className="text-amber-600 font-medium">⚠️ 12h Fasting</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Step 3: Priority & Clinical Indication */}
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Priority & Clinical Indication</h3>}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Order Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Routine', label: 'Routine', desc: 'Standard turnaround (4-8 hours)' },
                  { id: 'Urgent', label: 'Urgent', desc: 'Expedited processing (< 2 hours)' },
                  { id: 'STAT', label: 'STAT / Emergency', desc: 'Immediate priority processing (< 45 min)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      priority === p.id
                        ? p.id === 'STAT'
                          ? 'bg-rose-50 border-rose-500 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200'
                          : 'bg-teal-50 border-teal-600 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{p.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Clinical Indication & Instructions for Laboratory
              </label>
              <textarea
                rows={3}
                value={clinicalIndication}
                onChange={(e) => setClinicalIndication(e.target.value)}
                placeholder="e.g. Suspected metabolic syndrome, baseline assessment prior to lipid-lowering therapy..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500">
            Selected: <span className="font-bold text-slate-900 dark:text-white">{selectedTests.length} tests</span> for{' '}
            <span className="font-bold text-teal-600">{selectedPatient?.name}</span>
          </div>
          <Button
            type="submit"
            variant={priority === 'STAT' ? 'danger' : 'primary'}
            size="md"
            isLoading={isSubmitting}
            disabled={selectedTests.length === 0}
            icon={Stethoscope}
          >
            Submit Diagnostic Requisition
          </Button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { labApi } from '../services/api';

export default function Orders() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [backendOrders, setBackendOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessionModal, setShowAccessionModal] = useState(false);

  // Accession form state
  const [patientName, setPatientName] = useState('Rajesh Verma');
  const [patientId, setPatientId] = useState(5);
  const [testPanel, setTestPanel] = useState('Complete Blood Count (CBC)');
  const [specimen, setSpecimen] = useState('Whole Blood (Lavender EDTA Tube)');
  const [priority, setPriority] = useState('Routine');
  const [isAccessioning, setIsAccessioning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, o] = await Promise.all([labApi.getSamples(), labApi.getOrders()]);
      setSamples(s);
      setBackendOrders(o);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessionSubmit = async (e) => {
    e.preventDefault();
    setIsAccessioning(true);
    try {
      await labApi.createAccession({
        patientName,
        patientId: Number(patientId),
        age: 58,
        gender: 'Male',
        testPanel,
        specimen,
        priority,
      });
      setShowAccessionModal(false);
      await loadData();
    } finally {
      setIsAccessioning(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Sample ID & Barcode',
      render: (val, s) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white block">{val}</span>
          <span className="text-[11px] text-teal-600 font-mono flex items-center gap-1">
            <QrCode className="w-3 h-3" /> {s.accessionNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'patientName',
      label: 'Patient',
      render: (val, s) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">{val}</span>
          <span className="text-[11px] text-slate-400">ID #{s.patientId} • {s.age}y / {s.gender}</span>
        </div>
      ),
    },
    {
      key: 'testPanel',
      label: 'Ordered Panel',
      render: (val) => <span className="font-medium text-xs text-slate-800 dark:text-slate-200">{val}</span>,
    },
    {
      key: 'specimen',
      label: 'Specimen Tube',
      render: (val) => <span className="text-xs text-slate-600 dark:text-slate-400">{val}</span>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (val) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            val === 'STAT'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'lifecycle',
      label: 'Sample Lifecycle',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, s) => (
        <div className="flex items-center gap-2">
          {!s.resultsEntered ? (
            <Button
              variant="primary"
              size="sm"
              icon={FileSpreadsheet}
              onClick={() => navigate(`/results?sampleId=${s.id}`)}
            >
              Enter Results
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/verification')}
            >
              Verify Sign-off
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Specimen Accessioning & Intake Queue"
        subtitle="Barcoding, intake validation, and analytical pipeline queue."
        breadcrumbs={[{ label: 'LIMS Dashboard', href: '/dashboard' }, { label: 'Accessioning' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAccessionModal(true)}
          >
            Accession New Specimen
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={samples}
        searchKey="patientName"
        searchPlaceholder="Search samples by patient name or sample ID..."
        isLoading={isLoading}
      />

      {/* Accession Modal */}
      {showAccessionModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAccessionModal(false)}
          title="Accession Diagnostic Specimen"
          subtitle="Generate barcode accession number and assign laboratory processing tube."
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAccessionModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isAccessioning}
                onClick={handleAccessionSubmit}
              >
                Generate Barcode & Intake
              </Button>
            </>
          }
        >
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Patient Identity
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Test Panel
                </label>
                <select
                  value={testPanel}
                  onChange={(e) => setTestPanel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                  <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                  <option value="Kidney Function Test (KFT)">Kidney Function Test (KFT)</option>
                  <option value="Lipid Profile">Lipid Profile</option>
                  <option value="Thyroid Function Panel">Thyroid Function Panel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specimen Tube Type
                </label>
                <select
                  value={specimen}
                  onChange={(e) => setSpecimen(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Whole Blood (Lavender EDTA Tube)">Whole Blood (Lavender EDTA)</option>
                  <option value="Serum (Yellow SST Tube)">Serum (Yellow SST / Gold Top)</option>
                  <option value="Plasma (Grey Fluoride Tube)">Plasma (Grey Sodium Fluoride)</option>
                  <option value="Urine (Sterile Container)">Urine (Sterile Container)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPriority('Routine')}
                  className={`p-2.5 rounded-lg border text-xs font-bold ${
                    priority === 'Routine' ? 'bg-teal-50 border-teal-600 text-teal-800' : 'border-slate-200'
                  }`}
                >
                  Routine Intake
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('STAT')}
                  className={`p-2.5 rounded-lg border text-xs font-bold ${
                    priority === 'STAT' ? 'bg-rose-50 border-rose-600 text-rose-800' : 'border-slate-200'
                  }`}
                >
                  STAT Emergency Priority
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

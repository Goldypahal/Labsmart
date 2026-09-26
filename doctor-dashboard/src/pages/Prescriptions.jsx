import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { clinicalApi } from '../services/api';

export default function Prescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editTests, setEditTests] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rx, pts] = await Promise.all([
        clinicalApi.getPrescriptions(),
        clinicalApi.getPatients(),
      ]);
      setPrescriptions(rx);
      setPatients(pts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsUpdating(true);
    try {
      const testArray = editTests.split(',').map((t) => t.trim()).filter(Boolean);
      await clinicalApi.updatePrescription(editingOrder.id, testArray);
      setEditingOrder(null);
      await loadData();
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (val) => <span className="font-mono font-bold text-slate-900 dark:text-white">#{val}</span>,
    },
    {
      key: 'patientId',
      label: 'Patient',
      render: (val) => {
        const pt = patients.find((p) => p.id === val);
        return (
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">
              {pt ? pt.name : `Patient ID #${val}`}
            </span>
            {pt && <span className="text-[11px] text-slate-400">{pt.phone}</span>}
          </div>
        );
      },
    },
    {
      key: 'tests',
      label: 'Diagnostic Test Panel(s)',
      render: (tests) => {
        const list = Array.isArray(tests) ? tests : [tests];
        return (
          <div className="flex flex-wrap gap-1 max-w-sm">
            {list.map((t, idx) => (
              <Badge key={idx} variant="primary" size="sm">
                {t}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Requisition Date',
      render: (val) => (
        <span className="text-xs text-slate-500 font-mono">
          {val ? new Date(val).toLocaleDateString() : 'Today'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'LIMS Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, rx) => (
        <div className="flex items-center gap-2">
          {rx.status !== 'COMPLETED' && (
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => {
                setEditingOrder(rx);
                setEditTests(Array.isArray(rx.tests) ? rx.tests.join(', ') : rx.tests || '');
              }}
            >
              Modify
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Diagnostic Requisitions & Prescriptions"
        subtitle="Manage active orders dispatched to Central Laboratory (LIMS) and hospital pathology."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Prescriptions' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/order')}
          >
            New Requisition
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={prescriptions}
        searchKey="tests"
        searchPlaceholder="Search requisitions by test panel..."
        isLoading={isLoading}
      />

      {/* Edit Order Modal */}
      {editingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          title={`Modify Order #${editingOrder.id}`}
          subtitle="Update test panel names before specimen processing begins."
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingOrder(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isUpdating}
                onClick={handleUpdate}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Comma-separated Test Panels
              </label>
              <textarea
                rows={3}
                value={editTests}
                onChange={(e) => setEditTests(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                placeholder="e.g. Complete Blood Count, Lipid Profile"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Note: Once the laboratory begins processing or completes technical validation, orders cannot be changed.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

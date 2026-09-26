import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  FileText,
  Stethoscope,
  Activity,
  ChevronRight,
  Shield,
  Phone,
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { clinicalApi } from '../services/api';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await clinicalApi.getPatients();
      setPatients(data);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Patient Identification',
      render: (_, p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
            {p.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block hover:text-teal-600 transition-colors">
              {p.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ABHA: {p.abhaId || 'Not Linked'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'demographics',
      label: 'Age / Gender / Blood',
      render: (_, p) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {p.age} yrs • {p.gender || 'M'} • <span className="font-semibold text-rose-600">{p.bloodGroup || 'O+'}</span>
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Contact Information',
      render: (val, p) => (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{val || p.phone}</span>
          </div>
          <span className="text-[11px] text-slate-400 truncate block">{p.email}</span>
        </div>
      ),
    },
    {
      key: 'chronicConditions',
      label: 'Clinical Conditions',
      render: (conds) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {conds && conds.length > 0 ? (
            conds.map((c, i) => (
              <Badge key={i} variant="primary" size="sm">
                {c}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400">None reported</span>
          )}
        </div>
      ),
    },
    {
      key: 'lastVisit',
      label: 'Last Encounter',
      render: (val) => (
        <span className="text-xs text-slate-500 font-mono">{val || '2026-09-24'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, p) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/order?patientId=${p.id}`);
            }}
          >
            Order Test
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patients/${p.id}`);
            }}
          >
            View EMR →
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Patient Clinical Directory"
        subtitle="Search, inspect longitudinal records, and initiate diagnostic test orders."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Patients' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Stethoscope}
            onClick={() => navigate('/order')}
          >
            Create Diagnostic Order
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={patients}
        searchKey="name"
        searchPlaceholder="Search patients by name, phone, or ABHA ID..."
        isLoading={isLoading}
        onRowClick={(p) => navigate(`/patients/${p.id}`)}
      />
    </div>
  );
}

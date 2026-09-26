import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Activity, Wrench } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/Tabs';
import { Card, StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { labApi } from '../services/api';

export default function Quality() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    labApi.getQualityLogs().then((l) => {
      setLogs(l);
      setIsLoading(false);
    });
  }, []);

  const columns = [
    {
      key: 'id',
      label: 'QC Run ID',
      render: (val) => <span className="font-mono font-bold text-slate-900 dark:text-white">{val}</span>,
    },
    {
      key: 'instrument',
      label: 'Analyzer Instrument',
      render: (val) => <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>,
    },
    {
      key: 'test',
      label: 'Control Assays Run',
      render: (val) => <span className="text-xs text-teal-600">{val}</span>,
    },
    {
      key: 'deviation',
      label: 'Observed Deviation',
      render: (val) => <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{val}</span>,
    },
    {
      key: 'date',
      label: 'QC Timestamp',
      render: (val) => <span className="text-xs font-mono text-slate-500">{val}</span>,
    },
    {
      key: 'status',
      label: 'Control Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'technician',
      label: 'Validated By',
      render: (val) => <span className="text-xs text-slate-500">{val}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Quality Control (QC) & Analyzer Calibration"
        subtitle="Daily standard control runs, Westgard rules evaluation, and specimen rejection logs."
        breadcrumbs={[{ label: 'LIMS Dashboard', href: '/dashboard' }, { label: 'Quality Control' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Daily Westgard Status"
          value="Pass (1-2s)"
          subtitle="All control runs within tolerance"
          icon={ShieldCheck}
          color="teal"
        />
        <StatCard
          title="Rejected Specimens"
          value="0"
          subtitle="Zero hemolyzed/clotted samples"
          icon={AlertTriangle}
          color="blue"
        />
        <StatCard
          title="Calibration Score"
          value="99.8%"
          subtitle="NABL proficiency benchmark"
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchKey="instrument"
        searchPlaceholder="Search QC events by instrument..."
        isLoading={isLoading}
      />
    </div>
  );
}

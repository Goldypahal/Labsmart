import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, Download, CheckCircle2, Clock } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/Tabs';
import { Card, StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { labApi } from '../services/api';

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    labApi.getInvoices().then((inv) => {
      setInvoices(inv);
      setIsLoading(false);
    });
  }, []);

  const totalRevenue = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const columns = [
    {
      key: 'id',
      label: 'Invoice #',
      render: (val) => <span className="font-mono font-bold text-slate-900 dark:text-white">{val}</span>,
    },
    {
      key: 'patientName',
      label: 'Patient',
      render: (val) => <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>,
    },
    {
      key: 'test',
      label: 'Diagnostic Panel',
      render: (val) => <span className="text-xs text-teal-600">{val}</span>,
    },
    {
      key: 'amount',
      label: 'Amount (INR)',
      render: (val) => <span className="font-mono font-bold text-slate-900 dark:text-white">₹{val}</span>,
    },
    {
      key: 'mode',
      label: 'Payment Method',
      render: (val) => <span className="text-xs text-slate-500">{val}</span>,
    },
    {
      key: 'status',
      label: 'Settlement Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Receipt',
      sortable: false,
      render: () => (
        <Button variant="outline" size="sm" icon={Receipt}>
          Print Receipt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Diagnostic Invoicing & Reconciliation"
        subtitle="Manage billing transactions, cash receipts, and insurance settlements."
        breadcrumbs={[{ label: 'LIMS Dashboard', href: '/dashboard' }, { label: 'Billing' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Daily Settled"
          value={`₹${totalRevenue}`}
          subtitle="Reconciled to hospital accounts"
          icon={CreditCard}
          color="teal"
        />
        <StatCard
          title="Pending Settlement"
          value="₹500"
          subtitle="1 claim awaiting approval"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Audit Compliance"
          value="100%"
          subtitle="All transactions reconciled"
          icon={CheckCircle2}
          color="blue"
        />
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchKey="patientName"
        searchPlaceholder="Search invoices by patient or number..."
        isLoading={isLoading}
      />
    </div>
  );
}

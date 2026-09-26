import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Stethoscope,
  BarChart2,
  FileCheck2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card, StatCard } from '../components/ui/Card';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/FeedbackStates';
import Button from '../components/ui/Button';
import { clinicalApi } from '../services/api';

/**
 * Data-Driven Clinical Analytics
 *
 * Adheres strictly to Zero Fake Data Policy:
 * 1. Metrics derived strictly from real prescriptions, test orders, and registered patients.
 * 2. Displays "Insufficient Data" empty state when no records exist.
 * 3. Never displays fabricated satisfaction percentages or fake review scores.
 */
export default function Analytics() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rxData, ptData] = await Promise.all([
        clinicalApi.getPrescriptions(),
        clinicalApi.getPatients(),
      ]);
      setPrescriptions(Array.isArray(rxData) ? rxData : []);
      setPatients(Array.isArray(ptData) ? ptData : []);
    } catch (err) {
      setError(err?.message || 'Unable to retrieve clinical records.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Computing clinical analytics from verified records..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Clinical Operations Analytics"
          subtitle="Real-time operational metrics derived from authenticated clinical records."
        />
        <ErrorState
          title="Analytics Unavailable"
          message={error}
          actionLabel="Retry"
          onAction={loadData}
        />
      </div>
    );
  }

  const totalPrescriptions = prescriptions.length;
  const pendingOrders = prescriptions.filter((p) => p.status === 'PENDING').length;
  const completedOrders = prescriptions.filter((p) => p.status === 'COMPLETED').length;
  const totalPatients = patients.length;

  // Calculate real test distribution from authentic prescriptions
  const testCounts = {};
  prescriptions.forEach((rx) => {
    if (Array.isArray(rx.tests)) {
      rx.tests.forEach((test) => {
        testCounts[test] = (testCounts[test] || 0) + 1;
      });
    }
  });

  const testDistribution = Object.entries(testCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalPrescriptions > 0 ? Math.round((count / totalPrescriptions) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Departmental Clinical Analytics"
        subtitle="Audited operational metrics, diagnostic requisition volumes, and order fulfillment derived from backend records."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Analytics' }]}
      />

      {totalPrescriptions === 0 && totalPatients === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart2}
            title="Insufficient Data"
            description="Clinical analytics and diagnostic volume metrics will appear here once patient prescriptions and test orders are recorded in the hospital system."
            actionLabel="Order Diagnostic Tests"
            onAction={() => navigate('/order')}
          />
        </Card>
      ) : (
        <>
          {/* Key Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Diagnostic Orders"
              value={totalPrescriptions}
              subtitle="Logged in hospital system"
              icon={TrendingUp}
              color="teal"
            />
            <StatCard
              title="Pending Diagnostics"
              value={pendingOrders}
              subtitle="Awaiting laboratory processing"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Fulfilled Reports"
              value={completedOrders}
              subtitle="Signed off by laboratory"
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="Patients in Active Care"
              value={totalPatients}
              subtitle="Registered patient profiles"
              icon={Users}
              color="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real Prescribed Test Breakdown */}
            <Card
              title="Prescribed Diagnostic Panels"
              subtitle="Actual test volume ordered across all clinical consultations."
              icon={Stethoscope}
            >
              {testDistribution.length === 0 ? (
                <EmptyState
                  title="No Test Panels Ordered"
                  description="Test panel frequency will calculate automatically as clinicians order lab tests."
                />
              ) : (
                <div className="space-y-4">
                  {testDistribution.map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                        <span className="font-mono text-slate-500">
                          {item.count} order{item.count === 1 ? '' : 's'} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Diagnostic Fulfillment Status */}
            <Card
              title="Order Fulfillment Telemetry"
              subtitle="Real-time completion tracking across active laboratory requisitions."
              icon={FileCheck2}
            >
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Completed & Authorized
                    </span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {completedOrders} / {totalPrescriptions} (
                      {totalPrescriptions > 0
                        ? Math.round((completedOrders / totalPrescriptions) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${
                          totalPrescriptions > 0
                            ? Math.round((completedOrders / totalPrescriptions) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Pending Specimen & Technical Analysis
                    </span>
                    <span className="font-bold text-amber-600 font-mono">
                      {pendingOrders} / {totalPrescriptions} (
                      {totalPrescriptions > 0
                        ? Math.round((pendingOrders / totalPrescriptions) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          totalPrescriptions > 0
                            ? Math.round((pendingOrders / totalPrescriptions) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

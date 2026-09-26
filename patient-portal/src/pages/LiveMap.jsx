import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Clock,
  User,
  Phone,
  ShieldCheck,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import AuditTimeline from '../components/ui/AuditTimeline';
import { StatusBadge } from '../components/ui/Badge';
import { patientApi } from '../services/api';

export default function LiveMap() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    patientApi.getLiveCollection().then((c) => setCollection(c));
  }, []);

  if (!collection) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          No Active Home Collection In Transit
        </h3>
        <p className="text-xs text-slate-500">
          You do not have any pending sample collections at this moment.
        </p>
        <Button onClick={() => navigate('/book-test')}>Book Diagnostic Test</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Live Sample Collection & Pipeline Tracker"
        subtitle="End-to-end transparent visibility from phlebotomy dispatch to report authorization."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Live Tracking' }]}
      />

      {/* Phlebotomist in-transit card */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-600 animate-bounce" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Phlebotomy Dispatch Status
                </h3>
                <span className="text-[11px] text-slate-500">
                  Target Arrival: {collection.date} at {collection.slot}
                </span>
              </div>
            </div>
            <StatusBadge status="IN_PROGRESS" />
          </div>
        }
      >
        <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              VK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {collection.phlebotomist.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {collection.phlebotomist.vaccinationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {collection.phlebotomist.credential || 'Certified Phlebotomist'} • Hospital Accredited
              </p>
              <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-300 font-mono mt-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{collection.phlebotomist.phone}</span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 text-[10px] block uppercase">Sample Tube Box</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Temperature Controlled (+2°C to +8°C)
            </span>
          </div>
        </div>
      </Card>

      {/* Milestone Timeline */}
      <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Specimen Pipeline Milestones</h3>}>
        <div className="py-2">
          <AuditTimeline steps={collection.timeline} />
        </div>
      </Card>
    </div>
  );
}

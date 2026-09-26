import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { patientApi } from '../services/api';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    patientApi.getNotifications().then((n) => setNotifications(n));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Diagnostic Alerts & Notifications"
        subtitle="Stay notified on test progress, authorized results, and appointment schedules."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]}
      />

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {n.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {n.timestamp}
                </span>
              </div>
            </div>

            {n.link && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(n.link)}
                className="shrink-0"
              >
                View
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

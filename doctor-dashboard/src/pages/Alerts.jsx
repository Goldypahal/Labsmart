import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { clinicalApi } from '../services/api';

export default function Alerts() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    clinicalApi.getNotifications().then((data) => setNotifications(data));
  }, []);

  const handleMarkRead = (id) => {
    const updated = clinicalApi.markNotificationRead(id);
    setNotifications([...updated]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Clinical Alerts & Notification Center"
        subtitle="Real-time critical value warnings, emergency dispatch alerts, and authorized report feeds."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Alerts' }]}
      />

      <div className="space-y-3">
        {notifications.map((n) => {
          const isCritical = n.type === 'CRITICAL';
          return (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              } ${!n.read ? 'ring-1 ring-teal-500/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      isCritical
                        ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300'
                        : 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    ) : (
                      <FileCheck2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {n.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(n.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  {n.link && (
                    <Button
                      variant={isCritical ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() => navigate(n.link)}
                    >
                      View Event →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

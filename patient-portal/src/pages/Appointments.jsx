import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Compass, CheckCircle2, User } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { patientApi } from '../services/api';

export default function Appointments() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    patientApi.getBookings().then((b) => setBookings(b));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="My Diagnostic Appointments"
        subtitle="View upcoming home phlebotomy visits and laboratory appointments."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Appointments' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/book-test')}
          >
            Schedule New Test
          </Button>
        }
      />

      <div className="space-y-4">
        {bookings.map((b) => (
          <Card
            key={b.id}
            header={
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {b.testName}
                  </h3>
                  <span className="text-xs text-slate-500">Booking #{b.id}</span>
                </div>
                <StatusBadge status={b.status} />
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold">{b.date} • {b.slot}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{b.address}</span>
                </div>
                {b.phlebotomist && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 pt-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Assigned Phlebotomist: <span className="font-semibold text-slate-800 dark:text-slate-200">{b.phlebotomist.name}</span> ({b.phlebotomist.phone})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Compass}
                  onClick={() => navigate('/live-map')}
                >
                  Track Sample Progress
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

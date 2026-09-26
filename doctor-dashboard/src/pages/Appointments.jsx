import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import DataTable from '../components/ui/DataTable';
import { clinicalApi } from '../services/api';

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  // New appointment form state
  const [newPatientId, setNewPatientId] = useState('');
  const [newType, setNewType] = useState('Teleconsultation');
  const [newDate, setNewDate] = useState('2026-09-26');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [apts, pts] = await Promise.all([
        clinicalApi.getAppointments(),
        clinicalApi.getPatients(),
      ]);
      setAppointments(apts);
      setPatients(pts);
      if (pts.length > 0) setNewPatientId(String(pts[0].id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const pt = patients.find((p) => String(p.id) === String(newPatientId));
    await clinicalApi.createAppointment({
      patientId: Number(newPatientId),
      patientName: pt?.name || 'Patient',
      doctor: 'Dr. Smith',
      specialty: 'Internal Medicine',
      type: newType,
      date: newDate,
      time: newTime,
      notes: newNotes,
    });
    setShowNewModal(false);
    loadData();
  };

  const columns = [
    {
      key: 'time',
      label: 'Date & Time',
      render: (val, apt) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-teal-600" /> {val}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">{apt.date}</span>
        </div>
      ),
    },
    {
      key: 'patientName',
      label: 'Patient Name',
      render: (val, apt) => (
        <span className="font-medium text-slate-900 dark:text-white text-xs">{val}</span>
      ),
    },
    {
      key: 'type',
      label: 'Encounter Mode',
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
          {val === 'Teleconsultation' ? <Video className="w-3.5 h-3.5 text-sky-500" /> : <User className="w-3.5 h-3.5 text-teal-500" />}
          <span>{val}</span>
        </span>
      ),
    },
    {
      key: 'notes',
      label: 'Clinical Reason',
      render: (val) => <span className="text-xs text-slate-500 line-clamp-1">{val || 'Routine follow-up'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, apt) => (
        <div className="flex items-center gap-2">
          {apt.type === 'Teleconsultation' && (
            <Button
              variant="primary"
              size="sm"
              icon={Video}
              onClick={() => navigate('/teleconsult')}
            >
              Start Teleconsult
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Clinical Consultations & Appointments"
        subtitle="Manage telemedicine slots, in-clinic patient encounters, and diagnostic follow-ups."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Appointments' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowNewModal(true)}
          >
            Schedule Consultation
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={appointments}
        searchKey="patientName"
        searchPlaceholder="Search appointments by patient..."
        isLoading={isLoading}
      />

      {/* New Consultation Modal */}
      {showNewModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowNewModal(false)}
          title="Schedule Patient Consultation"
          subtitle="Book in-clinic or telemedicine encounter with automated patient SMS reminder."
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreate}
              >
                Confirm Appointment
              </Button>
            </>
          }
        >
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Patient
              </label>
              <select
                value={newPatientId}
                onChange={(e) => setNewPatientId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Consultation Mode
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Teleconsultation">Teleconsultation (Video/Audio)</option>
                  <option value="In-Clinic Consultation">In-Clinic Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Time Slot
              </label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 11:30 AM"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Clinical Reason & Encounter Notes
              </label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Follow-up on blood report results..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

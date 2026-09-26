import React, { useState, useEffect } from 'react';
import { FileText, Plus, User, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { clinicalApi } from '../services/api';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [content, setContent] = useState('');
  const [rxList, setRxList] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const [allNotes, pts] = await Promise.all([
      clinicalApi.getClinicalNotes(),
      clinicalApi.getPatients(),
    ]);
    setNotes(allNotes);
    setPatients(pts);
    if (pts.length > 0) setPatientId(String(pts[0].id));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!diagnosis || !content) return;
    setIsSaving(true);
    try {
      const pt = patients.find((p) => String(p.id) === String(patientId));
      await clinicalApi.createClinicalNote({
        patientId: Number(patientId),
        patientName: pt?.name || 'Patient',
        doctor: 'Dr. Smith',
        diagnosis,
        content,
        prescriptions: rxList ? rxList.split(',').map((r) => r.trim()).filter(Boolean) : [],
      });
      setShowModal(false);
      setDiagnosis('');
      setContent('');
      setRxList('');
      loadNotes();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Clinical Encounter Documentation"
        subtitle="Log longitudinal SOAP notes, diagnostic impressions, and treatment plans."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Clinical Notes' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            New Clinical Note
          </Button>
        }
      />

      <div className="space-y-4">
        {notes.map((note) => (
          <Card
            key={note.id}
            header={
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {note.diagnosis}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{note.patientName}</span> • Date: {note.date}
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">By: {note.doctor}</span>
              </div>
            }
          >
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {note.content}
            </p>

            {note.prescriptions && note.prescriptions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                  Pharmacological Interventions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {note.prescriptions.map((rx, idx) => (
                    <Badge key={idx} variant="primary" size="sm">
                      {rx}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* New Note Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(false)}
          title="Document Clinical Encounter"
          subtitle="Record ICD-10 diagnostic impression, SOAP assessment, and medication instructions."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSaving}
                onClick={handleCreate}
                icon={Save}
              >
                Sign & Save Note
              </Button>
            </>
          }
        >
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Patient
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Clinical Diagnosis / Problem Title
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension (I10), Follow-up Review"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                required
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Clinical Examination & SOAP Notes
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Subjective complaints, objective vitals and physical findings, assessment, and treatment plan..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Medications / Prescriptions (Comma-separated)
              </label>
              <input
                type="text"
                value={rxList}
                onChange={(e) => setRxList(e.target.value)}
                placeholder="e.g. Atorvastatin 20mg OD, Telmisartan 40mg OD"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

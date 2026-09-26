import React, { useState } from 'react';
import { User, Shield, Stethoscope, Mail, Phone, Building, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { clinicalApi } from '../services/api';

export default function Profile() {
  const user = clinicalApi.getCurrentUser();
  const [name, setName] = useState(user.name || 'Dr. Smith');
  const [email] = useState(user.email || 'doctor@diagconnect.com');
  const [specialty, setSpecialty] = useState('Internal Medicine & Clinical Diagnostics');
  const [regNumber, setRegNumber] = useState('MCI-KMC-2014-98421');
  const [phone, setPhone] = useState('+91 98450 11223');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Clinician Profile & Credentials"
        subtitle="Manage practicing credentials, medical council registration, and digital signature preferences."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Profile' }]}
      />

      {saved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile credentials saved and synchronized across hospital EMR.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Professional Information</h3>}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                DS
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{name}</h4>
                <p className="text-slate-500">{specialty}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success" size="sm">Verified Practicing Clinician</Badge>
                  <span className="font-mono text-slate-400">Reg: {regNumber}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinician Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Specialty
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medical Registration Number
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Hospital Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md">
            Save Profile Credentials
          </Button>
        </div>
      </form>
    </div>
  );
}

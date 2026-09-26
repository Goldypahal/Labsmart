import React, { useState } from 'react';
import { User, Shield, Phone, Mail, MapPin, QrCode, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { patientApi } from '../services/api';

export default function Profile() {
  const patient = patientApi.getCurrentUser();
  const [phone, setPhone] = useState(patient.phone);
  const [address, setAddress] = useState(patient.address);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Personal Health Profile & ABHA Identity"
        subtitle="Manage contact information, emergency details, and linked Ayushman Bharat Health Account."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Profile' }]}
      />

      {saved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved and updated in hospital records.</span>
        </div>
      )}

      {/* ABHA Digital Health Card */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-300" />
            <span className="font-bold text-sm tracking-wide uppercase">
              ABHA Digital Health Card
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
            Active & Verified
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <span className="text-xl font-bold block tracking-tight">{patient.name}</span>
            <span className="font-mono text-xs text-teal-200 block">ABHA: {patient.abhaId}</span>
            <span className="text-xs text-slate-300 block">
              {patient.age} Yrs / {patient.gender} • Blood Group: <span className="font-bold text-white">{patient.bloodGroup}</span>
            </span>
          </div>

          <div className="w-16 h-16 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center">
            <QrCode className="w-full h-full text-slate-900" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Contact & Demographics</h3>}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={patient.name}
                  className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={patient.email}
                  className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (For SMS Alerts)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group
                </label>
                <input
                  type="text"
                  disabled
                  value={patient.bloodGroup}
                  className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed font-bold text-rose-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Home Collection Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}

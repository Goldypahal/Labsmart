import React, { useState } from 'react';
import { ShieldCheck, Bell, Smartphone, Lock, Eye, Save } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({
    smsAlerts: true,
    emailAlerts: true,
    criticalReportsOnly: false,
    abhaSharing: true,
    twoFactorAuth: true,
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Account & Privacy Settings"
        subtitle="Manage your Ayushman Bharat Digital Mission (ABDM) integration, consent, and report notification preferences."
        actions={
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
          >
            {saved ? 'Saved!' : 'Save Preferences'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="ABHA & ABDM Consent" icon={ShieldCheck}>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold text-teal-900">ABHA Linked Status</p>
                <p className="text-xs text-teal-700">91-4589-2311-7890 (Active)</p>
              </div>
              <Badge variant="teal">Verified</Badge>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-800">Direct Health Record Sharing</p>
                <p className="text-xs text-slate-500">Allow consulting doctors to fetch verified reports</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.abhaSharing}
                onChange={() => handleToggle('abhaSharing')}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
            </div>
          </div>
        </Card>

        <Card title="Notification Channels" icon={Bell}>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-800">SMS & WhatsApp Alerts</p>
                <p className="text-xs text-slate-500">Instant notification when lab tests are ready</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.smsAlerts}
                onChange={() => handleToggle('smsAlerts')}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-800">Email Delivery of PDF Reports</p>
                <p className="text-xs text-slate-500">Send password-protected PDF directly to inbox</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailAlerts}
                onChange={() => handleToggle('emailAlerts')}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-800">Urgent Findings Only</p>
                <p className="text-xs text-slate-500">Notify only on panic / critical out-of-range parameters</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.criticalReportsOnly}
                onChange={() => handleToggle('criticalReportsOnly')}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
            </div>
          </div>
        </Card>

        <Card title="Security & Authentication" icon={Lock} className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Two-Factor Authentication (OTP)</p>
                <p className="text-xs text-slate-500">Required when accessing sensitive lab test results</p>
              </div>
              <Badge variant="blue">Enabled</Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Audit Log Access</p>
                <p className="text-xs text-slate-500">View clinicians who have accessed your medical file</p>
              </div>
              <Button size="sm" variant="secondary" icon={Eye}>View Logs</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

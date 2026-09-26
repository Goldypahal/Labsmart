import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Shield, Server, Check } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [statSms, setStatSms] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [autoSign, setAutoSign] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Hospital System & Security Settings"
        subtitle="Configure emergency dispatch triggers, critical value thresholds, and multi-factor session security."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Settings' }]}
      />

      {saved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Security and notification preferences updated successfully.</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Notification Preferences */}
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Critical Alert Dispatch</h3>}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  STAT Emergency SMS Dispatch
                </span>
                <span className="text-slate-500">
                  Transmit automated SMS immediately upon detection of critical lab panic values.
                </span>
              </div>
              <input
                type="checkbox"
                checked={statSms}
                onChange={(e) => setStatSms(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Daily Diagnostic Digest Email
                </span>
                <span className="text-slate-500">
                  Receive a summary of all authorized and pending lab requisitions at 08:00 AM.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </div>
          </div>
        </Card>

        {/* Security & Access */}
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinical Session Security</h3>}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  ABHA / Healthcare Worker Two-Factor Auth
                </span>
                <span className="text-slate-500">
                  Enforce OTP challenge during logins on new clinical workstations.
                </span>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Digital Signature Token
                </span>
                <span className="text-slate-500">
                  Store active DSC certificate in hardware token or certified software HSM.
                </span>
              </div>
              <Button variant="outline" size="sm">
                Manage Keys
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={handleSave}>
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

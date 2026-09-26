import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Check,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { patientApi } from '../services/api';

export default function BookTest() {
  const navigate = useNavigate();
  const catalog = patientApi.getTestCatalog();
  const patient = patientApi.getCurrentUser();

  const [selectedTests, setSelectedTests] = useState(['CBC']);
  const [collectionMode, setCollectionMode] = useState('Home Sample Collection');
  const [address, setAddress] = useState(patient.address);
  const [date, setDate] = useState('2026-09-28');
  const [slot, setSlot] = useState('07:30 AM - 08:30 AM');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  const toggleTest = (id) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const filtered = catalog.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = selectedTests.reduce((acc, currId) => {
    const t = catalog.find((c) => c.id === currId);
    return acc + (t ? t.price : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTests.length === 0) return;

    setIsSubmitting(true);
    try {
      const selectedNames = selectedTests
        .map((id) => catalog.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      const res = await patientApi.createBooking({
        testName: selectedNames,
        mode: collectionMode,
        address,
        date,
        slot,
        price: totalAmount,
      });
      setBookingConfirmed(res);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Appointment Confirmed!
          </h2>
          <p className="text-xs text-slate-500">
            Booking ID #{bookingConfirmed.id} is registered with City Central Diagnostics.
          </p>
        </div>

        <Card className="text-left text-xs space-y-2.5">
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Scheduled Date:</span>
            <span className="font-bold text-slate-900 dark:text-white">{bookingConfirmed.date} ({bookingConfirmed.slot})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Collection Mode:</span>
            <span className="font-semibold text-teal-600">{bookingConfirmed.mode}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Assigned Phlebotomist:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {bookingConfirmed.phlebotomist.name} ({bookingConfirmed.phlebotomist.phone})
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Total Price:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">₹{bookingConfirmed.price} (Pay on visit / UPI)</span>
          </div>
        </Card>

        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
            View My Appointments
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/live-map')}>
            Track Live Collection →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Schedule Diagnostic Test & Sample Collection"
        subtitle="Transparent test pricing, automated home phlebotomist dispatch, and fasting guidelines."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Book Test' }]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Tests */}
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Select Diagnostic Panels ({selectedTests.length} selected)
              </h3>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((t) => {
              const isSelected = selectedTests.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => toggleTest(t.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                      <span>{t.sampleType}</span>
                      <span>• TAT: {t.tatHours}h</span>
                      {t.fastingRequired && <span className="text-amber-600 font-semibold">⚠️ Fasting Required</span>}
                    </div>
                    <div className="text-xs font-mono font-bold text-teal-600">₹{t.price}</div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Step 2: Collection Mode & Time */}
        <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Collection Mode & Date</h3>}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCollectionMode('Home Sample Collection')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  collectionMode === 'Home Sample Collection'
                    ? 'bg-teal-50 border-teal-600 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="font-bold block">🏠 Home Phlebotomy Visit</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">Trained technician visits your home with sterile kit</span>
              </button>

              <button
                type="button"
                onClick={() => setCollectionMode('Visit Laboratory Center')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  collectionMode === 'Visit Laboratory Center'
                    ? 'bg-teal-50 border-teal-600 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="font-bold block">🏥 Visit Central Lab Center</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">Direct walk-in at Indiranagar diagnostic clinic</span>
              </button>
            </div>

            {collectionMode === 'Home Sample Collection' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Collection Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Time Slot
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="06:30 AM - 07:30 AM">06:30 AM - 07:30 AM (Fasting Slot)</option>
                  <option value="07:30 AM - 08:30 AM">07:30 AM - 08:30 AM (Fasting Slot)</option>
                  <option value="08:30 AM - 09:30 AM">08:30 AM - 09:30 AM (Fasting Slot)</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Summary & Confirmation Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500">Total Estimated Diagnostic Cost:</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              ₹{totalAmount} <span className="text-xs font-normal text-slate-500">(Payable post-collection)</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={selectedTests.length === 0}
            icon={PlusCircle}
          >
            Confirm & Reserve Appointment
          </Button>
        </div>
      </form>
    </div>
  );
}

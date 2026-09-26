import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  User,
  Shield,
  Activity,
  Plus,
  Stethoscope,
  Send,
} from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { clinicalApi } from '../services/api';

export default function Teleconsult() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [notes, setNotes] = useState('');
  const [callDuration, setCallDuration] = useState('08:42');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Patient', text: 'Good morning Dr. Smith. I received my lipid panel results yesterday.', time: '11:31 AM' },
    { sender: 'Dr. Smith', text: 'Hello Rajesh. Yes, I am reviewing your triglycerides which are elevated at 520 mg/dL. Are you experiencing any chest discomfort or nausea?', time: '11:32 AM' },
  ]);
  const [messageInput, setMessageInput] = useState('');

  const patient = {
    name: 'Rajesh Verma',
    age: 58,
    gender: 'Male',
    bloodGroup: 'A+',
    abhaId: '91-5512-8874-9923',
    allergies: ['Aspirin (Mild Gastritis)'],
    chronicConditions: ['Coronary Artery Disease', 'Dyslipidemia'],
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'Dr. Smith', text: messageInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setMessageInput('');
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    await clinicalApi.createClinicalNote({
      patientId: 5,
      patientName: patient.name,
      doctor: 'Dr. Smith',
      diagnosis: 'Telemedicine Follow-up: Hypertriglyceridemia',
      content: notes,
    });
    alert('Encounter note saved to patient EMR.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Telemedicine Clinical Encounter"
        subtitle="End-to-end encrypted video consultation session with real-time EMR context."
        breadcrumbs={[{ label: 'Appointments', href: '/appointments' }, { label: 'Active Call' }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>LIVE • {callDuration}</span>
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Feeds & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg flex items-center justify-center">
            {/* Patient simulated feed */}
            <div className="text-center space-y-2">
              <div className="w-24 h-24 rounded-full bg-teal-800/80 text-teal-200 flex items-center justify-center font-bold text-3xl mx-auto shadow-md">
                RV
              </div>
              <div>
                <h4 className="text-white font-bold text-base">{patient.name}</h4>
                <p className="text-xs text-slate-400">Connected via Patient Portal (WebRTC 1080p HD)</p>
              </div>
            </div>

            {/* Doctor PIP preview */}
            <div className="absolute top-4 right-4 w-36 aspect-video bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-md flex items-center justify-center">
              <span className="text-[10px] text-teal-300 font-semibold">Dr. Smith (You)</span>
            </div>

            {/* Bottom floating call controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-full text-white transition-colors ${
                  isMuted ? 'bg-rose-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2.5 rounded-full text-white transition-colors ${
                  isVideoOff ? 'bg-rose-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
              <button
                onClick={() => navigate('/appointments')}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <PhoneOff className="w-3.5 h-3.5" /> End Encounter
              </button>
            </div>
          </div>

          {/* Clinical Encounter Note-taking Panel */}
          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Encounter Documentation</h3>}>
            <div className="space-y-3">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document clinical observations, drug titration instructions, and patient recommendations..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500">Auto-timestamps with Doctor digital signature</span>
                <Button size="sm" onClick={handleSaveNotes} icon={FileText}>
                  Save to Patient Record
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Patient EMR Context & Consultation Chat (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient Quick Context Card */}
          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Patient Record</h3>}>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Demographics:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.age}y / {patient.gender} • {patient.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Known Allergies:</span>
                <span className="font-semibold text-rose-600">{patient.allergies.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chronic Issues:</span>
                <span className="font-semibold text-amber-600">{patient.chronicConditions.join(', ')}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/order?patientId=5')}
                >
                  Order Requisition
                </Button>
              </div>
            </div>
          </Card>

          {/* Consultation Chat */}
          <Card header={<h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinical In-Call Messages</h3>}>
            <div className="space-y-3">
              <div className="h-48 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl max-w-[85%] ${
                      msg.sender === 'Dr. Smith'
                        ? 'ml-auto bg-teal-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75 mb-1 gap-2">
                      <span className="font-semibold">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Send text or instruction..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <Button type="submit" size="sm" icon={Send}>
                  Send
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

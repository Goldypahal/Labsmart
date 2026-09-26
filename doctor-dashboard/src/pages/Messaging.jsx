import React, { useState } from 'react';
import { MessageSquare, Send, User, Search, Paperclip } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Messaging() {
  const [activeContact, setActiveContact] = useState(1);
  const [messages, setMessages] = useState({
    1: [
      { sender: 'Dr. Sarah Pathologist', role: 'Lab Admin', text: 'Dr. Smith, regarding patient Rajesh Verma (SMP-89021): we ran duplicate tests on the lipemic sample. Triglycerides confirmed at 520 mg/dL.', time: '02:15 PM' },
      { sender: 'Dr. Smith', role: 'You', text: 'Thank you Sarah. I have initiated Fenofibrate and asked him to come in for fasting ultrasound next week.', time: '02:20 PM' },
    ],
    2: [
      { sender: 'Central Pathology Desk', role: 'Accessioning', text: 'New blood specimen received for Jane Roe (#SMP-89023). TSH assay running now.', time: '10:30 AM' },
    ],
  });
  const [inputMessage, setInputMessage] = useState('');

  const contacts = [
    { id: 1, name: 'Dr. Sarah Pathologist', role: 'Pathology Head', lastMsg: 'Triglycerides confirmed at 520 mg/dL.', time: '02:15 PM', unread: true },
    { id: 2, name: 'Central Pathology Desk', role: 'LIMS Accessioning', lastMsg: 'New blood specimen received for Jane Roe...', time: '10:30 AM', unread: false },
    { id: 3, name: 'John Doe', role: 'Patient', lastMsg: 'Doctor, when will my CBC results be ready?', time: 'Yesterday', unread: false },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [activeContact]: [
        ...(prev[activeContact] || []),
        { sender: 'Dr. Smith', role: 'You', text: inputMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ],
    }));
    setInputMessage('');
  };

  const currentContact = contacts.find((c) => c.id === activeContact);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Clinical Consultation & LIMS Messaging"
        subtitle="Secure inter-departmental communication between attending clinicians, pathologists, and patients."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Messaging' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Contact list (4 Cols) */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, labs, patients..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
            {contacts.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveContact(c.id)}
                className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                  activeContact === c.id
                    ? 'bg-teal-50/80 dark:bg-teal-950/40 border-l-3 border-teal-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {c.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                  </div>
                  <span className="text-[10px] text-teal-600 block">{c.role}</span>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Thread (8 Cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-slate-50/40 dark:bg-slate-900/40">
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentContact?.name}
              </h3>
              <span className="text-[11px] text-teal-600">{currentContact?.role} • Medical Staff Channel</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {(messages[activeContact] || []).map((m, idx) => {
              const isMe = m.sender === 'Dr. Smith';
              return (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${
                    isMe ? 'ml-auto items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5">
                    {m.sender} • {m.time}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message, report inquiry, or clinical note..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <Button type="submit" size="sm" icon={Send}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { MessageSquare, Send, User, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'Central Pathology Desk', text: 'Hello John, your blood specimen #SMP-89022 for Complete Blood Count was processed and certified by Dr. Sarah Pathologist.', time: '23 Sep 01:50 PM' },
    { sender: 'John Doe', text: 'Thank you. Does my doctor have access to the results as well?', time: '23 Sep 02:00 PM' },
    { sender: 'Central Pathology Desk', text: 'Yes, Dr. Smith has been notified and the report is attached to your hospital health record.', time: '23 Sep 02:05 PM' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: 'John Doe', text: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setInputText('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Diagnostic Support & Consultation Chat"
        subtitle="Direct channel for inquiries regarding sample collection, fasting rules, and report access."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Chat' }]}
      />

      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                CP
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Central Laboratory Support Helpdesk
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium">Duty Desk Online</span>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="h-80 overflow-y-auto space-y-3 p-2 custom-scrollbar text-xs">
            {messages.map((m, idx) => {
              const isMe = m.sender === 'John Doe';
              return (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${
                    isMe ? 'ml-auto items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5">{m.sender} • {m.time}</span>
                  <div
                    className={`p-3 rounded-2xl leading-relaxed ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about sample collection, report delivery..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <Button type="submit" size="sm" icon={Send}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

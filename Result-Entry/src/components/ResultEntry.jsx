import React, { useState, useEffect } from 'react';
import { Search, Save, AlertCircle, CheckCircle2, ChevronDown, RotateCcw } from 'lucide-react';

const SAMPLE_PARAMETERS = [
  { id: 1, name: 'Haemoglobin', unit: 'g/dL', normal: '13.0 - 17.0', min: 13.0, max: 17.0 },
  { id: 2, name: 'RBC Count', unit: 'million/cumm', normal: '4.5 - 5.5', min: 4.5, max: 5.5 },
  { id: 3, name: 'WBC Count', unit: 'cells/cumm', normal: '4000 - 11000', min: 4000, max: 11000 },
  { id: 4, name: 'Platelet Count', unit: 'lakhs/cumm', normal: '1.5 - 4.5', min: 1.5, max: 4.5 },
  { id: 5, name: 'PCV', unit: '%', normal: '40 - 50', min: 40, max: 50 },
  { id: 6, name: 'MCV', unit: 'fL', normal: '82 - 92', min: 82, max: 92 },
];

export default function ResultEntry() {
  const [results, setResults] = useState({});
  const [patient, setPatient] = useState({ name: 'Rohit Sharma', id: 'S0321', age: '32', gender: 'Male' });

  const handleInputChange = (id, value) => {
    setResults(prev => ({ ...prev, [id]: value }));
  };

  const getStatus = (param, value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (num < param.min) return 'low';
    if (num > param.max) return 'high';
    return 'normal';
  };

  return (
    <div className="result-entry-container animate-fade-in">
      <div className="workbench-header glass-card">
        <div className="patient-snippet">
          <div className="patient-avatar">{patient.name.charAt(0)}</div>
          <div className="patient-meta">
            <h4>{patient.name} <span className="uhid-tag">UHID-4421</span></h4>
            <span className="text-dim">{patient.age}Y / {patient.gender} • Sample ID: {patient.id}</span>
          </div>
        </div>
        <div className="workbench-actions">
          <button className="icon-btn-lite"><RotateCcw size={18} /> Reset</button>
          <button className="primary-btn"><Save size={18} /> Save & Verify</button>
        </div>
      </div>

      <div className="grid-container glass-card mt-4">
        <div className="grid-header">
          <div className="col-param">Parameter Name</div>
          <div className="col-unit">Unit</div>
          <div className="col-range">Reference Range</div>
          <div className="col-value">Result Value</div>
          <div className="col-status">Flag</div>
        </div>

        <div className="grid-body">
          {SAMPLE_PARAMETERS.map(param => {
            const status = getStatus(param, results[param.id]);
            return (
              <div key={param.id} className="grid-row">
                <div className="col-param">{param.name}</div>
                <div className="col-unit text-dim">{param.unit}</div>
                <div className="col-range text-dim">{param.normal}</div>
                <div className="col-value">
                  <input 
                    type="text" 
                    className={`result-input ${status}`}
                    placeholder="Enter value..."
                    value={results[param.id] || ''}
                    onChange={(e) => handleInputChange(param.id, e.target.value)}
                  />
                </div>
                <div className="col-status">
                  {status === 'low' && <span className="flag-bubble low">L</span>}
                  {status === 'high' && <span className="flag-bubble high">H</span>}
                  {status === 'normal' && <CheckCircle2 size={16} color="#10b981" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .result-entry-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .workbench-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
        }

        .patient-snippet {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .patient-avatar {
          width: 44px;
          height: 44px;
          background: var(--primary-light);
          border: 1px solid var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--primary);
        }

        .uhid-tag {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-weight: 500;
          vertical-align: middle;
          margin-left: 0.5rem;
        }

        .workbench-actions {
          display: flex;
          gap: 1rem;
        }

        .grid-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1.5fr 0.5fr;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-card);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .grid-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1.5fr 0.5fr;
          padding: 1.25rem 1.5rem;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          transition: background 0.2s;
        }

        .grid-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .result-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-card);
          padding: 0.6rem 1rem;
          border-radius: 8px;
          color: white;
          outline: none;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s;
        }

        .result-input:focus {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .result-input.low { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); color: #60a5fa; }
        .result-input.high { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); color: #f87171; }

        .flag-bubble {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.75rem;
        }

        .flag-bubble.low { background: #3b82f6; color: white; }
        .flag-bubble.high { background: #ef4444; color: white; }
      `}</style>
    </div>
  );
}

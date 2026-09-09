import React, { useState } from 'react';
import { Printer, Download, Share2, Eye, EyeOff, CheckCircle2, AlertTriangle, FileText, ChevronLeft } from 'lucide-react';

const SAMPLE_RESULTS = [
  { name: 'HEMOGLOBIN', value: '15', unit: 'g/dl', range: '13 - 17', status: 'normal' },
  { name: 'TOTAL LEUKOCYTE COUNT', value: '5,100', unit: 'cumm', range: '4,000 - 10,800', status: 'normal' },
  { group: 'DIFFERENTIAL LEUCOCYTE COUNT', sub: [
    { name: 'NEUTROPHILS', value: '79', unit: '%', range: '40 - 80', status: 'normal' },
    { name: 'LYMPHOCYTE', value: '18', unit: '%', range: '20 - 40', status: 'low' },
    { name: 'EOSINOPHILS', value: '1', unit: '%', range: '1 - 6', status: 'normal' },
    { name: 'MONOCYTES', value: '1', unit: '%', range: '2 - 10', status: 'low' },
    { name: 'BASOPHILS', value: '1', unit: '%', range: '< 2', status: 'normal' },
  ]},
  { name: 'PLATELET COUNT', value: '3.5', unit: 'lakhs/cumm', range: '1.5 - 4.1', status: 'normal' },
  { name: 'TOTAL RBC COUNT', value: '5', unit: 'million/cumm', range: '4.5 - 5.5', status: 'normal' },
  { name: 'HEMATOCRIT VALUE, HCT', value: '42', unit: '%', range: '40 - 50', status: 'normal' },
  { name: 'MEAN CORPUSCULAR VOLUME, MCV', value: '84.0', unit: 'fL', range: '83 - 101', status: 'normal' },
];

export default function ReportPreview({ onBack }) {
  const [withHeader, setWithHeader] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-preview-container animate-fade-in">
      <div className="preview-toolbar glass-card">
        <button className="icon-btn-lite" onClick={onBack}><ChevronLeft size={18} /> Back</button>
        <div className="toolbar-center">
          <div className="header-toggle-container">
            <span className={!withHeader ? 'active' : ''}>Plain Paper</span>
            <div className={`toggle-switch ${withHeader ? 'on' : ''}`} onClick={() => setWithHeader(!withHeader)}>
              <div className="toggle-thumb" />
            </div>
            <span className={withHeader ? 'active' : ''}>Pre-printed Letterhead</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <button className="icon-btn-lite"><Download size={18} /> PDF</button>
          <button className="primary-btn" onClick={handlePrint}><Printer size={18} /> Print Report</button>
        </div>
      </div>

      <div id="printable-report" className={`report-sheet glass-card ${withHeader ? 'with-header' : 'no-header'}`}>
        {/* Header Section */}
        {withHeader && (
          <div className="report-header">
            <div className="lab-branding">
              <div className="lab-logo-placeholder">Labsmart Software</div>
              <div className="lab-address text-dim">123 Health Ave, Diagnostic Wing, City-5001</div>
            </div>
            <div className="lab-contact">
              <p>+91 12345 67890</p>
              <p>reports@labsmart.com</p>
            </div>
          </div>
        )}

        {/* Patient Info Bar */}
        <div className="patient-report-info">
          <div className="info-row">
            <div className="info-col">
              <span className="label">Patient Name:</span>
              <span className="value">Mr. Saubhik Bhaumik</span>
            </div>
            <div className="info-col">
              <span className="label">Registered On:</span>
              <span className="value">17/10/2025 04:55 PM</span>
            </div>
          </div>
          <div className="info-row">
            <div className="info-col">
              <span className="label">Age / Sex:</span>
              <span className="value">27 YRS / M</span>
            </div>
            <div className="info-col">
              <span className="label">Collected On:</span>
              <span className="value">17/10/2025</span>
            </div>
          </div>
          <div className="info-row">
            <div className="info-col">
              <span className="label">Referred By:</span>
              <span className="value font-bold">DR. SAMUEL D'SOUZA (MBBS, MD)</span>
            </div>
            <div className="info-col">
              <span className="label">Reported On:</span>
              <span className="value">17/10/2025 08:30 PM</span>
            </div>
          </div>
        </div>

        <div className="report-title">
          <h3>HAEMATOLOGY</h3>
          <h4>COMPLETE BLOOD COUNT (CBC)</h4>
        </div>

        {/* Results Table */}
        <table className="report-table">
          <thead>
            <tr>
              <th>TEST PARAMETER</th>
              <th>VALUE</th>
              <th>UNIT</th>
              <th>REFERENCE RANGE</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_RESULTS.map((res, i) => res.group ? (
              <React.Fragment key={i}>
                <tr className="group-header">
                  <td colSpan="4">{res.group}</td>
                </tr>
                {res.sub.map((sub, j) => (
                  <tr key={j} className={sub.status !== 'normal' ? 'abnormal' : ''}>
                    <td className="indent">{sub.name}</td>
                    <td className="font-bold">{sub.value} {sub.status === 'low' ? 'L' : sub.status === 'high' ? 'H' : ''}</td>
                    <td>{sub.unit}</td>
                    <td className="text-dim">{sub.range}</td>
                  </tr>
                ))}
              </React.Fragment>
            ) : (
              <tr key={i} className={res.status !== 'normal' ? 'abnormal' : ''}>
                <td>{res.name}</td>
                <td className="font-bold">{res.value} {res.status === 'low' ? 'L' : res.status === 'high' ? 'H' : ''}</td>
                <td>{res.unit}</td>
                <td className="text-dim">{res.range}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer with Signatures */}
        <div className="report-footer">
          <div className="clinical-notes">
            <h5>Clinical Notes:</h5>
            <p className="text-dim">A complete blood count (CBC) is used to evaluate overall health and detect a wide range of disorders, including anemia, infection, and leukemia. Values should be correlated with clinical findings.</p>
          </div>
          <div className="signatures">
            <div className="sig-item">
              <div className="sig-space" />
              <p>Lab technician</p>
              <span className="text-dim">Verified By</span>
            </div>
            <div className="sig-item">
              <div className="sig-space" />
              <p>DR. AMIT V. PATHAK</p>
              <span className="text-dim">M.D. (Pathologist)</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .report-preview-container {
          padding-bottom: 2rem;
        }

        .preview-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .header-toggle-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .header-toggle-container span.active {
          color: var(--primary);
        }

        .toggle-switch {
          width: 44px;
          height: 22px;
          background: #334155;
          border-radius: 11px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s;
        }

        .toggle-switch.on { background: var(--primary); }
        .toggle-thumb {
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toggle-switch.on .toggle-thumb { left: 24px; }

        .report-sheet {
          background: white;
          color: #1e293b;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          min-height: 1050px; /* A4 Ratio approx */
          padding: 2rem 3rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          transition: all 0.4s ease;
        }

        .report-sheet.no-header {
          padding-top: 220px; /* Leave space for pre-printed header */
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .lab-logo-placeholder {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
        }

        .patient-report-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .info-col {
          display: flex;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .info-col .label { font-weight: 600; color: #64748b; min-width: 120px; }

        .report-title {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .report-title h3 { text-decoration: underline; margin-bottom: 0.25rem; }
        .report-title h4 { color: #475569; }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }

        .report-table th {
          text-align: left;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.8rem;
        }

        .report-table td {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          font-size: 0.9rem;
        }

        .report-table tr.group-header td {
          background: #f1f5f9;
          font-weight: 700;
          text-transform: uppercase;
        }

        .report-table td.indent { padding-left: 2rem; }
        .report-table tr.abnormal td { color: #b91c1c; }

        .report-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .clinical-notes {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .signatures {
          display: flex;
          justify-content: space-between;
          padding-top: 2rem;
        }

        .sig-item { text-align: center; width: 220px; }
        .sig-space { height: 60px; border-bottom: 1px solid #cbd5e1; margin-bottom: 0.5rem; }

        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            min-height: 0;
            box-shadow: none;
            padding: 0;
            margin: 0;
          }
          .report-sheet.no-header { padding-top: 150px; } /* Adjust specifically for print */
          .glass-card { border: none !important; backdrop-filter: none !important; }
        }
      `}</style>
    </div>
  );
}

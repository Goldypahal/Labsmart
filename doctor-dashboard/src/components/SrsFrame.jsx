import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SrsFrame({ folder, title }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const src = `/stitch_srs_ui_component_generator/stitch_srs_ui_component_generator/${folder}/code.html`;

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE') {
        navigate(event.data.path);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;

      // 1. Branding: Ensure PDC (Pahal Diagnostic Center)
      const brandElements = doc.querySelectorAll('h1, h2, h3, span, p, a');
      brandElements.forEach(el => {
        if (el.children.length === 0) {
          if (el.textContent.includes('DiagConnect') || el.textContent.includes('HealthCenter') || el.textContent.includes('LabSmart')) {
            el.textContent = el.textContent.replace(/DiagConnect|HealthCenter|LabSmart/g, 'PDC (Pahal Diagnostic Center)');
          }
        }
      });

      // 2. Navigation Click Interception
      doc.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, [role="button"], tr, div');
        if (!target) return;

        const href = target.getAttribute('href');
        const text = (target.textContent || '').trim().toLowerCase();

        let targetRoute = null;

        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          if (href.includes('patient_directory') || href.includes('patients')) targetRoute = '/patients';
          else if (href.includes('lab_report') || href.includes('reports')) targetRoute = '/reports';
          else if (href.includes('prescription') || href.includes('order')) targetRoute = '/order';
          else if (href.includes('appointment')) targetRoute = '/appointments';
          else if (href.includes('chat') || href.includes('consultation')) targetRoute = '/chat';
          else if (href.includes('notification') || href.includes('alerts')) targetRoute = '/notifications';
          else if (href.includes('trends') || href.includes('analytics')) targetRoute = '/analytics';
          else if (href.includes('health_record') || href.includes('emr')) targetRoute = '/emr';
          else if (href.includes('telemedicine') || href.includes('teleconsult')) targetRoute = '/teleconsult';
          else if (href.includes('profile')) targetRoute = '/profile';
          else if (href.includes('network') || href.includes('settings')) targetRoute = '/settings';
        }

        if (!targetRoute) {
          if (text.includes('patient management') || text.includes('patient directory') || text === 'patients') {
            targetRoute = '/patients';
          } else if (text === 'my reports' || text.includes('view report') || text.includes('lab reports')) {
            targetRoute = '/reports';
          } else if (text.includes('test ordering') || text.includes('new order') || text.includes('add prescription')) {
            targetRoute = '/order';
          } else if (text === 'appointments' || text.includes('view appointments')) {
            targetRoute = '/appointments';
          } else if (text.includes('messaging') || text.includes('consultation chat') || text.includes('chat')) {
            targetRoute = '/chat';
          } else if (text.includes('alerts') || text.includes('notifications')) {
            targetRoute = '/notifications';
          } else if (text === 'analytics' || text.includes('health trends')) {
            targetRoute = '/analytics';
          } else if (text.includes('document vault') || text.includes('emr') || text.includes('health record')) {
            targetRoute = '/emr';
          } else if (text.includes('clinical notes')) {
            targetRoute = '/notes';
          } else if (text.includes('teleconsultation') || text.includes('telemedicine')) {
            targetRoute = '/teleconsult';
          } else if (text.includes('prescriptions')) {
            targetRoute = '/prescriptions';
          } else if (text === 'my profile' || text.includes('view doctor profile')) {
            targetRoute = '/profile';
          } else if (text === 'settings' || text.includes('system settings')) {
            targetRoute = '/settings';
          }
        }

        if (targetRoute) {
          e.preventDefault();
          e.stopPropagation();
          navigate(targetRoute);
        }
      }, true);

      // 3. Feature-Specific Interactivity

      // DASHBOARD SPECIFIC (Critical review, removal of recent activity & start consultation)
      if (folder.includes('doctor_dashboard')) {
        setupDoctorDashboardInteractivity(doc, navigate);
      }

      // PATIENT MANAGEMENT
      if (folder.includes('patient_directory') || folder.includes('patients')) {
        setupPatientDirectoryInteractivity(doc, navigate);
      }

      // MY REPORTS
      if (folder.includes('lab_report') || folder.includes('reports')) {
        setupDoctorReportsInteractivity(doc, navigate);
      }

      // APPOINTMENTS
      if (folder.includes('appointment') || folder.includes('booking')) {
        setupDoctorAppointmentsInteractivity(doc, navigate);
      }

      // TEST ORDERING
      if (folder.includes('prescription') || folder.includes('order')) {
        setupTestOrderingInteractivity(doc, navigate);
      }

      // MESSAGING
      if (folder.includes('chat') || folder.includes('consultation')) {
        setupDoctorMessagingInteractivity(doc);
      }

      // ALERTS
      if (folder.includes('notification') || folder.includes('alerts')) {
        setupDoctorAlertsInteractivity(doc, navigate);
      }

      // ANALYTICS
      if (folder.includes('trends') || folder.includes('analytics')) {
        setupDoctorAnalyticsInteractivity(doc);
      }

      // PROFILE (Degree change proof prompt)
      if (folder.includes('profile') || folder.includes('doctor_profile') || folder.includes('health_record')) {
        setupDoctorProfileInteractivity(doc);
      }

      // SETTINGS
      if (folder.includes('settings') || folder.includes('network')) {
        setupDoctorSettingsInteractivity(doc);
      }

    } catch (err) {
      console.warn('Could not inject doctor iframe interactivity:', err);
    }
  };

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title || folder}
      onLoad={handleIframeLoad}
      style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 4rem)', border: 'none', margin: 0, padding: 0, display: 'block' }}
    />
  );
}

// Helpers for Doctor Dashboard

function setupDoctorDashboardInteractivity(doc, navigate) {
  // Remove "recent activity section from dashboard" if requested
  const allHeadings = doc.querySelectorAll('h2, h3, h4');
  allHeadings.forEach(h => {
    if (h.textContent.toLowerCase().includes('recent activity')) {
      const section = h.closest('section, div.rounded-xl, div.bg-white, div.border');
      if (section) section.remove();
    }
  });

  // Remove "start consultation button from today's schedule"
  const buttons = doc.querySelectorAll('button');
  buttons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes('start consultation')) {
      btn.remove();
    }
  });

  // Review button in critical section
  const reviewBtns = doc.querySelectorAll('button');
  reviewBtns.forEach(btn => {
    if (btn.textContent.toLowerCase().includes('review')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/reports');
      });
    }
  });

  // Test revenue slidebar/filter
  const revenueCard = Array.from(doc.querySelectorAll('div, card')).find(el => el.textContent.toLowerCase().includes('revenue'));
  if (revenueCard) {
    const filterBtn = doc.createElement('select');
    filterBtn.className = 'text-xs border rounded p-1 ml-auto bg-white text-slate-700 font-semibold';
    filterBtn.innerHTML = `
      <option value="this-month">This Month</option>
      <option value="last-month">Last Month</option>
      <option value="this-quarter">This Quarter</option>
    `;
    filterBtn.onchange = (e) => {
      alert(`Revenue chart updated for: ${e.target.value}`);
    };
    const cardHeader = revenueCard.querySelector('div.flex') || revenueCard;
    cardHeader.appendChild(filterBtn);
  }
}

function setupPatientDirectoryInteractivity(doc, navigate) {
  // Search input
  const searchInput = doc.querySelector('input[placeholder*="Search"], input[type="search"], input[type="text"]');
  const rows = doc.querySelectorAll('tbody tr, .patient-card, div:has(> .patient-name)');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  // Filter dropdowns
  const selects = doc.querySelectorAll('select');
  selects.forEach(select => {
    select.addEventListener('change', (e) => {
      const val = e.target.value.toLowerCase();
      if (!val || val === 'all') {
        rows.forEach(r => r.style.display = '');
      } else {
        rows.forEach(r => {
          r.style.display = r.textContent.toLowerCase().includes(val) ? '' : 'none';
        });
      }
    });
  });

  // Add Patient button
  const addBtns = doc.querySelectorAll('button');
  addBtns.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('add patient') || text.includes('new patient')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        let modal = doc.querySelector('#add-patient-modal');
        if (!modal) {
          modal = doc.createElement('div');
          modal.id = 'add-patient-modal';
          modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800">
              <h3 class="text-lg font-bold mb-4">Add New Patient</h3>
              <form id="add-patient-form" class="space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Patient Full Name</label>
                  <input type="text" id="p-name" required placeholder="e.g. Ananya Sharma" class="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Age</label>
                    <input type="number" id="p-age" required placeholder="e.g. 34" class="w-full p-2.5 rounded-lg border text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
                    <select id="p-gender" class="w-full p-2.5 rounded-lg border text-sm">
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Contact Phone</label>
                  <input type="text" id="p-phone" required placeholder="+91 98765 00000" class="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <button type="button" id="cancel-pat" class="px-4 py-2 text-sm rounded-lg border">Cancel</button>
                  <button type="submit" class="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-semibold">Add Patient</button>
                </div>
              </form>
            </div>
          `;
          doc.body.appendChild(modal);
          doc.querySelector('#cancel-pat').onclick = () => modal.remove();
          doc.querySelector('#add-patient-form').onsubmit = (ev) => {
            ev.preventDefault();
            const name = doc.querySelector('#p-name').value;
            alert(`Patient ${name} added successfully!`);
            modal.remove();
          };
        }
      });
    } else if (text.includes('import')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = doc.createElement('input');
        input.type = 'file';
        input.accept = '.csv, .xlsx';
        input.onchange = () => {
          if (input.files[0]) alert(`Successfully imported patients from ${input.files[0].name}`);
        };
        input.click();
      });
    }
  });
}

function setupDoctorReportsInteractivity(doc, navigate) {
  // Search
  const searchInput = doc.querySelector('input[placeholder*="Search"], input[type="search"]');
  const rows = doc.querySelectorAll('tbody tr, .report-card, tr');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      rows.forEach(r => {
        if (r.parentElement.tagName === 'TBODY' || r.classList.contains('report-card')) {
          r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        }
      });
    });
  }

  // Date Filter
  const selects = doc.querySelectorAll('select');
  selects.forEach(sel => {
    sel.addEventListener('change', () => {
      alert('Report filter applied.');
    });
  });

  // Export Selected & Checkboxes
  const table = doc.querySelector('table');
  if (table) {
    const theadRow = table.querySelector('thead tr');
    if (theadRow && !theadRow.querySelector('.chk-all')) {
      const th = doc.createElement('th');
      th.className = 'p-3 w-10';
      th.innerHTML = `<input type="checkbox" class="chk-all" />`;
      theadRow.insertBefore(th, theadRow.firstChild);

      const tbodyRows = table.querySelectorAll('tbody tr');
      tbodyRows.forEach(row => {
        const td = doc.createElement('td');
        td.className = 'p-3 w-10';
        td.innerHTML = `<input type="checkbox" class="chk-row" />`;
        row.insertBefore(td, row.firstChild);
      });

      theadRow.querySelector('.chk-all').onchange = (e) => {
        table.querySelectorAll('.chk-row').forEach(cb => cb.checked = e.target.checked);
      };
    }
  }

  const buttons = doc.querySelectorAll('button');
  buttons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('export') || text.includes('download')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const csvContent = "data:text/csv;charset=utf-8,ReportID,Patient,Test,Result,Status,Date\nREP-101,Ananya Sharma,CBC,Normal,Completed,2026-07-26\nREP-102,Rahul Verma,Lipid Profile,Borderline,Completed,2026-07-25";
        const encodedUri = encodeURI(csvContent);
        const link = doc.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "pdc_reports_export.csv");
        doc.body.appendChild(link);
        link.click();
        link.remove();
      });
    } else if (text.includes('view report') || text.includes('open report')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/reports/1');
      });
    }
  });
}

function setupDoctorAppointmentsInteractivity(doc, navigate) {
  const buttons = doc.querySelectorAll('button');
  buttons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('new appointment') || text.includes('add appointment')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/order');
      });
    } else if (text === 'week' || text === 'day' || text === 'month') {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        buttons.forEach(b => {
          if (b.textContent.toLowerCase() === 'week' || b.textContent.toLowerCase() === 'day' || b.textContent.toLowerCase() === 'month') {
            b.classList.remove('bg-emerald-600', 'text-white');
          }
        });
        btn.classList.add('bg-emerald-600', 'text-white');
      });
    } else if (text.includes('start') || text.includes('join')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/teleconsult');
      });
    } else if (text.includes('accept')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.textContent = 'Accepted ✓';
        btn.disabled = true;
        btn.className = 'px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded font-bold';
      });
    }
  });
}

function setupTestOrderingInteractivity(doc, navigate) {
  const submitBtn = doc.querySelector('button[type="submit"], button:contains("Submit"), button:contains("Order")');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Diagnostic prescription order submitted successfully to PDC Laboratory!');
      navigate('/reports');
    });
  }
}

function setupDoctorMessagingInteractivity(doc) {
  const contacts = doc.querySelectorAll('.chat-contact, [class*="contact"], li, tr');
  contacts.forEach(c => {
    c.style.cursor = 'pointer';
    c.addEventListener('click', () => {
      const name = c.querySelector('h3, h4, span, p')?.textContent || 'Patient Consultation';
      const headerTitle = doc.querySelector('.chat-header h2, .chat-header h3, header h2, header h3');
      if (headerTitle) headerTitle.textContent = name;
    });
  });

  const sendBtn = doc.querySelector('button[type="submit"], button');
  const input = doc.querySelector('input[type="text"], textarea');
  const chatContainer = doc.querySelector('.chat-messages, main section div:has(.bg-blue-500), main');

  if (sendBtn && input) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!input.value.trim()) return;
      const text = input.value.trim();
      input.value = '';
      if (chatContainer) {
        const bubble = doc.createElement('div');
        bubble.className = 'flex justify-end my-2';
        bubble.innerHTML = `<div class="bg-emerald-600 text-white p-3 rounded-xl text-sm">${text}</div>`;
        chatContainer.appendChild(bubble);
      }
    });
  }
}

function setupDoctorAlertsInteractivity(doc, navigate) {
  const buttons = doc.querySelectorAll('button');
  buttons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('view report')) {
      btn.addEventListener('click', (e) => { e.preventDefault(); navigate('/reports'); });
    } else if (text.includes('message patient')) {
      btn.addEventListener('click', (e) => { e.preventDefault(); navigate('/chat'); });
    } else if (text.includes('call now')) {
      btn.addEventListener('click', (e) => { e.preventDefault(); navigate('/teleconsult'); });
    } else if (text.includes('accept')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.textContent = 'Accepted';
        btn.disabled = true;
      });
    } else if (text.includes('schedule follow-up')) {
      btn.addEventListener('click', (e) => { e.preventDefault(); navigate('/appointments'); });
    }
  });
}

function setupDoctorAnalyticsInteractivity(doc) {
  const selects = doc.querySelectorAll('select');
  selects.forEach(sel => {
    sel.addEventListener('change', (e) => {
      alert(`Analytics updated for: ${e.target.value}`);
    });
  });

  const exportBtns = doc.querySelectorAll('button');
  exportBtns.forEach(btn => {
    if (btn.textContent.toLowerCase().includes('export')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Downloading Analytics Report...');
      });
    }
  });
}

function setupDoctorProfileInteractivity(doc) {
  const editBtns = doc.querySelectorAll('button');
  editBtns.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('edit profile') || text.includes('edit details')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        let modal = doc.querySelector('#doc-profile-modal');
        if (!modal) {
          modal = doc.createElement('div');
          modal.id = 'doc-profile-modal';
          modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-800">
              <h3 class="text-lg font-bold mb-4">Edit Doctor Profile</h3>
              <form id="doc-prof-form" class="space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Doctor Name</label>
                  <input type="text" id="doc-name" value="Dr. Sarah Jenkins" class="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Specialization</label>
                  <input type="text" id="doc-spec" value="Consultant Pathologist & Hematologist" class="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Degree / Qualification</label>
                  <input type="text" id="doc-degree" value="MBBS, MD (Pathology)" class="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div id="proof-container" class="hidden p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <p class="text-xs font-bold text-amber-800">⚠️ Qualification changed. Proof required!</p>
                  <label class="block text-xs text-amber-700">Upload Degree / Certificate Proof:</label>
                  <input type="file" id="doc-proof-file" accept=".pdf,.png,.jpg" class="text-xs text-amber-900" />
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <button type="button" id="close-doc-prof" class="px-4 py-2 text-sm rounded-lg border">Cancel</button>
                  <button type="submit" class="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-semibold">Save Profile</button>
                </div>
              </form>
            </div>
          `;
          doc.body.appendChild(modal);

          const degreeInput = doc.querySelector('#doc-degree');
          const proofContainer = doc.querySelector('#proof-container');
          const initialDegree = degreeInput.value;

          degreeInput.oninput = () => {
            if (degreeInput.value.trim() !== initialDegree.trim()) {
              proofContainer.classList.remove('hidden');
            } else {
              proofContainer.classList.add('hidden');
            }
          };

          doc.querySelector('#close-doc-prof').onclick = () => modal.remove();
          doc.querySelector('#doc-prof-form').onsubmit = (ev) => {
            ev.preventDefault();
            if (!proofContainer.classList.contains('hidden')) {
              const fileInput = doc.querySelector('#doc-proof-file');
              if (!fileInput.files || !fileInput.files[0]) {
                alert('Proof document is required when updating your Degree or Qualification!');
                return;
              }
            }
            alert('Doctor profile updated successfully!');
            modal.remove();
          };
        }
      });
    }
  });
}

function setupDoctorSettingsInteractivity(doc) {
  const inputs = doc.querySelectorAll('input[type="checkbox"], select, button');
  inputs.forEach(el => {
    el.addEventListener('change', () => {
      alert('System setting updated.');
    });
  });
}

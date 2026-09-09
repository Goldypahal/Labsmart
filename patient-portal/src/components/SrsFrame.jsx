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

      // 1. Branding: Update headers / titles to PDC (Pahal Diagnostic Center)
      const brandElements = doc.querySelectorAll('h1, h2, h3, span, p, a');
      brandElements.forEach(el => {
        if (el.children.length === 0) {
          if (el.textContent.includes('DiagConnect') || el.textContent.includes('HealthCenter') || el.textContent.includes('LabSmart')) {
            el.textContent = el.textContent.replace(/DiagConnect|HealthCenter|LabSmart/g, 'PDC (Pahal Diagnostic Center)');
          }
        }
      });

      // 2. Click Interception for Navigation
      doc.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, [role="button"], tr, div');
        if (!target) return;

        const href = target.getAttribute('href');
        const text = (target.textContent || '').trim().toLowerCase();

        // Check explicit routes or known button text
        let targetRoute = null;

        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          if (href.includes('book_appointment') || href.includes('booking')) targetRoute = '/book-test';
          else if (href.includes('lab_report') || href.includes('reports')) targetRoute = '/reports';
          else if (href.includes('health_record') || href.includes('history')) targetRoute = '/history';
          else if (href.includes('chat') || href.includes('consultation')) targetRoute = '/chat';
          else if (href.includes('notification')) targetRoute = '/notifications';
          else if (href.includes('map') || href.includes('route')) targetRoute = '/live-map';
          else if (href.includes('profile')) targetRoute = '/profile';
          else if (href.includes('settings') || href.includes('abha')) targetRoute = '/settings';
        }

        if (!targetRoute) {
          if (text.includes('book appointment') || text.includes('book a test') || text.includes('new appointment') || text.includes('schedule test')) {
            targetRoute = '/book-test';
          } else if (text === 'my reports' || text.includes('view detailed report') || text.includes('view full report')) {
            targetRoute = '/reports';
          } else if (text.includes('chat') || text.includes('consultation') || text.includes('message doctor')) {
            targetRoute = '/chat';
          } else if (text.includes('notification')) {
            targetRoute = '/notifications';
          } else if (text.includes('test history') || text.includes('health record')) {
            targetRoute = '/history';
          } else if (text === 'profile' || text.includes('view profile')) {
            targetRoute = '/profile';
          } else if (text === 'settings' || text.includes('account settings')) {
            targetRoute = '/settings';
          }
        }

        if (targetRoute) {
          e.preventDefault();
          e.stopPropagation();
          navigate(targetRoute);
        }
      }, true);

      // 3. Page Specific Interactive Logic
      
      // CHAT INTERACTIVITY
      if (folder.includes('chat')) {
        setupChatInteractivity(doc);
      }

      // NOTIFICATIONS INTERACTIVITY
      if (folder.includes('notification')) {
        setupNotificationInteractivity(doc, navigate);
      }

      // PROFILE INTERACTIVITY
      if (folder.includes('profile') || folder.includes('member_health')) {
        setupProfileInteractivity(doc);
      }

      // SETTINGS INTERACTIVITY
      if (folder.includes('settings') || folder.includes('abha')) {
        setupSettingsInteractivity(doc);
      }

      // APPOINTMENT / BOOKING INTERACTIVITY
      if (folder.includes('appointment') || folder.includes('booking')) {
        setupBookingInteractivity(doc, navigate);
      }

    } catch (err) {
      console.warn('Could not inject iframe interactivity due to cross-origin restriction:', err);
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

// Interactive helper handlers for Patient Portal

function setupChatInteractivity(doc) {
  // Contact Switching
  const contacts = doc.querySelectorAll('.chat-contact, [class*="contact"], [class*="user-item"], [class*="peer"], li');
  contacts.forEach(contact => {
    if (contact.textContent.trim()) {
      contact.style.cursor = 'pointer';
      contact.addEventListener('click', () => {
        const name = contact.querySelector('h3, h4, span, p')?.textContent || 'Dr. Sarah Jenkins';
        const headerTitle = doc.querySelector('.chat-header h2, .chat-header h3, header h2, header h3');
        if (headerTitle) headerTitle.textContent = name;
      });
    }
  });

  // Sending Messages
  const sendBtn = doc.querySelector('button[type="submit"], button:has(svg), .send-btn, button');
  const input = doc.querySelector('input[type="text"], textarea');
  const chatContainer = doc.querySelector('.chat-messages, .messages-list, main section div:has(.bg-blue-500), main div.space-y-4, main');

  const sendMessage = () => {
    if (!input || !input.value.trim()) return;
    const msgText = input.value.trim();
    input.value = '';

    if (chatContainer) {
      const msgBubble = doc.createElement('div');
      msgBubble.className = 'flex justify-end my-2';
      msgBubble.innerHTML = `
        <div class="bg-emerald-600 text-white p-3 rounded-2xl max-w-xs shadow-sm text-sm">
          <p>${msgText}</p>
          <span class="text-[10px] opacity-75 block text-right mt-1">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      `;
      chatContainer.appendChild(msgBubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  if (sendBtn) sendBtn.addEventListener('click', (e) => { e.preventDefault(); sendMessage(); });
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // File Attachment
  const attachBtn = doc.querySelector('button:has(svg), [aria-label*="attach"], [aria-label*="File"]');
  if (attachBtn) {
    let fileInput = doc.querySelector('#chat-file-input');
    if (!fileInput) {
      fileInput = doc.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'chat-file-input';
      fileInput.style.display = 'none';
      doc.body.appendChild(fileInput);
    }

    attachBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0] && chatContainer) {
        const file = fileInput.files[0];
        const fileMsg = doc.createElement('div');
        fileMsg.className = 'flex justify-end my-2';
        fileMsg.innerHTML = `
          <div class="bg-emerald-50 text-emerald-900 border border-emerald-300 p-3 rounded-xl max-w-xs shadow-sm text-sm flex items-center gap-2">
            <span class="font-bold">📎 ${file.name}</span>
            <span class="text-xs opacity-75">(${(file.size/1024).toFixed(1)} KB)</span>
          </div>
        `;
        chatContainer.appendChild(fileMsg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }
}

function setupNotificationInteractivity(doc, navigate) {
  const offerBtns = doc.querySelectorAll('button, a');
  offerBtns.forEach(btn => {
    if (btn.textContent.toLowerCase().includes('view offer') || btn.textContent.toLowerCase().includes('claim')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        let modal = doc.querySelector('#offer-modal');
        if (!modal) {
          modal = doc.createElement('div');
          modal.id = 'offer-modal';
          modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-emerald-500/20 text-slate-800">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-emerald-600">🎉 Special Health Package Offer</h3>
                <button id="close-offer" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
              </div>
              <p class="text-sm text-slate-600 mb-4">
                Get 20% off on PDC Full Body Preventive Health Checkup Package. Offer valid until end of month!
              </p>
              <div class="bg-emerald-50 p-3 rounded-xl mb-6 text-center font-mono font-bold text-emerald-700">
                PROMO CODE: PDC20
              </div>
              <div class="flex justify-end gap-3">
                <button id="cancel-offer" class="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100">Close</button>
                <button id="book-offer" class="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Book Test Now</button>
              </div>
            </div>
          `;
          doc.body.appendChild(modal);
          doc.querySelector('#close-offer').onclick = () => modal.remove();
          doc.querySelector('#cancel-offer').onclick = () => modal.remove();
          doc.querySelector('#book-offer').onclick = () => {
            modal.remove();
            navigate('/book-test');
          };
        }
      });
    }
  });
}

function setupProfileInteractivity(doc) {
  const editBtns = doc.querySelectorAll('button');
  editBtns.forEach(btn => {
    if (btn.textContent.toLowerCase().includes('edit profile') || btn.textContent.toLowerCase().includes('edit info')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        let modal = doc.querySelector('#edit-profile-modal');
        if (!modal) {
          modal = doc.createElement('div');
          modal.id = 'edit-profile-modal';
          modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-800">
              <h3 class="text-lg font-bold mb-4">Edit Profile Details</h3>
              <form id="profile-form" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                  <input type="text" id="prof-name" value="Rajesh Kumar" class="w-full p-2.5 rounded-lg border border-slate-300 text-sm" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                    <input type="text" id="prof-phone" value="+91 98765 43210" class="w-full p-2.5 rounded-lg border border-slate-300 text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Blood Group</label>
                    <input type="text" id="prof-blood" value="O positive" class="w-full p-2.5 rounded-lg border border-slate-300 text-sm" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                  <input type="email" id="prof-email" value="rajesh.kumar@example.com" class="w-full p-2.5 rounded-lg border border-slate-300 text-sm" />
                </div>
                <div class="flex justify-end gap-3 pt-2">
                  <button type="button" id="close-prof" class="px-4 py-2 text-sm rounded-lg border border-slate-300">Cancel</button>
                  <button type="submit" class="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-semibold">Save Changes</button>
                </div>
              </form>
            </div>
          `;
          doc.body.appendChild(modal);
          doc.querySelector('#close-prof').onclick = () => modal.remove();
          doc.querySelector('#profile-form').onsubmit = (ev) => {
            ev.preventDefault();
            const newName = doc.querySelector('#prof-name').value;
            const nameElements = doc.querySelectorAll('h1, h2, h3, p');
            nameElements.forEach(el => {
              if (el.textContent.includes('Rajesh')) el.textContent = newName;
            });
            modal.remove();
            alert('Profile details updated successfully!');
          };
        }
      });
    }
  });
}

function setupSettingsInteractivity(doc) {
  // Language selector
  const langSelects = doc.querySelectorAll('select');
  langSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      alert(`Language updated to: ${e.target.value}`);
    });
  });

  // 2FA Toggles and Buttons
  const buttons = doc.querySelectorAll('button, input[type="checkbox"]');
  buttons.forEach(btn => {
    const text = (btn.textContent || '').toLowerCase();
    if (text.includes('export data') || text.includes('download data')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ patient: "Rajesh Kumar", center: "PDC", records: 12 }, null, 2));
        const downloadAnchor = doc.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "pdc_patient_health_data.json");
        doc.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    } else if (text.includes('2-factor') || text.includes('2fa') || text.includes('two-factor')) {
      btn.addEventListener('click', () => {
        alert('Two-Factor Authentication setting updated.');
      });
    }
  });
}

function setupBookingInteractivity(doc, navigate) {
  const confirmBtns = doc.querySelectorAll('button');
  confirmBtns.forEach(btn => {
    const text = (btn.textContent || '').toLowerCase();
    if (text.includes('confirm booking') || text.includes('book appointment') || text.includes('proceed to pay')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Appointment successfully booked with PDC (Pahal Diagnostic Center)!');
        navigate('/appointments');
      });
    }
  });
}
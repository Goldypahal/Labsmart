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

      // 1. Branding: PDC (Pahal Diagnostic Center)
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
          if (href.includes('lab_portal') || href.includes('dashboard')) targetRoute = '/dashboard';
          else if (href.includes('orders')) targetRoute = '/orders';
          else if (href.includes('results') || href.includes('detailed_lab_report')) targetRoute = '/results';
          else if (href.includes('reports') || href.includes('official_medical_reports')) targetRoute = '/reports';
          else if (href.includes('billing') || href.includes('payments')) targetRoute = '/billing';
        }

        if (!targetRoute) {
          if (text.includes('orders queue') || text === 'orders') targetRoute = '/orders';
          else if (text.includes('result entry') || text.includes('enter results')) targetRoute = '/results';
          else if (text === 'reports' || text.includes('official reports')) targetRoute = '/reports';
          else if (text.includes('billing') || text.includes('payments')) targetRoute = '/billing';
          else if (text === 'dashboard') targetRoute = '/dashboard';
        }

        if (targetRoute) {
          e.preventDefault();
          e.stopPropagation();
          navigate(targetRoute);
        }
      }, true);

      // 3. Feature Interactivity for Lab Portal

      // ORDERS QUEUE / DASHBOARD
      if (folder.includes('lab_portal')) {
        setupLabOrdersInteractivity(doc, navigate);
      }

      // RESULT ENTRY
      if (folder.includes('detailed_lab_report') || folder.includes('result')) {
        setupLabResultEntryInteractivity(doc, navigate);
      }

      // OFFICIAL REPORTS
      if (folder.includes('official_medical_reports') || folder.includes('reports')) {
        setupLabOfficialReportsInteractivity(doc);
      }

      // BILLING & PAYMENTS
      if (folder.includes('billing') || folder.includes('payments')) {
        setupLabBillingInteractivity(doc);
      }

    } catch (err) {
      console.warn('Could not inject lab portal iframe interactivity:', err);
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

// Helpers for Lab Portal

function setupLabOrdersInteractivity(doc, navigate) {
  // Search
  const searchInput = doc.querySelector('input[placeholder*="Search"], input[type="search"]');
  const rows = doc.querySelectorAll('tbody tr, table tr');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      rows.forEach(r => {
        if (r.parentElement.tagName === 'TBODY') {
          r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        }
      });
    });
  }

  // Buttons inside order table
  const buttons = doc.querySelectorAll('button');
  buttons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('enter result') || text.includes('add result')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/results');
      });
    } else if (text.includes('view order') || text.includes('details')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Displaying Lab Order details for PDC Technician review.');
      });
    }
  });
}

function setupLabResultEntryInteractivity(doc, navigate) {
  const submitBtns = doc.querySelectorAll('button');
  submitBtns.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('submit result') || text.includes('verify & submit') || text.includes('save report')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Lab results successfully verified and saved to PDC Central System!');
        navigate('/reports');
      });
    }
  });
}

function setupLabOfficialReportsInteractivity(doc) {
  const buttons = doc.querySelectorAll('button');
  buttons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('print') || text.includes('download pdf') || text.includes('export report')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Generating Official Medical Report PDF (PDC Diagnostic Center Header)...');
      });
    }
  });
}

function setupLabBillingInteractivity(doc) {
  const buttons = doc.querySelectorAll('button');
  buttons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('collect payment') || text.includes('mark paid') || text.includes('process payment')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Payment collected successfully. Invoice receipt generated!');
      });
    }
  });
}
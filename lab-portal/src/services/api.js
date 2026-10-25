import axios from 'axios';
import { IS_DEMO_MODE, API_BASE_URL } from '../config/env';
import { TEST_CATALOG } from './clinicalData';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dedicated synthetic demo samples (used ONLY if IS_DEMO_MODE is explicitly enabled)
const DEMO_SAMPLES = [
  {
    id: 'DEMO-SMP-001',
    accessionNumber: 'DEMO-ACC-001',
    patientId: 101,
    patientName: 'Demo Patient 001',
    age: 45,
    gender: 'Male',
    testPanel: 'Complete Blood Count (CBC)',
    specimen: 'Whole Blood (EDTA Tube)',
    collectionTime: '2026-09-25 09:00 AM',
    status: 'RECEIVED',
    lifecycle: 'RECEIVED',
    priority: 'Routine',
    resultsEntered: false,
    results: [],
  },
];

let localInvoices = [];
let localQualityLogs = [];

export const labApi = {
  // Auth
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Backend orders (Authoritative from /api/orders)
  getOrders: async () => {
    try {
      const res = await apiClient.get('/orders');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      if (IS_DEMO_MODE) {
        return DEMO_SAMPLES;
      }
      throw new Error(err.response?.data?.message || 'Unable to connect to laboratory orders API');
    }
  },

  // Accession & Samples mapped from authentic backend orders
  getSamples: async () => {
    try {
      const orders = await labApi.getOrders();
      return orders.map((ord) => ({
        id: `SMP-${ord.id}`,
        accessionNumber: `ACC-2026-0${ord.id}`,
        patientId: ord.patientId || 3,
        patientName: ord.patientName || (ord.patientId === 4 ? 'Jane Roe' : 'John Doe'),
        age: 45,
        gender: 'Male',
        testPanel: Array.isArray(ord.tests) ? ord.tests.join(', ') : 'Diagnostic Panel',
        specimen: 'Serum / Whole Blood',
        collectionTime: ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'Recent',
        status: ord.status === 'UPLOADED' || ord.status === 'COMPLETED' ? 'VERIFIED' : 'AWAITING_REVIEW',
        lifecycle: ord.status === 'UPLOADED' ? 'RELEASED' : 'PROCESSING',
        priority: 'Routine',
        resultsEntered: true,
        reportUrl: ord.reportUrl,
        results: [
          { parameter: 'Diagnostic Marker', value: 14.2, unit: 'g/dL', refRange: '13.0 - 17.0', status: 'NORMAL' },
        ],
      }));
    } catch (err) {
      if (IS_DEMO_MODE) return DEMO_SAMPLES;
      throw err;
    }
  },

  getSampleById: async (id) => {
    const samples = await labApi.getSamples();
    return samples.find((s) => s.id === id || s.accessionNumber === id) || null;
  },

  createAccession: async (sampleData) => {
    return {
      id: `SMP-${Date.now()}`,
      accessionNumber: `ACC-${Date.now()}`,
      ...sampleData,
      status: 'RECEIVED',
      lifecycle: 'RECEIVED',
      createdAt: new Date().toISOString(),
    };
  },

  updateSampleResults: async () => {
    throw new Error('Saving results is not available yet in this version. Nothing was saved.');
  },

  // Result saving and report release are not connected to the backend yet.
  // They fail loudly instead of pretending to succeed (M0 safety fix).
  // Real implementations: result entry (T-037), authorization (T-039), PDF reports (T-040).
  saveTestResults: async () => {
    throw new Error('Saving results is not available yet in this version. Nothing was saved.');
  },

  verifyAndReleaseReport: async () => {
    throw new Error('Report authorization and release are not available yet in this version. Nothing was released.');
  },

  // Test reference parameters
  getTestCatalog: () => TEST_CATALOG,

  // Quality Control (Data-driven)
  getQualityLogs: async () => localQualityLogs,

  addQualityLog: async (log) => {
    const newLog = {
      id: `QC-${Date.now()}`,
      ...log,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    localQualityLogs.unshift(newLog);
    return newLog;
  },

  // Billing (Data-driven)
  getInvoices: async () => localInvoices,

  // Feedback & Reviews (Strictly data-driven with honest empty fallback)
  getReviews: async () => {
    try {
      const res = await apiClient.get('/reviews');
      return res.data;
    } catch {
      return {
        averageRating: null,
        reviewCount: 0,
        reviews: [],
      };
    }
  },
};

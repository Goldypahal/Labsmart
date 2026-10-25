import axios from 'axios';
import { IS_DEMO_MODE, API_BASE_URL } from '../config/env';
import { TEST_CATALOG } from './clinicalData';

// Create configured Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Auth token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dedicated synthetic fixtures used ONLY if IS_DEMO_MODE is true (fails closed in production)
const DEMO_FIXTURES = {
  patients: [
    {
      id: 101,
      name: 'Demo Patient 001',
      age: 45,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+91 00000 00001',
      abhaId: 'DEMO-ABHA-001',
      address: 'Demo Address 001',
      chronicConditions: ['Hypertension (Demonstration)'],
    },
    {
      id: 102,
      name: 'Demo Patient 002',
      age: 34,
      gender: 'Female',
      bloodGroup: 'B+',
      phone: '+91 00000 00002',
      abhaId: 'DEMO-ABHA-002',
      address: 'Demo Address 002',
      chronicConditions: ['None Reported'],
    },
  ],
};

export const clinicalApi = {
  checkHealth: async () => {
    try {
      const res = await apiClient.get('/health');
      return res.data;
    } catch {
      return { status: 'offline' };
    }
  },

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

  // Patients (Authoritative: strictly from backend /api/patients)
  getPatients: async () => {
    try {
      const res = await apiClient.get('/patients');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      if (IS_DEMO_MODE) {
        return DEMO_FIXTURES.patients;
      }
      throw new Error(err.response?.data?.message || 'Unable to connect to hospital patients API');
    }
  },

  getPatientById: async (id) => {
    const patients = await clinicalApi.getPatients();
    return patients.find((p) => p.id === Number(id)) || null;
  },

  // Test Ordering & Prescriptions (Backend /api/prescriptions)
  createDiagnosticOrder: async (payload) => {
    const { patientId, tests } = payload;
    const res = await apiClient.post('/prescriptions', {
      patientId: Number(patientId),
      tests,
    });
    return res.data;
  },

  getPrescriptions: async () => {
    try {
      const res = await apiClient.get('/prescriptions');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      if (IS_DEMO_MODE) {
        return [];
      }
      throw new Error(err.response?.data?.message || 'Unable to connect to prescriptions API');
    }
  },

  updatePrescription: async (id, tests) => {
    const res = await apiClient.patch(`/prescriptions/${id}`, { tests });
    return res.data;
  },

  // Reports & Test Orders (Backend /api/orders)
  getReports: async () => {
    try {
      const res = await apiClient.get('/orders');
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  getReportById: async (id) => {
    const reports = await clinicalApi.getReports();
    return reports.find((r) => r.id === Number(id)) || null;
  },

  acknowledgeCriticalResult: async (reportId) => {
    return { id: reportId, criticalAcknowledged: true, acknowledgedAt: new Date().toISOString() };
  },

  markReportReviewed: async (reportId) => {
    return { id: reportId, reviewedByDoctor: true, reviewedAt: new Date().toISOString() };
  },

  // Standard Test Reference Catalog (Static Clinical Reference Knowledge)
  getTestCatalog: () => TEST_CATALOG,

  // Appointments (Data-driven: returns empty array if no backend endpoint)
  getAppointments: async () => {
    return [];
  },

  createAppointment: async (appointment) => {
    return {
      id: `APT-${Date.now()}`,
      ...appointment,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
  },

  // Clinical Notes
  getClinicalNotes: async () => {
    return [];
  },

  createClinicalNote: async (note) => {
    return {
      id: `NOTE-${Date.now()}`,
      ...note,
      createdAt: new Date().toISOString(),
    };
  },

  // Notifications & Alerts
  getNotifications: async () => {
    return [];
  },

  // Reviews & Feedback (Strictly data-driven with honest empty fallback)
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

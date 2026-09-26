import axios from 'axios';
import {
  TEST_CATALOG,
  INITIAL_PATIENTS,
  INITIAL_REPORTS,
} from './clinicalData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
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

// Patient identity: John Doe (ID: 3)
const CURRENT_PATIENT = INITIAL_PATIENTS[0];

let localBookings = [
  {
    id: 'BKG-2026-901',
    testName: 'Complete Blood Count (CBC) with Differential',
    mode: 'Home Sample Collection',
    address: CURRENT_PATIENT.address,
    date: '2026-09-27',
    slot: '07:30 AM - 08:30 AM',
    price: 350,
    status: 'CONFIRMED',
    phlebotomist: {
      name: 'Vikas Kumar',
      phone: '+91 98888 11223',
      credential: 'Certified Phlebotomist',
      vaccinationStatus: 'Fully Vaccinated',
    },
    timeline: [
      { title: 'Booking Confirmed', timestamp: '25 Sep, 04:30 PM', status: 'completed', description: 'Order registered and slot reserved.' },
      { title: 'Phlebotomist Assigned', timestamp: '25 Sep, 05:00 PM', status: 'completed', description: 'Vikas Kumar assigned with sterile collection kit.' },
      { title: 'Home Sample Collection', timestamp: '27 Sep, 07:30 AM', status: 'in_progress', description: 'Phlebotomist will arrive with cold-chain box.' },
      { title: 'Central Lab Intake', timestamp: 'Pending', status: 'pending', description: 'Barcode scanning at central pathology.' },
      { title: 'Analyzer Processing', timestamp: 'Pending', status: 'pending', description: 'Running automated hematology assay.' },
      { title: 'Report Release', timestamp: 'Pending', status: 'pending', description: 'Verified report available for download.' },
    ],
  },
];

let localNotifications = [
  {
    id: 'P-NOTIF-1',
    title: 'Your Diagnostic Report is Ready',
    message: 'Your Complete Blood Count (CBC) report from 23 Sep 2026 has been authorized by Dr. Sarah Pathologist and reviewed by Dr. Smith.',
    timestamp: '23 Sep 2026, 01:45 PM',
    read: false,
    link: '/reports',
  },
  {
    id: 'P-NOTIF-2',
    title: 'Upcoming Home Collection Reminder',
    message: 'Home phlebotomist Vikas Kumar is scheduled to arrive tomorrow at 07:30 AM. 10 hours overnight fasting recommended.',
    timestamp: '25 Sep 2026, 06:00 PM',
    read: false,
    link: '/live-map',
  },
];

let localHealthTrends = [
  {
    biomarker: 'Fasting Blood Sugar',
    unit: 'mg/dL',
    target: '< 100',
    history: [
      { date: '2026-03-15', value: 118, flag: 'HIGH' },
      { date: '2026-06-20', value: 106, flag: 'HIGH' },
      { date: '2026-09-21', value: 98, flag: 'NORMAL' },
    ],
  },
  {
    biomarker: 'Hemoglobin',
    unit: 'g/dL',
    target: '13.0 - 17.0',
    history: [
      { date: '2026-03-15', value: 11.8, flag: 'LOW' },
      { date: '2026-06-20', value: 12.1, flag: 'LOW' },
      { date: '2026-09-23', value: 12.4, flag: 'LOW' },
    ],
  },
  {
    biomarker: 'Total Cholesterol',
    unit: 'mg/dL',
    target: '< 200',
    history: [
      { date: '2026-03-15', value: 215, flag: 'HIGH' },
      { date: '2026-06-20', value: 195, flag: 'NORMAL' },
      { date: '2026-09-21', value: 182, flag: 'NORMAL' },
    ],
  },
];

export const patientApi = {
  // Auth
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.token) {
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
    return CURRENT_PATIENT;
  },

  // Reports
  getReports: async () => {
    // Return reports for John Doe (ID: 3)
    return INITIAL_REPORTS.filter((r) => r.patientId === 3);
  },

  getReportById: async (id) => {
    const all = await patientApi.getReports();
    return all.find((r) => r.id === id) || INITIAL_REPORTS[1];
  },

  // Test Booking
  getTestCatalog: () => TEST_CATALOG,

  createBooking: async (bookingData) => {
    const newBooking = {
      id: `BKG-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'CONFIRMED',
      phlebotomist: {
        name: 'Vikas Kumar',
        phone: '+91 98888 11223',
        credential: 'Certified Phlebotomist',
        vaccinationStatus: 'Fully Vaccinated',
      },
      timeline: [
        { title: 'Booking Confirmed', timestamp: 'Just now', status: 'completed', description: 'Order registered and slot reserved.' },
        { title: 'Phlebotomist Assigned', timestamp: 'Today', status: 'completed', description: 'Vikas Kumar assigned with sterile collection kit.' },
        { title: 'Sample Collection', timestamp: bookingData.date, status: 'in_progress', description: 'Collection slot reserved.' },
        { title: 'Central Lab Intake', timestamp: 'Pending', status: 'pending', description: 'Barcode scanning at central pathology.' },
        { title: 'Analyzer Processing', timestamp: 'Pending', status: 'pending', description: 'Running automated assay.' },
        { title: 'Report Release', timestamp: 'Pending', status: 'pending', description: 'Verified report available for download.' },
      ],
      ...bookingData,
    };
    localBookings.unshift(newBooking);
    return newBooking;
  },

  // Patient Feedback & Reviews (Data-driven: returns empty state if backend has no reviews)
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

  getBookings: async () => localBookings,

  getLiveCollection: async () => localBookings[0] || null,

  // Health History Trends
  getHealthTrends: async () => localHealthTrends,

  // Notifications
  getNotifications: async () => localNotifications,
};

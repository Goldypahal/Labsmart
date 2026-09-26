import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Layout from './layouts/Layout';

// Native React Pages
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Emr from './pages/Emr';
import Reports from './pages/Reports';
import OrderTest from './pages/OrderTest';
import Prescriptions from './pages/Prescriptions';
import Appointments from './pages/Appointments';
import Teleconsult from './pages/Teleconsult';
import Notes from './pages/Notes';
import Messaging from './pages/Messaging';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function ProtectedLayout() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<Emr />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<Reports />} />
            <Route path="/order" element={<OrderTest />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/teleconsult" element={<Teleconsult />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/chat" element={<Messaging />} />
            <Route path="/notifications" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/emr" element={<Emr />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

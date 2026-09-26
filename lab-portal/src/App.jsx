import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';

// Native React Pages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import ResultEntry from './pages/ResultEntry';
import Verification from './pages/Verification';
import Reports from './pages/Reports';
import Billing from './pages/Billing';
import Quality from './pages/Quality';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setUser({ role: 'LAB_ADMIN', name: 'City Central Lab' });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Bootstrapping LIMS Station...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLogin={setUser} />;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/results" element={<ResultEntry />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/quality" element={<Quality />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

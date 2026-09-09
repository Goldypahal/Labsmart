import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import SrsFrame from './components/SrsFrame';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('token')) setUser({ role: 'LAB_ADMIN' });
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen grid place-items-center bg-[#f8f9ff] text-[#0b1c30]">Loading…</div>;
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
          <Route path="/dashboard" element={<SrsFrame folder="diagconnect_lab_portal" title="Laboratory Order Management" />} />
          <Route path="/orders" element={<SrsFrame folder="diagconnect_lab_portal" title="Live Order Stream" />} />
          <Route path="/results" element={<SrsFrame folder="detailed_lab_report" title="Laboratory Result Entry" />} />
          <Route path="/reports" element={<SrsFrame folder="official_medical_reports" title="Official Medical Reports" />} />
          <Route path="/billing" element={<SrsFrame folder="diagconnect_billing_payments_portal" title="Billing & Payments" />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

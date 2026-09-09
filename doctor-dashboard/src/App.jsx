import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Layout from './layouts/Layout';
import SrsFrame from './components/SrsFrame';

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
            <Route path="/" element={<SrsFrame folder="diagconnect_doctor_dashboard" title="Doctor Dashboard" />} />
            <Route path="/patients" element={<SrsFrame folder="diagconnect_patient_directory" title="Patient Directory" />} />
            <Route path="/patients/:id" element={<SrsFrame folder="diagconnect_patient_health_record" title="Patient Health Record" />} />
            <Route path="/reports" element={<SrsFrame folder="detailed_lab_report" title="Detailed Lab Reports" />} />
            <Route path="/reports/:id" element={<SrsFrame folder="detailed_lab_report" title="Lab Report Details" />} />
            <Route path="/order" element={<SrsFrame folder="add_new_prescription" title="New Diagnostic Order" />} />
            <Route path="/appointments" element={<SrsFrame folder="diagconnect_book_appointment" title="Doctor Appointments" />} />
            <Route path="/chat" element={<SrsFrame folder="diagconnect_consultation_chat" title="Clinical Consultation Chat" />} />
            <Route path="/notifications" element={<SrsFrame folder="diagconnect_patient_notification_center" title="Patient Alerts & Notifications" />} />
            <Route path="/analytics" element={<SrsFrame folder="detailed_health_trends" title="Analytics & Health Trends" />} />
            <Route path="/emr" element={<SrsFrame folder="diagconnect_patient_health_record" title="Document Vault & EMR" />} />
            <Route path="/notes" element={<SrsFrame folder="diagconnect_prescription_update" title="Clinical Notes & Updates" />} />
            <Route path="/teleconsult" element={<SrsFrame folder="diagconnect_telemedicine_call" title="Telemedicine Consultation" />} />
            <Route path="/prescriptions" element={<SrsFrame folder="diagconnect_prescription_update" title="Prescriptions Update" />} />
            <Route path="/profile" element={<SrsFrame folder="diagconnect_patient_health_record" title="Doctor Profile" />} />
            <Route path="/settings" element={<SrsFrame folder="diagconnect_network_configuration" title="Network & System Settings" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './layouts/Layout';
import SrsFrame from './components/SrsFrame';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<SrsFrame folder="my_lab_results_dashboard" title="My Lab Results" />} />
            <Route path="/reports" element={<SrsFrame folder="detailed_lab_report" title="Detailed Lab Report" />} />
            <Route path="/reports/:id" element={<SrsFrame folder="detailed_lab_report" title="Lab Report Details" />} />
            <Route path="/history" element={<SrsFrame folder="diagconnect_patient_health_record" title="Patient Health Record" />} />
            <Route path="/settings" element={<SrsFrame folder="diagconnect_abha_verification" title="ABHA Verification & Settings" />} />
            <Route path="/live-map" element={<SrsFrame folder="collection_route_map" title="Live Collection Map" />} />
            <Route path="/book-test" element={<SrsFrame folder="diagconnect_book_appointment" title="Book Diagnostic Test" />} />
            <Route path="/appointments" element={<SrsFrame folder="booking_confirmation" title="Appointments & Bookings" />} />
            <Route path="/chat" element={<SrsFrame folder="diagconnect_consultation_chat" title="Consultation Chat & Support" />} />
            <Route path="/notifications" element={<SrsFrame folder="diagconnect_patient_notification_center" title="Notification Center" />} />
            <Route path="/profile" element={<SrsFrame folder="member_health_record" title="Member Health Record & Profile" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

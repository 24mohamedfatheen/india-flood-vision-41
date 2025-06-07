import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmergencyReports from './pages/EmergencyReports';
import EvacuationPlan from './pages/EvacuationPlan';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import EmergencyReportForm from './components/EmergencyReportForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/emergency-reports" element={<EmergencyReports />} />
            <Route path="/evacuation-plan" element={<EvacuationPlan />} />
            <Route path="/emergency-report" element={
              <div className="min-h-screen bg-background py-8">
                <div className="container mx-auto px-4">
                  <EmergencyReportForm />
                </div>
              </div>
            } />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


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
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  console.log('App component rendering');
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <div className="App">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={
                    <ErrorBoundary>
                      <Index />
                    </ErrorBoundary>
                  } />
                  <Route path="/login" element={
                    <ErrorBoundary>
                      <Login />
                    </ErrorBoundary>
                  } />
                  <Route path="/admin" element={
                    <ErrorBoundary>
                      <AdminDashboard />
                    </ErrorBoundary>
                  } />
                  <Route path="/emergency-reports" element={
                    <ErrorBoundary>
                      <EmergencyReports />
                    </ErrorBoundary>
                  } />
                  <Route path="/evacuation-plan" element={
                    <ErrorBoundary>
                      <EvacuationPlan />
                    </ErrorBoundary>
                  } />
                  <Route path="/emergency-report" element={
                    <ErrorBoundary>
                      <div className="min-h-screen bg-background py-8">
                        <div className="container mx-auto px-4">
                          <EmergencyReportForm />
                        </div>
                      </div>
                    </ErrorBoundary>
                  } />
                </Routes>
              </ErrorBoundary>
              <Toaster />
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

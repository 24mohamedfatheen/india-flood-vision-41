
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmergencyReports from "./pages/EmergencyReports";
import SafetyTips from "./pages/SafetyTips";
import SafetyBeforeFlood from "./pages/SafetyBeforeFlood";
import SafetyDuringFlood from "./pages/SafetyDuringFlood";
import SafetyAfterFlood from "./pages/SafetyAfterFlood";
import Emergency from "./pages/Emergency";
import EvacuationPlan from "./pages/EvacuationPlan";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Settings from "./pages/Settings";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                <Route path="/admin" element={<RequireAuth adminOnly={true}><AdminDashboard /></RequireAuth>} />
                <Route path="/emergency-reports" element={<RequireAuth adminOnly={true}><EmergencyReports /></RequireAuth>} />
                <Route path="/safety" element={<RequireAuth><SafetyTips /></RequireAuth>} />
                <Route path="/safety/before-flood" element={<RequireAuth><SafetyBeforeFlood /></RequireAuth>} />
                <Route path="/safety/during-flood" element={<RequireAuth><SafetyDuringFlood /></RequireAuth>} />
                <Route path="/safety/after-flood" element={<RequireAuth><SafetyAfterFlood /></RequireAuth>} />
                <Route path="/emergency" element={<RequireAuth><Emergency /></RequireAuth>} />
                <Route path="/evacuation-plan" element={<RequireAuth><EvacuationPlan /></RequireAuth>} />
                <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
                <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;

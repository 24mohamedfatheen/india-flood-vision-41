
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import RequireAuth from "./components/RequireAuth";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SafetyTips from "./pages/SafetyTips";
import SafetyBeforeFlood from "./pages/SafetyBeforeFlood";
import SafetyDuringFlood from "./pages/SafetyDuringFlood";
import SafetyAfterFlood from "./pages/SafetyAfterFlood";
import Emergency from "./pages/Emergency";
import EmergencyReports from "./pages/EmergencyReports";
import EvacuationPlan from "./pages/EvacuationPlan";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <RequireAuth>
                    <Index />
                  </RequireAuth>
                } />
                <Route path="/about" element={
                  <RequireAuth>
                    <About />
                  </RequireAuth>
                } />
                <Route path="/contact" element={
                  <RequireAuth>
                    <Contact />
                  </RequireAuth>
                } />
                <Route path="/safety-tips" element={
                  <RequireAuth>
                    <SafetyTips />
                  </RequireAuth>
                } />
                <Route path="/safety-before-flood" element={
                  <RequireAuth>
                    <SafetyBeforeFlood />
                  </RequireAuth>
                } />
                <Route path="/safety-during-flood" element={
                  <RequireAuth>
                    <SafetyDuringFlood />
                  </RequireAuth>
                } />
                <Route path="/safety-after-flood" element={
                  <RequireAuth>
                    <SafetyAfterFlood />
                  </RequireAuth>
                } />
                <Route path="/emergency" element={
                  <RequireAuth>
                    <Emergency />
                  </RequireAuth>
                } />
                <Route path="/emergency-reports" element={
                  <RequireAuth>
                    <EmergencyReports />
                  </RequireAuth>
                } />
                <Route path="/evacuation-plan" element={
                  <RequireAuth>
                    <EvacuationPlan />
                  </RequireAuth>
                } />
                <Route path="/admin" element={
                  <RequireAuth adminOnly={true}>
                    <AdminDashboard />
                  </RequireAuth>
                } />
                <Route path="/settings" element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;


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
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Navigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/safety-tips" element={<SafetyTips />} />
                <Route path="/safety-before-flood" element={<SafetyBeforeFlood />} />
                <Route path="/safety-during-flood" element={<SafetyDuringFlood />} />
                <Route path="/safety-after-flood" element={<SafetyAfterFlood />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/emergency-reports" element={
                  <RequireAuth>
                    <EmergencyReports />
                  </RequireAuth>
                } />
                <Route path="/evacuation-plan" element={<EvacuationPlan />} />
                <Route path="/admin" element={
                  <RequireAuth adminOnly={true}>
                    <AdminDashboard />
                  </RequireAuth>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

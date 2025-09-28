import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthProvider } from "@/context/AuthContext";

// User pages
import Dashboard from "./pages/Dashboard";
import Alumni from "./pages/Alumni";
import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import Donations from "./pages/Donations";
import PersonalMessages from "./pages/PersonalMessages";
import Communications from "./pages/Communications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Auth pages
import { Login } from "./pages/auth/Login";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { OTPVerification } from "./pages/auth/OTPVerification";
import { ResetPassword } from "./pages/auth/ResetPassword";

// Admin pages
import { Dashboard as AdminDashboard } from "./pages/admin/Dashboard";
import { Alumni as AdminAlumni } from "./pages/admin/Alumni";
import { Events as AdminEvents } from "./pages/admin/Events";
import { Jobs as AdminJobs } from "./pages/admin/Jobs";
import { Donations as AdminDonations } from "./pages/admin/Donations";
import { Communications as AdminCommunications } from "./pages/admin/Communications";
import { Analytics as AdminAnalytics } from "./pages/admin/Analytics";
import { Settings as AdminSettings } from "./pages/admin/Settings";
import { AuthLayout } from "./components/layout/AuthLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes - No Sidebar */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="otp-verification" element={<OTPVerification />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>
            
            {/* Protected User Routes - With Sidebar */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="alumni" element={<Alumni />} />
              <Route path="events" element={<Events />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/post" element={<PostJob />} />
              <Route path="donations" element={<Donations />} />
              <Route path="messages" element={<PersonalMessages />} />
              <Route path="communications" element={<Communications />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Protected Admin Routes - With Sidebar */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="alumni" element={<AdminAlumni />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="communications" element={<AdminCommunications />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientProjects } from './pages/client/ClientProjects';
import { ClientProjectDetail } from './pages/client/ClientProjectDetail';
import { ClientReportView } from './pages/client/ClientReportView';
import { ClientPayments } from './pages/client/ClientPayments';
import { ClientDisputes } from './pages/client/ClientDisputes';

// Freelancer Pages
import { FreelancerDashboard } from './pages/freelancer/FreelancerDashboard';
import { FreelancerProjects } from './pages/freelancer/FreelancerProjects';
import { FreelancerSubmit } from './pages/freelancer/FreelancerSubmit';
import { FreelancerFeedback } from './pages/freelancer/FreelancerFeedback';
import { FreelancerPayments } from './pages/freelancer/FreelancerPayments';

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'client' | 'freelancer' }> = ({
  children,
  allowedRole,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Client Routes */}
            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute allowedRole="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/projects"
              element={
                <ProtectedRoute allowedRole="client">
                  <ClientProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/projects/:id"
              element={
                <ProtectedRoute allowedRole="client">
                  <ClientProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/milestones/:id/report"
              element={
                <ProtectedRoute allowedRole="client">
                  <ClientReportView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/payments"
              element={
                <ProtectedRoute allowedRole="client">
                  <ClientPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/disputes"
              element={
                <ProtectedRoute allowedRole="client">
                  <ClientDisputes />
                </ProtectedRoute>
              }
            />

            {/* Freelancer Routes */}
            <Route
              path="/freelancer/dashboard"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <FreelancerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/projects"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <FreelancerProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/milestones/:id/submit"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <FreelancerSubmit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/milestones/:id/feedback"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <FreelancerFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/payments"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <FreelancerPayments />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

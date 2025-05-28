
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import { AuthProvider } from '@/contexts/AuthContext';
    import ProtectedRoute from '@/components/auth/ProtectedRoute';
    import Layout from '@/components/layout/Layout';
    import LoginPage from '@/pages/LoginPage';
    import DashboardPage from '@/pages/DashboardPage';
    import ClientSitesPage from '@/pages/ClientSitesPage';
    import HistoryPage from '@/pages/HistoryPage';
    import ReportsPage from '@/pages/ReportsPage';
    import SettingsPage from '@/pages/SettingsPage';
    import NotFoundPage from '@/pages/NotFoundPage';
    import { Toaster } from '@/components/ui/toaster';

    function App() {
      return (
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout><DashboardPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sites" 
                element={
                  <ProtectedRoute>
                    <Layout><ClientSitesPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/historique" 
                element={
                  <ProtectedRoute>
                    <Layout><HistoryPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rapports" 
                element={
                  <ProtectedRoute>
                    <Layout><ReportsPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/parametres" 
                element={
                  <ProtectedRoute>
                    <Layout><SettingsPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      );
    }

    export default App;
  
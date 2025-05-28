
    import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';

    const ProtectedRoute = ({ children }) => {
      const { isAuthenticated, loading } = useAuth();
      const location = useLocation();

      if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>Chargement...</p></div>;
      }

      if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      return children;
    };

    export default ProtectedRoute;
  
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContextValue';

const dashboardPathByRole = {
  admin: '/admin',
  artisan: '/artisan',
  customer: '/customer',
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = userProfile?.role;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={dashboardPathByRole[role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;

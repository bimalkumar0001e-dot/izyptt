
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminIndex: React.FC = () => {
  const location = useLocation();
  
  // If the user navigates to /admin, redirect to /admin/dashboard
  if (location.pathname === '/admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return null;
};

export default AdminIndex;


import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else if (user.role === 'delivery') {
        navigate('/delivery/dashboard');
      } else {
        // Customer
        navigate('/home');
      }
    } else if (!isLoading && !isAuthenticated) {
      // Not logged in, go to home page (for customers to register)
      navigate('/home');
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Show loading or redirect to home for now
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return <Navigate to="/home" replace />;
};

export default Index;

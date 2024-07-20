import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Route 
      {...rest} 
      element={isAuthenticated && user ? <Component userId={user.uid} /> : <Navigate to="/login" />}
    />
  );
};

export default ProtectedRoute;

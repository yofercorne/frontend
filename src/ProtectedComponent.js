import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedComponent = ({ component: Component }) => {
  const { isAuthenticated, user } = useAuth();

  return isAuthenticated && user ? <Component userId={user.uid} /> : <Navigate to="/login" replace />;
};

export default ProtectedComponent;

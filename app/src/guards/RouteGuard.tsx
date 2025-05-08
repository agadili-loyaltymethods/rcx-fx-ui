// RouteGuard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const hasPermission = (): boolean => {
    // Your permission checking logic here
    return true; // Replace with actual implementation
  };

  if (!hasPermission()) {
    // Redirect to dashboard if no permission
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
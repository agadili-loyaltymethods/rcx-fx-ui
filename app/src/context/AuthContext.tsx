import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isLoggedIn: () => boolean;
  logoutUser: () => void;
  pathPermissionMap: Record<string, any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const isLoggedIn = useCallback((): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  }, []);

  const logoutUser = useCallback((): void => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const value = {
    isLoggedIn,
    logoutUser,
    pathPermissionMap: {} // Add your permission map here
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext2 = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { LoginModel } from '../models/login.model';

interface AuthContextType {
  isLoggedIn: () => boolean;
  logoutUser: () => void;
  loginUser: (credentials: LoginModel) => Promise<void>;
  pathPermissionMap: Record<string, any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const isLoggedIn = useCallback((): boolean => {
    const token = sessionStorage.getItem('token');
    return !!token;
  }, []);

  const loginUser = useCallback(async (credentials: LoginModel): Promise<void> => {
    try {
      const response = await axios.post(`${API_CONFIG.REST_URL}/login`, credentials);
      const { token } = response.data;
      
      if (token) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', `${credentials.username}`);
        sessionStorage.setItem('oktaEnabled', 'false');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(message);
    }
  }, []);

  const logoutUser = useCallback(async (): Promise<void> => {
    try {
      if (isLoggedIn()) {
        await axios.get(`${API_CONFIG.baseUrl}logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.clear();
      navigate('/login');
    }
  }, [navigate, isLoggedIn]);

  const value = {
    isLoggedIn,
    logoutUser,
    loginUser,
    pathPermissionMap: {
      integrations: {
        list: { FX_Integration: ['read'] },
        create: { FX_Integration: ['create'] },
        edit: { FX_Integration: ['update'] },
        detail: { FX_Integration: ['read'] },
      },
      connections: {
        list: { FX_Connection: ['read'] },
        create: { FX_Connection: ['create'] },
        edit: { FX_Connection: ['update'] },
        detail: { FX_Connection: ['read'] },
      },
      templates: {
        list: { FX_IntegrationTemplate: ['read'] },
        create: { FX_IntegrationTemplate: ['create'] },
        edit: { FX_IntegrationTemplate: ['update'] },
        detail: { FX_IntegrationTemplate: ['read'] },
      },
      partners: {
        list: { FX_Partner: ['read'] },
        create: { FX_Partner: ['create'] },
        edit: { FX_Partner: ['update'] },
        detail: { FX_Partner: ['read'] },
      },
      runhistory: {
        list: { FX_RunHistory: ['read'] },
      },
      users: {
        create: { User: ['create'] },
        edit: { User: ['update'] },
        detail: { User: ['read'] },
      },
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppConfig, getAppConfig } from './services/configService';
import { useNavigate } from 'react-router-dom';

interface Config {
  REST_URL: string;
  RC_REST_URL: string;
}

interface AppContextProps {
  config: Config | null;
  isLoading: boolean;
  error: Error | null;
  appConfig: AppConfig;
  isLoggedIn: () => boolean;
  logoutUser: () => void;
  pathPermissionMap: Record<string, any>;
}

// const AppConfigContext = createContext<AppConfigContextType>({
//   config: null,
//   isLoading: true,
//   error: null,

// });

const AppContext = createContext<AppContextProps | undefined>(undefined);

// export const useAppConfig = () => useContext(AppConfigContext);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const appConfig = getAppConfig();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const response = await axios.get<Config>(`${process.env.REST_URL}/init`);
        setConfig(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const isLoggedIn = useCallback((): boolean => {
      const token = localStorage.getItem('token');
      return !!token;
    }, []);
  
    const logoutUser = useCallback((): void => {
      localStorage.removeItem('token');
      navigate('/login');
    }, [navigate]);

    const valueContext = {
      isLoggedIn,
      logoutUser,
      pathPermissionMap: {} // Add your permission map here
    };

  return (
    <AppContext.Provider value={{ config, isLoading, error, appConfig, ...valueContext }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
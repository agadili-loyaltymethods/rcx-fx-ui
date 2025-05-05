import React, { createContext, useContext } from 'react';
import { getAppConfig } from './services/configService';

const AppConfigContext = createContext<any>(null);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = getAppConfig();
  
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
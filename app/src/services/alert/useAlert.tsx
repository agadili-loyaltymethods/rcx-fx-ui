import { createContext, useContext, useState, ReactNode } from 'react';

interface AlertContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideAlert: () => void;
  alert: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    show: boolean;
  };
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState({
    message: '',
    type: 'info' as const,
    show: false,
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlert({
      message,
      type,
      show: true,
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({
      ...prev,
      show: false,
    }));
  };

  const contextValue: AlertContextType = {
    showAlert,
    hideAlert,
    alert
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
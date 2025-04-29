import { useCallback } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';

export const useAlert = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const successAlert = useCallback((message: string, action?: string, duration?: number) => {
    return enqueueSnackbar(message, {
      variant: 'success',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      autoHideDuration: duration || 1500,
      action: action || 'Dismiss',
    });
  }, [enqueueSnackbar]);

  const errorAlert = useCallback((message: string, action?: string, duration?: number) => {
    return enqueueSnackbar(message, {
      variant: 'error',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      autoHideDuration: duration || null,
      action: action || 'Dismiss',
    });
  }, [enqueueSnackbar]);

  const infoAlert = useCallback((message: string, action?: string) => {
    return enqueueSnackbar(message, {
      variant: 'info',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      action: action || 'Dismiss',
    });
  }, [enqueueSnackbar]);

  const closeAlert = useCallback(() => {
    closeSnackbar();
  }, [closeSnackbar]);

  return {
    successAlert,
    errorAlert,
    infoAlert,
    closeAlert,
  };
};

// Wrap your app with this provider
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SnackbarProvider maxSnack={3}>
      {children}
    </SnackbarProvider>
  );
};
import { useState } from 'react';

interface SnackbarRef {
  close: () => void;
}

interface AlertOptions {
  horizontalPosition?: 'center' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
  duration?: number;
}

export const useAlert = () => {
  const [snackbarRef, setSnackbarRef] = useState<SnackbarRef | null>(null);

  /**
   * Display a success alert message
   * @param message The message to display
   * @param action Optional action text (defaults to "Dismiss")
   * @param duration Optional duration in milliseconds (defaults to 1500ms)
   * @returns The snackbar reference
   */
  const successAlert = (
    message: string,
    action: string = 'Dismiss',
    duration: number = 1500
  ): SnackbarRef => {
    // In a real implementation, this would use a UI library like Material-UI's Snackbar
    console.log(`SUCCESS: ${message}`);
    
    const ref = {
      close: () => {
        console.log('Closing success alert');
        setSnackbarRef(null);
      }
    };
    
    setSnackbarRef(ref);
    
    if (duration) {
      setTimeout(() => {
        ref.close();
      }, duration);
    }
    
    return ref;
  };

  /**
   * Display an error alert message
   * @param message The message to display
   * @param action Optional action text (defaults to "Dismiss")
   * @param duration Optional duration in milliseconds (defaults to 0 - no auto-dismiss)
   * @returns The snackbar reference
   */
  const errorAlert = (
    message: string,
    action: string = 'Dismiss',
    duration?: number
  ): SnackbarRef => {
    // In a real implementation, this would use a UI library like Material-UI's Snackbar
    console.log(`ERROR: ${message}`);
    
    const ref = {
      close: () => {
        console.log('Closing error alert');
        setSnackbarRef(null);
      }
    };
    
    setSnackbarRef(ref);
    
    if (duration) {
      setTimeout(() => {
        ref.close();
      }, duration);
    }
    
    return ref;
  };

  /**
   * Display an info alert message
   * @param message The message to display
   * @param action Optional action text (defaults to "Dismiss")
   * @returns The snackbar reference
   */
  const infoAlert = (
    message: string,
    action: string = 'Dismiss'
  ): SnackbarRef => {
    // In a real implementation, this would use a UI library like Material-UI's Snackbar
    console.log(`INFO: ${message}`);
    
    const ref = {
      close: () => {
        console.log('Closing info alert');
        setSnackbarRef(null);
      }
    };
    
    setSnackbarRef(ref);
    
    return ref;
  };

  /**
   * Close the currently displayed alert
   */
  const closeAlert = (): void => {
    if (snackbarRef) {
      snackbarRef.close();
    }
  };

  return {
    successAlert,
    errorAlert,
    infoAlert,
    closeAlert,
    snackbarRef
  };
};
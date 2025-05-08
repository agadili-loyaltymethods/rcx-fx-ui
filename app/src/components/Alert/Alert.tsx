import { SnackbarProvider } from "notistack";

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <SnackbarProvider maxSnack={3}>
        {children}
      </SnackbarProvider>
    );
  };
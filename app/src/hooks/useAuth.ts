import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  const isLoggedIn = useCallback((): boolean => {
    // Add your token validation logic here
    const token = localStorage.getItem('token');
    return !!token;
  }, []);

  const logoutUser = useCallback((): void => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  return {
    isLoggedIn,
    logoutUser
  };
};
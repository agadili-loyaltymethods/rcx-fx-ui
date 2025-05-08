
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppLayout from './components/AppLayout/AppLayout';

export const App: React.FC = () => {
  // const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated$ = useSelector((state: any) => state.auth?.isAuthenticated);
  const isLoggedInUser = !!localStorage.getItem("token");
  useEffect(() => {
    if (!isLoggedInUser && !isAuthenticated$ && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isLoggedInUser, isAuthenticated$, navigate])

  return (
    <>
      <main className={isAuthenticated$ ? 'adjust-header-height' : ''}>
        <AppLayout></AppLayout>
      </main>
    </>
  );
};
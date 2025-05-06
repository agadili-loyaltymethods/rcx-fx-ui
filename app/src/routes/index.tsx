import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';
import ResetPassword from '@/pages/ResetPassword';
import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';
import Connections from '@/pages/connections';

const AppRoutes = () => {
  const { isLoggedIn } = useAuthContext();

  return (
    <Routes>
      <Route path="/login" element={!isLoggedIn() ? <Login /> : <Navigate to="/" />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={
          <RequireAuth>
            <Navigate to="/dashboard" replace />
          </RequireAuth>
        } />
        <Route path="/dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        <Route path="/connections/*" element={
          <RequireAuth>
            <Connections />
          </RequireAuth>
        } />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn } = useAuthContext();
  
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AppRoutes;
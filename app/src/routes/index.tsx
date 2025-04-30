import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Logout from '../pages/Logout';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  const { isLoggedIn } = useAuthContext();

  return (
    <Routes>
      <Route path="/login" element={!isLoggedIn() ? <Login /> : <Navigate to="/" />} />
      <Route path="/logout" element={<Logout />} />
      
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
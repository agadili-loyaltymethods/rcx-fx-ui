import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRouteGuard } from '../hooks/useRouteGuard';
import Layout from '../components/HeaderAndSidebar/HeaderAndSidebar';
import Dashboard from '../pages/Dashboard/Dashboard';
import LoginPage from '../pages/Login/LoginPage';
import LogoutPage from '../pages/Logout/LogoutPage';
import NotFound from '@/pages/NotFound/NotFoundPage';
import Connections from '@/pages/connections';
import ConnectionsTable from '@/pages/connections/ConnectionsTable';
import ConnectionCreateTemplate from '@/pages/connections/ConnectionCreateTemplate';
import ConnectionDetail from '@/pages/connections/ConnectionDetail';
import ResetPassword from '@/pages/ResetPassword/ResetPassword';
import Integration from '@/pages/integration/Integration';
import IntegrationList from '@/pages/integration/IntegrationList';
import CreateIntegration from '@/pages/integration/CreateIntegration';

// Create a RequireAuth component
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();  
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  // useRouteGuard();
  
  useEffect(() => {
  }, [location.pathname, isLoggedIn]);

  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        isLoggedIn() ? <Dashboard /> : <Navigate to="/login" replace />
      } />

{/* Connections routes */}
      <Route path="connections" element={<Connections />}>
          <Route index element={<Navigate to="list" replace />} />
          <Route path="list" element={<ConnectionsTable />} />
          <Route path="create" element={<ConnectionCreateTemplate />} />
          <Route path="edit/:id" element={<ConnectionCreateTemplate />} />
          <Route path="detail/:id" element={<ConnectionDetail />} />
        </Route>

        <Route path="integrations" element={<Integration />}>
          <Route index element={<Navigate to="list" replace />} />
          <Route path="list" element={<Integration />} />
          <Route path="create" element={<CreateIntegration />}/>
        
          <Route path="edit/:id" element={<CreateIntegration />} />
          <Route path="detail/:id" element={<CreateIntegration />} />
          
        </Route>
      
      {/* <Route path="/user-profile" element={
        isLoggedIn() ? <UserProfilePage /> : <Navigate to="/login" replace />
      } />
      
      
      <Route path="/integrations">
        <Route index element={<Navigate to="/integrations/list" replace />} />
        <Route path="list" element={
          isLoggedIn() ? <IntegrationList /> : <Navigate to="/login" replace />
        } />
        <Route path="view" element={
          isLoggedIn() ? <ViewIntegration /> : <Navigate to="/login" replace />
        } />
        <Route path="create" element={
          isLoggedIn() ? 
            <CanDeactivateGuard component={<CreateIntegration />} /> : 
            <Navigate to="/login" replace />
        } />
        <Route path="detail/:id" element={
          isLoggedIn() ? <IntegrationDetail /> : <Navigate to="/login" replace />
        } />
        <Route path="edit/:id" element={
          isLoggedIn() ? 
            <CanDeactivateGuard component={<EditIntegration />} /> : 
            <Navigate to="/login" replace />
        } />
        <Route path="/connections/*" element={
          <RequireAuth>
            <Connections />
          </RequireAuth>
        } />
      </Route>
      
      
      <Route path="/run-history" element={
        isLoggedIn() ? <RunHistory /> : <Navigate to="/login" replace />
      } />
      
      
      <Route path="/templates">
        <Route index element={<Navigate to="/templates/list" replace />} />
        <Route path="list" element={
          isLoggedIn() ? <TemplatesList /> : <Navigate to="/login" replace />
        } />
        <Route path="detail/:id" element={
          isLoggedIn() ? <TemplateDetail /> : <Navigate to="/login" replace />
        } />
        <Route path="create" element={
          isLoggedIn() ? 
            <CanDeactivateGuard component={<CreateTemplate />} /> : 
            <Navigate to="/login" replace />
        } />
        <Route path="edit/:id" element={
          isLoggedIn() ? 
            <CanDeactivateGuard component={<EditTemplate />} /> : 
            <Navigate to="/login" replace />
        } />
      </Route>
      
      
      <Route path="/partners">
        <Route index element={<Navigate to="/partners/list" replace />} />
        <Route path="list" element={
          isLoggedIn() ? <PartnersList /> : <Navigate to="/login" replace />
        } />
        <Route path="create" element={
          isLoggedIn() ? 
            <CanDeactivateGuard component={<CreatePartner />} /> : 
            <Navigate to="/login" replace />
        } />
        <Route path="edit/:id" element={
          isLoggedIn() ? 
            <CanDeactivateGuard component={<EditPartner />} /> : 
            <Navigate to="/login" replace />
        } />
        <Route path="detail/:id" element={
          isLoggedIn() ? <PartnerDetail /> : <Navigate to="/login" replace />
        } />
      </Route>
      
      
      <Route path="/users">
        <Route path="create" element={
          isLoggedIn() ? <CreateUser /> : <Navigate to="/login" replace />
        } />
        <Route path="edit/:id" element={
          isLoggedIn() ? <EditUser /> : <Navigate to="/login" replace />
        } />
        <Route path="detail/:id" element={
          isLoggedIn() ? <UserDetail /> : <Navigate to="/login" replace />
        } />
      </Route>
      
      
      <Route path="/connections" element={
        isLoggedIn() ? <ConnectionsLayout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<Navigate to="/connections/list" replace />} />
        <Route path="list" element={<ConnectionsList />} />
        <Route path="create" element={
          <CanDeactivateGuard component={<CreateConnection />} />
        } />
        <Route path="edit/:id" element={
          <CanDeactivateGuard component={<EditConnection />} />
        } />
        <Route path="detail/:id" element={<ConnectionDetail />} />
      </Route> */}
      
      
      {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
      <Route path="/page-not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/page-not-found" replace />} />
    </Routes>
  );
};

export default AppRoutes;
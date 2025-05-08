import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Integration from './Integration';
import CreateIntegration from './CreateIntegration';
import ViewIntegration from './ViewIntegration';

const IntegrationRoutes: React.FC = () => {
  return (
      <div className="connections-container">
        <h1 className="text-2xl font-bold mb-4">Connections</h1>
        {/* The Outlet will render the nested routes */}
        <Outlet />
      </div>
    );
};

export default IntegrationRoutes;
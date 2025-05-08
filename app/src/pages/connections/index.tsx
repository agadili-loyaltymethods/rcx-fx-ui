// pages/connections/index.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const Connections: React.FC = () => {
  return (
    <div className="connections-container">
      <h1 className="text-2xl font-bold mb-4">Connections</h1>
      {/* The Outlet will render the nested routes */}
      <Outlet />
    </div>
  );
};

export default Connections;
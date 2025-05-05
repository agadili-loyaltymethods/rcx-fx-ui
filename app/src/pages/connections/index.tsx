import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConnectionsTable from './ConnectionsTable';
import ConnectionCreateTemplate from './ConnectionCreateTemplate';
import ConnectionDetail from './ConnectionDetail';

const Connections: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ConnectionsTable />} />
      <Route path="/list" element={<ConnectionsTable />} />
      <Route path="/create" element={<ConnectionCreateTemplate />} />
      <Route path="/edit/:id" element={<ConnectionCreateTemplate />} />
      <Route path="/detail/:id" element={<ConnectionDetail />} />
    </Routes>
  );
};

export default Connections;
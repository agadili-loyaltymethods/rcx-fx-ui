import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Partner from './Partner';
import CreatePartner from './CreatePartner';
import PartnerDetails from './PartnerDetails';
import CreateUser from './CreateUser';

const PartnerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Partner />} />
      <Route path="/list" element={<Partner />} />
      <Route path="/create" element={<CreatePartner />} />
      <Route path="/edit/:id" element={<CreatePartner />} />
      <Route path="/detail/:id" element={<PartnerDetails />} />
      <Route path="/users/create" element={<CreateUser />} />
      <Route path="/users/edit/:id" element={<CreateUser />} />
      <Route path="/users/detail/:id" element={<CreateUser />} />
    </Routes>
  );
};

export default PartnerRoutes;
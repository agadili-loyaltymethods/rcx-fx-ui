import React, { createContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { useRef } from 'react';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Connections from './pages/connections';

export const App: React.FC = () => {
  const isAuthenticated$ = useSelector((state: any) => state.auth?.isAuthenticated);

  return (
    <>
    <Router>
      {/* {isAuthenticated$ && <Header />} */}
      <main className={isAuthenticated$ ? 'adjust-header-height' : ''}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/connections/*" element={<Connections />} />
          {/* <Route path="/purchase" element={<Purchase />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} /> */}
          <Route path="/page-not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/page-not-found" replace />} />
        </Routes>
      </main>
      </Router>
    </>
  );
};
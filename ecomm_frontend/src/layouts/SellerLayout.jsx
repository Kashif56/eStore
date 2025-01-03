import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/seller/Navbar';
import Sidebar from '../components/seller/Sidebar';

const SellerLayout = () => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <Sidebar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;

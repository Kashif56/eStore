import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const ProfileLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="flex-grow flex">
        {/* Sticky Sidebar */}
        <div className="sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileLayout;

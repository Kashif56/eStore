import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdLightMode, MdDarkMode, MdNotifications, MdAccountCircle } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Link 
            to="/seller/dashboard" 
            className="text-xl font-bold text-gray-800 dark:text-white"
          >
            ECommerce Seller
          </Link>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative">
            <MdNotifications size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Link
            to="/seller/profile"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Profile
          </Link>
          <button
            onClick={() => navigate('/seller/settings')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <MdAccountCircle size={24} />
          </button>
          <button
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => {/* Add logout logic */}}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

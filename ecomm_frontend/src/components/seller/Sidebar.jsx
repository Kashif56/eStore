import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdInventory, MdShoppingCart, MdSettings, MdLogout, MdHome } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    {
      path: '/',
      icon: <MdHome size={24} />,
      label: 'Main Site'
    },
    {
      path: '/seller/dashboard',
      icon: <MdDashboard size={24} />,
      label: 'Dashboard'
    },
    {
      path: '/seller/products',
      icon: <MdInventory size={24} />,
      label: 'Products'
    },
    {
      path: '/seller/orders',
      icon: <MdShoppingCart size={24} />,
      label: 'Orders'
    },
    {
      path: '/seller/payouts',
      icon: <MdShoppingCart size={24} />,
      label: 'Payouts'
    },
    {
      path: '/seller/settings',
      icon: <MdSettings size={24} />,
      label: 'Settings'
    }
  ];

  const handleLogout = () => {
    // Clear all auth related data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('hasSellerAccount');
    localStorage.removeItem('isSellerApproved');

  
    dispatch(logout());
    navigate('/');

  };
  return (
    <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg z-20">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors duration-200
                  ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="ml-3 text-sm font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 rounded-lg text-red-600 dark:text-red-400 
              hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <MdLogout size={24} />
            <span className="ml-3 text-sm font-medium">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

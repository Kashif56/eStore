import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faMapMarkerAlt, 
  faShoppingBag, 
  faHeart,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/authSlice';
import axiosInstance from '../utils/axiosInstance';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout/');
      dispatch(logoutAction());
      localStorage.removeItem('accessToken');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { 
      path: '/profile',
      icon: faUser,
      label: 'Profile'
    },
    {
      path: '/profile/addresses',
      icon: faMapMarkerAlt,
      label: 'Addresses'
    },
    {
      path: '/profile/orders',
      icon: faShoppingBag,
      label: 'Orders'
    },
    {
      path: '/profile/wishlist',
      icon: faHeart,
      label: 'Wishlist'
    },
    {
      path: '/profile/settings',
      icon: faCog,
      label: 'Settings'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-sm p-4">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              location.pathname === item.path
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="mr-3 h-4 w-4" />
            {item.label}
          </button>
        ))}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 h-4 w-4" />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

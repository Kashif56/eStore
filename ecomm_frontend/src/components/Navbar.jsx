import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faUserCircle,
  faSearch,
  faBars,
  faTimes,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

import {login, logout} from '../features/authSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0); 

  const hasSellerAccount = localStorage.getItem('hasSellerAccount');
  const isSellerApproved = localStorage.getItem('isSellerApproved');

  const username = localStorage.getItem('username');
  
  const closeTimeout = useRef(null);

  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const token_local = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
 
    
    if (token_local && !isAuthenticated && refreshToken) {
      dispatch(login({
        user: { username: localStorage.getItem('username') },
        token: token_local,
        refreshToken: refreshToken
      }));
    }
  }, [isAuthenticated, dispatch]);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (isAuthenticated) {
        try {
          const username = localStorage.getItem('username');
          const response = await axiosInstance.get(`/api/get-user-cart-count/${username}/`);
          if (response.data.status === 'success') {
            setCartCount(response.data.count);
          }
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      }
    };

    if(isAuthenticated) {
      fetchCartCount();
    }

    
    // Set up an interval to refresh cart count every 30 seconds
    const interval = setInterval(fetchCartCount, 300000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    // Clear all auth related data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('hasSellerAccount');
    localStorage.removeItem('isSellerApproved');

  
    dispatch(logout());
    navigate('/');

    // refresh page
    window.location.reload();
  };

  const handleMenuEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setShowProfileMenu(true);
  };

  const handleMenuLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setShowProfileMenu(false);
    }, 1000);
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              eStore
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center max-w-2xl">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-100 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500">
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Items - Desktop */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Products
            </Link>
            
            {/* Cart Icon with Count */}
            <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors">
              <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Menu */}
            {isAuthenticated ? (
              <div className="relative" onMouseEnter={handleMenuEnter} onMouseLeave={handleMenuLeave}>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 focus:outline-none">
                  <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                  <span className="font-medium">{username}</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Orders</Link>
                    {hasSellerAccount === 'true' && isSellerApproved === 'true' && (
                      <Link to="/seller/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">Seller Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* Search Bar - Mobile */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-100 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500">
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </form>

            <Link to="/products" className="block py-2 text-gray-600 hover:text-indigo-600">
              Products
            </Link>
            <Link to="/cart" className="block py-2 text-gray-600 hover:text-indigo-600">
              Cart ({cartCount})
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-2 text-gray-600 hover:text-indigo-600">Profile</Link>
                <Link to="/orders" className="block py-2 text-gray-600 hover:text-indigo-600">Orders</Link>
                {hasSellerAccount === 'true' && isSellerApproved === 'true' && (
                  <Link to="/seller/dashboard" className="block py-2 text-gray-600 hover:text-indigo-600">Seller Dashboard</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 hover:text-red-700">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-indigo-600 hover:text-indigo-700">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

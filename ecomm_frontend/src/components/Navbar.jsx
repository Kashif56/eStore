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

    fetchCartCount();
    // Set up an interval to refresh cart count every 30 seconds
    const interval = setInterval(fetchCartCount, 30000);
    
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
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                EShop
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home 
              </Link>
              <Link
                to="/products"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Products 
              </Link>

              {hasSellerAccount && isSellerApproved && isAuthenticated && (
                <Link
                  to="/seller/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard 
                </Link>
              )}

            
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center">
            {isAuthenticated && (
              <Link
                to="/cart"
                className="p-2 text-gray-400 hover:text-blue-500 relative"
              >
                <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative ml-3">
                <div className="flex items-center">
                  <button
                    className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onMouseEnter={handleMenuEnter}
                    onMouseLeave={handleMenuLeave}
                  >
                    <FontAwesomeIcon 
                      icon={faUserCircle} 
                      className="h-8 w-8 text-gray-400 hover:text-indigo-500 transition-colors" 
                    />
                  </button>
                </div>
                {showProfileMenu && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    onMouseEnter={handleMenuEnter}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      Welcome,<br/>
                      <span className="font-medium text-indigo-600">
                        {localStorage.getItem('username')}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex sm:items-center sm:ml-6">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <FontAwesomeIcon
                  icon={isMenuOpen ? faTimes : faBars}
                  className="h-6 w-6"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            >
              Products
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faShoppingBag, 
  faHeart,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../../components/Toast';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile/', {
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setUserData(data);
      } else {
        setToast({
          type: 'error',
          message: data.message || 'Failed to load profile data'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'An error occurred while loading profile data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/login');
      } else {
        setToast({
          type: 'error',
          message: 'Failed to logout'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'An error occurred while logging out'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-1">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'profile'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-3 h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'orders'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={faShoppingBag} className="mr-3 h-4 w-4" />
                      Orders
                    </button>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'wishlist'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={faHeart} className="mr-3 h-4 w-4" />
                      Wishlist
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'settings'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={faCog} className="mr-3 h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 h-4 w-4" />
                      Logout
                    </button>
                  </nav>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage your personal information and contact details.
                        </p>
                      </div>

                      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Full name</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {userData?.firstName} {userData?.lastName}
                              </dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Email address</dt>
                              <dd className="mt-1 text-sm text-gray-900">{userData?.email}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                              <dd className="mt-1 text-sm text-gray-900">{userData?.phone}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Member since</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {new Date(userData?.dateJoined).toLocaleDateString()}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Order History</h3>
                      {/* Order history content will go here */}
                      <p className="text-gray-500">No orders found.</p>
                    </div>
                  )}

                  {activeTab === 'wishlist' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Wishlist</h3>
                      {/* Wishlist content will go here */}
                      <p className="text-gray-500">Your wishlist is empty.</p>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
                      {/* Settings content will go here */}
                      <p className="text-gray-500">Account settings will be available soon.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

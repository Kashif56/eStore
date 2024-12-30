import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../features/authSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faShoppingBag, 
  faHeart,
  faCog,
  faSignOutAlt,
  faMapMarkerAlt,
  faEdit,
  faTrash,
  faHome,
  faBriefcase,
  faEllipsisV,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import Toast from '../../components/Toast';
import AddressModal from '../../components/AddressModal';
import AvatarModal from '../../components/AvatarModal';
import ProfileEditModal from '../../components/ProfileEditModal';
import axiosInstance from '../../utils/axiosInstance';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchAddresses();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/auth/profile/');
      if (response.data.status === 'success') {
        setUserData(response.data.data);
      } else {
        setToast({
          type: 'error',
          message: response.data.message || 'Failed to load profile data'
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred while loading profile data'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/addresses/');
      if (response.data.status === 'success') {
        setAddresses(response.data.data);
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load addresses'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout/');
      dispatch(logoutAction());
      localStorage.removeItem('accessToken');
      navigate('/login');
    } catch (error) {
      setToast({
        type: 'error',
        message: 'An error occurred while logging out'
      });
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await axiosInstance.post(`/api/auth/addresses/${addressId}/set-default/`);
      if (response.data.status === 'success') {
        // Update addresses state to reflect the new default
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => ({
            ...addr,
            is_default: addr.id === addressId
          }))
        );
        setToast({
          type: 'success',
          message: 'Default address updated successfully'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update default address'
      });
    }
  };

  const handleAddAddress = (newAddress) => {
    // If the new address is set as default, update all other addresses
    if (newAddress.is_default) {
      setAddresses(prevAddresses => 
        [...prevAddresses.map(addr => ({
          ...addr,
          is_default: false
        })), newAddress]
      );
    } else {
      setAddresses(prevAddresses => [...prevAddresses, newAddress]);
    }
    setShowAddressModal(false);
    setToast({
      type: 'success',
      message: 'Address added successfully'
    });
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axiosInstance.delete(`/api/auth/addresses/${addressId}/`);
      if (response.data.status === 'success') {
        setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== addressId));
        setShowDeleteConfirm(false);
        setSelectedAddress(null);
        setToast({
          type: 'success',
          message: 'Address deleted successfully'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete address'
      });
    }
  };

  const handleEditAddress = async (updatedAddress) => {
    try {
      const response = await axiosInstance.put(`/api/auth/addresses/${updatedAddress.id}/`, updatedAddress);
      if (response.data.status === 'success') {
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => 
            addr.id === updatedAddress.id ? response.data.data : addr
          )
        );
        setShowEditModal(false);
        setSelectedAddress(null);
        setToast({
          type: 'success',
          message: 'Address updated successfully'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update address'
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
                      onClick={() => setActiveTab('addresses')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'addresses'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 h-4 w-4" />
                      Addresses
                    </button>
                    <button
                      onClick={() => navigate('user/orders')}
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
                    <div className="space-y-8">
                      {/* Profile Header */}
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-start space-x-6">
                          {/* Avatar */}
                          <div className="relative">
                            {userData?.avatar ? (
                              <img
                                src={userData.avatar}
                                alt="Profile"
                                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `data:image/svg+xml,${encodeURIComponent(
                                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em">${userData?.first_name?.[0] || userData?.username?.[0] || 'U'}</text></svg>`
                                  )}`;
                                }}
                              />
                            ) : (
                              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-semibold uppercase border-2 border-gray-200">
                                {userData?.first_name?.[0] || userData?.username?.[0] || 'U'}
                              </div>
                            )}
                            <button 
                              onClick={() => setIsAvatarModalOpen(true)}
                              className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 hover:bg-gray-50"
                            >
                              <FontAwesomeIcon icon={faEdit} className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>

                          {/* User Info */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                  {userData?.first_name && userData?.last_name 
                                    ? `${userData.first_name} ${userData.last_name}`
                                    : userData?.username}
                                </h2>
                                <p className="text-sm text-gray-500">{userData?.email}</p>
                              </div>
                              <button 
                                onClick={() => setIsProfileEditModalOpen(true)}
                                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                              >
                                Edit Profile
                              </button>
                            </div>

                            {/* Stats */}
                            <div className="mt-6 grid grid-cols-3 gap-6 text-center">
                              <div className="border-r border-gray-200">
                                <p className="text-lg font-semibold text-gray-900">
                                  {addresses.length}
                                </p>
                                <p className="text-sm text-gray-500">Addresses</p>
                              </div>
                              <div className="border-r border-gray-200">
                                <p className="text-lg font-semibold text-gray-900">0</p>
                                <p className="text-sm text-gray-500">Orders</p>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900">0</p>
                                <p className="text-sm text-gray-500">Wishlist</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
                        </div>
                        <div className="px-6 py-4">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Username</dt>
                              <dd className="mt-1 text-sm text-gray-900">{userData?.username}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Email</dt>
                              <dd className="mt-1 text-sm text-gray-900">{userData?.email}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                              <dd className="mt-1 text-sm text-gray-900">{userData?.phone_number || '-'}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {userData?.date_of_birth 
                                  ? new Date(userData.date_of_birth).toLocaleDateString()
                                  : '-'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      {/* Account Activity */}
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Account Activity</h3>
                        </div>
                        <div className="px-6 py-4">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {new Date(userData?.date_joined).toLocaleDateString()}
                              </dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {userData?.last_login 
                                  ? new Date(userData.last_login).toLocaleString()
                                  : 'Never'}
                              </dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {userData?.updated_at 
                                  ? new Date(userData.updated_at).toLocaleString()
                                  : '-'}
                              </dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                              <dd className="mt-1">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'addresses' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium leading-6 text-gray-900 select-none">Addresses</h3>
                          <p className="mt-1 text-sm text-gray-500 select-none">
                            Manage your shipping and billing addresses.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddressModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none"
                        >
                          Add New Address
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${
                              address.is_default ? 'ring-2 ring-indigo-500' : 'border border-gray-200'
                            }`}
                          >
                            {/* Status Badge */}
                            {address.is_default && (
                              <div className="absolute -top-2 -right-2 bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                                Default
                              </div>
                            )}

                            {/* Address Type Icon */}
                            <div className="absolute top-4 left-4">
                              <div className={`p-2 rounded-full ${
                                address.is_default ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <FontAwesomeIcon 
                                  icon={address.address_type === 'home' ? faHome : address.address_type === 'work' ? faBriefcase : faMapMarkerAlt} 
                                  className="h-5 w-5"
                                />
                              </div>
                            </div>

                            {/* Actions Dropdown */}
                            <div className="absolute top-4 right-4">
                              <div className="relative inline-block text-left">
                                <div className="group">
                                  <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                                    <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4 text-gray-500" />
                                  </button>
                                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1">
                                      {!address.is_default && (
                                        <button
                                          onClick={() => handleSetDefaultAddress(address.id)}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                                          Set as Default
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setSelectedAddress(address);
                                          setShowEditModal(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedAddress(address);
                                          setShowDeleteConfirm(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Address Content */}
                            <div className="p-6 pt-16">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 capitalize">
                                    {address.address_type} Address
                                  </p>
                                  <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                                    {address.street_address}
                                    {address.apartment && `, ${address.apartment}`}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {address.city}, {address.state} {address.postal_code}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="text-center py-12 select-none">
                      <FontAwesomeIcon icon={faShoppingBag} className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No Orders Yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        When you make your first purchase, it will appear here.
                      </p>
                    </div>
                  )}

                  {activeTab === 'wishlist' && (
                    <div className="text-center py-12 select-none">
                      <FontAwesomeIcon icon={faHeart} className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Your Wishlist is Empty</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Save items you like to your wishlist and they will appear here.
                      </p>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="text-center py-12 select-none">
                      <FontAwesomeIcon icon={faCog} className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage your account settings and preferences.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Address</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAddress(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAddress(selectedAddress.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal for Add/Edit */}
      <AddressModal
        isOpen={showAddressModal || showEditModal}
        onClose={() => {
          setShowAddressModal(false);
          setShowEditModal(false);
          setSelectedAddress(null);
        }}
        onAddressAdded={handleAddAddress}
        onAddressUpdated={handleEditAddress}
        address={selectedAddress}
        isEditing={showEditModal}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditModalOpen}
        onClose={() => setIsProfileEditModalOpen(false)}
        userData={userData}
        onProfileUpdated={(updatedData) => {
          setUserData(updatedData);
          setToast({
            type: 'success',
            message: 'Profile updated successfully',
            show: true
          });
        }}
      />

      {/* Avatar Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarUpdated={(avatarUrl) => {
          setUserData(prev => ({ ...prev, avatar: avatarUrl }));
        }}
      />
    </>
  );
};

export default Profile;

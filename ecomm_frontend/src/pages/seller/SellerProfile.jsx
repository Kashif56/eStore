import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { FaStore, FaEdit, FaTrash } from 'react-icons/fa';
import Toast from '../../components/Toast';

const SellerProfile = () => {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_address: '',
    phone_number: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSellerData();
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSellerData = async () => {
    try {
      const response = await axiosInstance.get(`/api/sellers/profile/`);
      setSeller(response.data.data);
      setFormData({
        business_name: response.data.data.business_name,
        business_address: response.data.data.business_address,
        phone_number: response.data.data.phone_number
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch seller data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/api/sellers/profile/update/', formData);
      setSeller(response.data.data);
      setIsEditModalOpen(false);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your seller account? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await axiosInstance.delete('/api/sellers/profile/delete/');
        showToast('Account deleted successfully. Redirecting to Home Page', 'success');
        
        localStorage.removeItem('hasSellerAccount');
        localStorage.removeItem('isSellerApproved');
        localStorage.removeItem('business_name');
        localStorage.removeItem('business_address');
        localStorage.removeItem('phone_number');


        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete account';
        showToast(errorMessage, 'error');
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          
          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="absolute -top-12 left-6">
              <div className="h-24 w-24 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <FaStore className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end pt-4 space-x-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <FaTrash className="mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>

            {/* Profile Info */}
            <div className="mt-8">
              <h1 className="text-3xl font-bold text-gray-900">{seller.business_name}</h1>
              <div className="mt-6 grid grid-cols-1 gap-6">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-500">Business Address</h3>
                  <p className="mt-1 text-lg text-gray-900">{seller.business_address}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                  <p className="mt-1 text-lg text-gray-900">{seller.phone_number}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                  <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <textarea
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;

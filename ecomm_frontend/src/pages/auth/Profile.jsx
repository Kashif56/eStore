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
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
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
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
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
                          <p className="text-lg font-semibold text-gray-900">{userData.ordersCount}</p>
                          <p className="text-sm text-gray-500">Orders</p>
                        </div>
                        <div className="border-r border-gray-200">
                          <p className="text-lg font-semibold text-gray-900">0</p>
                          <p className="text-sm text-gray-500">Wishlist</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{userData.reviewsCount}</p>
                          <p className="text-sm text-gray-500">Reviews</p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isProfileEditModalOpen && (
        <ProfileEditModal
          isOpen={isProfileEditModalOpen}
          onClose={() => setIsProfileEditModalOpen(false)}
          userData={userData}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* Avatar Edit Modal */}
      {isAvatarModalOpen && (
        <AvatarModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onUpdate={handleUpdateAvatar}
        />
      )}
    </>
  );
};

export default Profile;

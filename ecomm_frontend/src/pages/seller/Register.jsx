import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/Toast';


const Register = () => {
  const navigate = useNavigate();
  const [sellerProfile, setSellerProfile] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    business_name: '',
    business_address: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);


  // Checks if Seller is already registered
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const response = await axiosInstance.get('/api/sellers/profile/');
        if (response.data?.status === 'success') {
          setSellerProfile(response.data.data);
      

          if(response.data.data.is_approved == false) {
            navigate('/seller/approval');
          }
        }
      } catch (error) {
        
        console.error('Failed to fetch seller profile:', error);
      }
    };

    fetchSellerProfile();

  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/sellers/register/', formData);
      
      if (response.data?.status === 'success') {
        setToast({
          type: 'success',
          message: 'Registration successful'
        });

    

        localStorage.setItem('hasSellerAccount', true);
        localStorage.setItem('business_name', formData.business_name);
        localStorage.setItem('business_address', formData.business_address);
        localStorage.setItem('phone_number', formData.phone_number);
       

        navigate('/seller/approval');
      } else {
        setToast({
          type: 'error',
          message: response.data?.message || 'Registration failed'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to register seller account'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Become a Seller
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill in your business details to get started
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  type="text"
                  name="business_name"
                  id="business_name"
                  required
                  value={formData.business_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="business_address" className="block text-sm font-medium text-gray-700">
                  Business Address
                </label>
                <textarea
                  name="business_address"
                  id="business_address"
                  required
                  value={formData.business_address}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  id="phone_number"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Submitting...' : 'Register as Seller'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Register;

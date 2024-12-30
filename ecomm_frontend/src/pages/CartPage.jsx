import React, { useState, useEffect } from 'react';
import Cart from '../components/Cart';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const CartPage = () => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/cart/');
      if (response.data.status === 'success') {
        setCartData(response.data.data);
      } else {
        setError(response.data.message || 'Error loading cart');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Error loading cart');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchCart();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return <Cart initialCartData={cartData} onCartUpdate={fetchCart} />;
};

export default CartPage;

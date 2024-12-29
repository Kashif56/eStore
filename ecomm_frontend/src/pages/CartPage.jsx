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


  // Update Order Quanrity

  useEffect(() => {

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

    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <Cart cartData={cartData} />
    </div>
  );
};

export default CartPage;

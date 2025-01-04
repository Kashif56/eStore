import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';

const SellerRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [sellerStatus, setSellerStatus] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/api/sellers/profile/');
        if (response.data?.status === 'success') {
          setSellerStatus({
            isSeller: true,
            isApproved: response.data.data.is_approved
          });
        }
      } catch (error) {
        // If 404, user is not a seller
        if (error.response?.status === 404) {
          setSellerStatus({
            isSeller: false,
            isApproved: false
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      checkSellerStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not a seller, redirect to register
  if (!sellerStatus?.isSeller) {
    return <Navigate to="/seller/register" state={{ from: location }} replace />;
  }

  // If seller but not approved, redirect to approval page
  if (sellerStatus.isSeller && !sellerStatus.isApproved) {
    return <Navigate to="/seller/approval" state={{ from: location }} replace />;
  }

  // If seller and approved, render the protected component
  return children;
};

export default SellerRoute;

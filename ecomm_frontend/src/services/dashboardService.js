import axiosInstance from '../utils/axiosInstance';

// Format numbers for display
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatTrend = (value) => {
  if (value === null || value === undefined) return null;
  return value.toFixed(1);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// API calls
export const fetchDashboardStats = async (period = 'monthly') => {
  try {
    const response = await axiosInstance.get(`/api/sellers/dashboard/stats/?period=${period}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Seller profile not found');
    }
    throw error;
  }
};

export const fetchSalesGraphData = async (period = 'monthly') => {
  try {
    const response = await axiosInstance.get(`/api/sellers/dashboard/sales-graph/?period=${period}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Seller profile not found');
    }
    throw error;
  }
};

export const fetchTopProducts = async (period = 'monthly') => {
  try {
    const response = await axiosInstance.get(`/api/sellers/dashboard/top-products/?period=${period}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Seller profile not found');
    }
    throw error;
  }
};

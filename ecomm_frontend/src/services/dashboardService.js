import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/sellers';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Get the token from localStorage
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page or handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };

// Format numbers for display
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatTrend = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toFixed(1);
};

// Format date based on period
export const formatDate = (date, period) => {
  if (!date) return '';
  
  const d = new Date(date);
  switch (period) {
    case 'daily':
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric'
      });
    case 'monthly':
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric'
      });
    case 'yearly':
      return d.getFullYear().toString();
    default:
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric'
      });
  }
};

// API calls
export const fetchDashboardStats = async (period = 'monthly') => {
  try {
    const response = await api.get('/dashboard/stats/', {
      params: { period }
    });
    
    const data = response.data;
    if (!data || !data.stats || !data.trends) {
      throw new Error('Invalid data format received from server');
    }

    // Ensure all required fields exist with fallbacks
    return {
      stats: {
        total_sales: Number(data.stats.total_sales || 0),
        total_orders: Number(data.stats.total_orders || 0),
        average_order: Number(data.stats.average_order || 0)
      },
      trends: {
        sales_trend: Number(data.trends.sales_trend || 0),
        orders_trend: Number(data.trends.orders_trend || 0),
        average_trend: Number(data.trends.average_trend || 0)
      },
      period: data.period || period
    };
  } catch (error) {
    console.error('Dashboard stats error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchSalesGraphData = async (period = 'monthly') => {
  try {
    const response = await api.get('/dashboard/sales-graph/', {
      params: { period }
    });
    
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid graph data format received from server');
    }

    // Process and validate each data point
    return response.data.map(point => ({
      date: point.date || '',
      sales: Number(point.sales || 0)
    })).filter(point => point.date && !isNaN(point.sales));
  } catch (error) {
    console.error('Sales graph error:', error.response?.data || error.message);
    throw error;
  }
};

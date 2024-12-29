import axios from 'axios';
import store from '../store/store';
import { login, logout } from '../features/authSlice';

const baseURL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there's no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token available, logout user
          store.dispatch(logout());
          return Promise.reject(error);
        }

        // Call the refresh token endpoint
        const response = await axios.post(`${baseURL}/api/auth/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;

        // Update tokens in localStorage and Redux store
        localStorage.setItem('accessToken', access);
        store.dispatch(login({
          token: access,
          refreshToken,
          user: { username: localStorage.getItem('username') }
        }));

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // If refresh token is expired or invalid, logout user
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

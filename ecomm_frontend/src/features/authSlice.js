import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

const initialState = {
  user: null,
  token,
  refreshToken,
  isAuthenticated: !!token, // Set isAuthenticated based on token presence
  isLoading: false,
  error: null,

};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      // Save tokens to localStorage
      localStorage.setItem('accessToken', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    // Add refreshToken action
    refreshTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },



  },
});

export const { login, logout, setError, refreshTokens } = authSlice.actions;
export default authSlice.reducer;

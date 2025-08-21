import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false,
  loading: true
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadUser = async () => {
    if (state.token) {
      try {
        const response = await api.get('/auth/me');
        dispatch({
          type: 'USER_LOADED',
          payload: response.data.user
        });
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login with email:', email);
      console.log('AuthContext: API base URL:', api.defaults.baseURL);
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('AuthContext: Login response received:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token: response.data.token,
            user: response.data.user
          }
        });
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      console.error('AuthContext: Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (formData) => {
    try {
      console.log('AuthContext: Sending profile update request');
      const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': undefined }
      });
      console.log('AuthContext: Profile update response:', response.data);
      
      if (response.data.success) {
        console.log('AuthContext: Updating user state with:', response.data.user);
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user
        });
        return { success: true };
      }
    } catch (error) {
      console.error('AuthContext: Profile update error:', error);
      const message = error.response?.data?.message || 'Profile update failed';
      throw new Error(message);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      if (response.data.success) {
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      throw new Error(message);
    }
  };

  const hasPermission = (permission) => {
    return state.user?.permissions?.[permission] === true;
  };

  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  const isManagerOrAbove = () => {
    return state.user?.role === 'admin' || state.user?.role === 'manager';
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!state.token) {
      logout();
    }
  }, [state.token]);

  const value = {
    token: state.token,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout,
    updateProfile,
    changePassword,
    hasPermission,
    isAdmin,
    isManagerOrAbove
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
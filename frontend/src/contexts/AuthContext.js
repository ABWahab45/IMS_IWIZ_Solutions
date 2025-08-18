import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import api from '../services/axiosConfig';

const AuthContext = createContext();

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const setAuthToken = (token) => {
    if (token) {
      // Set token for both global axios and our api instance
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Remove token from both
      delete axios.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const loadUser = async () => {
    console.log('Loading user, token exists:', !!state.token);
    if (state.token) {
      setAuthToken(state.token);
      try {
        const response = await api.get('/auth/me');
        console.log('User loaded successfully:', response.data.user.firstName);
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: response.data.user
        });
      } catch (error) {
        console.error('Load user error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          error: error.message
        });
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } else {
      console.log('No token found, logging out');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      console.log('Login successful, token received:', token ? 'Yes' : 'No');
      
      setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user }
      });
      
      toast.success(`Welcome back, ${user.firstName}!`);
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      });
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      
      setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user }
      });
      
      toast.success(`Welcome to IWIZ Solutions, ${user.firstName}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setAuthToken(null);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.info('You have been logged out');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user
      });
      
      toast.success('Profile updated successfully');
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const hasPermission = (permission) => {
    return state.user?.permissions?.[permission] || false;
  };

  const hasRole = (roles) => {
    if (!state.user?.role) return false;
    const userRoles = Array.isArray(roles) ? roles : [roles];
    return userRoles.includes(state.user.role);
  };

  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  const isManagerOrAbove = () => {
    return ['admin', 'manager'].includes(state.user?.role);
  };

  const isEmployeeOrAbove = () => {
    return ['admin', 'manager', 'employee'].includes(state.user?.role);
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && state.isAuthenticated) {
          logout();
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [state.isAuthenticated]);

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    
    hasPermission,
    hasRole,
    isAdmin,
    isManagerOrAbove,
    isEmployeeOrAbove
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

export default AuthContext;
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load stored auth details on initialization
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user data', err);
        // Clear corrupt data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      
      // Store token and user details in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email
      }));

      // Update state
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email
      });
      
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.readableMessage || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register({ name, email, password });

      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email
      }));

      // Update state
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email
      });

      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.readableMessage || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Reset state
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    clearError
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

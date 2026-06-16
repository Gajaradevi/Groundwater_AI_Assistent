import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');

    if (storedToken && storedName && storedRole) {
      setToken(storedToken);
      setUser({ fullName: storedName, role: storedRole });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        const { token, fullName, role } = response.data;
        
        // Save to state
        setToken(token);
        setUser({ fullName, role });
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userRole', role);
        
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error details:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await authService.register(fullName, email, password);
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error details:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return { success: false, error: response.message || 'Request failed' };
      }
    } catch (error) {
      console.error('Forgot password error details:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Forgot password failed';
      return { success: false, error: errorMsg };
    }
  };

  const resetPassword = async (tokenString, newPassword) => {
    try {
      const response = await authService.resetPassword(tokenString, newPassword);
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return { success: false, error: response.message || 'Reset password failed' };
      }
    } catch (error) {
      console.error('Reset password error details:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Reset password failed';
      return { success: false, error: errorMsg };
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
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

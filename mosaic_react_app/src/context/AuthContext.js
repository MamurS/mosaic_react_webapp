import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else if (response.status === 401) {
        // Token is invalid, clear it and redirect to login
        console.log('Token expired, clearing auth state');
        handleLogout();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // On any error, clear auth state
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      const token = data.access;
      
      // Store token
      localStorage.setItem('authToken', token);
      setAuthToken(token);
      setIsAuthenticated(true);
      
      // Fetch user data
      await fetchCurrentUser(token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access;
        localStorage.setItem('authToken', newToken);
        setAuthToken(newToken);
        return newToken;
      } else {
        handleLogout();
        return null;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      handleLogout();
      return null;
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/me/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const checkAuthStatus = () => {
    return {
      isAuthenticated,
      hasValidToken: !!authToken,
      user: currentUser
    };
  };

  const value = {
    // State
    isAuthenticated,
    authToken,
    currentUser,
    loading,
    
    // Actions
    login: handleLogin,
    logout: handleLogout,
    refreshToken,
    updateUserProfile,
    checkAuthStatus,
    
    // Utils
    isAdmin: currentUser?.is_staff || false,
    userInitials: currentUser ? `${currentUser.first_name?.[0] || ''}${currentUser.last_name?.[0] || ''}` : '',
    displayName: currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : ''
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

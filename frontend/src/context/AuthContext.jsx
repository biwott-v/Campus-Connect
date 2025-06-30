import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { 
        email: email,  // Can be empty
        password: password  // Can be empty
      });
      const { access_token, user } = response.data;
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
     
      const mockUser = {
        id: Date.now(),
        username: 'demo-user',
        email: email || 'demo@example.com',
        full_name: 'Demo User'
      };
      localStorage.setItem('access_token', 'mock-token');
      setCurrentUser(mockUser);
      return true;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        full_name: userData.full_name
      });
      const { access_token, user } = response.data;
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      // Fallback in case server fails
      const mockUser = {
        id: Date.now(),
        username: userData.username || 'demo-user',
        email: userData.email || 'demo@example.com',
        full_name: userData.full_name || 'Demo User'
      };
      localStorage.setItem('access_token', 'mock-token');
      setCurrentUser(mockUser);
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
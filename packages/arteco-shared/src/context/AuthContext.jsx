import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = import.meta.env.VITE_API_URL || '';

  // Helper: Fetch the full user profile using the token
  const fetchUserProfile = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${apiBase}/api/User/current`, config);
      setUser(response.data); // This sets { firstName, lastName, ... }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      // If fetching fails (e.g., token expired), we log them out
      logout(); 
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchUserProfile(token);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchUserProfile(token); // Fetch name immediately upon login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/'; // Hard redirect to clear any state
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
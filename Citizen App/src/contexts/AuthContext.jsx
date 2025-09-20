import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../entities/User';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const result = await User.login(email, password);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return result;
    } catch (error) {
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  const register = async (userData) => {
    try {
      const result = await User.register(userData);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return result;
    } catch (error) {
      return { success: false, message: "Registration failed. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await User.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      setUser(null);
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

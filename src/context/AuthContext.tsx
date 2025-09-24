import React, { createContext, useContext, useState, useEffect } from 'react';

interface Admin {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock admin data
  useEffect(() => {
    // Simulate logged in admin
    setAdmin({
      _id: '1',
      name: 'Admin User',
      email: 'admin@alumni.edu',
      role: 'admin'
    });
    setIsAuthenticated(true);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login implementation
    setAdmin({
      _id: '1',
      name: 'Admin User',
      email: email,
      role: 'admin'
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const fetchCurrentUser = async () => {
    // Mock fetch current user
    if (isAuthenticated) {
      setAdmin({
        _id: '1',
        name: 'Admin User',
        email: 'admin@alumni.edu',
        role: 'admin'
      });
    }
  };

  const value = {
    admin,
    isAuthenticated,
    login,
    logout,
    fetchCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
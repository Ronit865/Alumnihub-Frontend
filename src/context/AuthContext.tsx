import React, { createContext, useContext, useEffect, useState } from 'react';
import { userService, adminService, handleApiError, handleApiSuccess } from '@/services/ApiServices';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  graduationYear?: string;
  course?: string;
  currentPosition?: string;
  company?: string;
  location?: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
}

interface Admin {
  name: string;
  _id: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  login: (userData: any) => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateUserData: (userData: User | Admin) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  userType: 'user' | 'admin' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUserType = localStorage.getItem('userType') as 'user' | 'admin' | null;
      
      if (token && storedUserType) {
        setUserType(storedUserType);
        await fetchCurrentUser();
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const storedUserType = localStorage.getItem('userType') as 'user' | 'admin' | null;
      
      if (!storedUserType) {
        return;
      }

      let response;
      if (storedUserType === 'admin') {
        response = await adminService.getCurrentAdmin();
        if (response.success) {
          const adminData = response.data || response;
          setAdmin(adminData);
          setUser(null);
          // Cache admin data
          localStorage.setItem('cachedAdminData', JSON.stringify(adminData));
        }
      } else {
        response = await userService.getCurrentUser();
        if (response.success) {
          const userData = response.data || response;
          setUser(userData);
          setAdmin(null);
          // Cache user data
          localStorage.setItem('cachedUserData', JSON.stringify(userData));
        }
      }
      
      setUserType(storedUserType);
    } catch (error: any) {
      const apiError = handleApiError(error);
      
      // If token is invalid, try to load cached data temporarily
      if (apiError.statusCode === 401) {
        const storedUserType = localStorage.getItem('userType');
        
        if (storedUserType === 'admin') {
          const cachedAdmin = localStorage.getItem('cachedAdminData');
          if (cachedAdmin) {
            setAdmin(JSON.parse(cachedAdmin));
            setUser(null);
          }
        } else {
          const cachedUser = localStorage.getItem('cachedUserData');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
            setAdmin(null);
          }
        }
        
        // Don't immediately logout - let the token refresh mechanism handle it
        console.warn('Token expired, using cached data temporarily');
      } else {
        // For other errors, clear everything
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('cachedUserData');
        localStorage.removeItem('cachedAdminData');
        setUser(null);
        setAdmin(null);
        setUserType(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = (userData: User | Admin) => {
    const storedUserType = localStorage.getItem('userType');
    
    if (storedUserType === 'admin') {
      setAdmin(userData as Admin);
      localStorage.setItem('cachedAdminData', JSON.stringify(userData));
    } else {
      setUser(userData as User);
      localStorage.setItem('cachedUserData', JSON.stringify(userData));
    }
  };

  const login = (userData: any) => {
    const responseUserType = userData.userType || (userData.user?.role === 'admin' ? 'admin' : 'user');
    const responseUser = userData.user;
    const responseAdmin = userData.admin;
    
    localStorage.setItem('userType', responseUserType);
    setUserType(responseUserType as 'user' | 'admin');
    
    if (userData.accessToken) {
      localStorage.setItem('accessToken', userData.accessToken);
    }

    if (responseUserType === 'admin') {
      const adminData = responseAdmin || userData;
      setAdmin(adminData);
      setUser(null);
      localStorage.setItem('cachedAdminData', JSON.stringify(adminData));
    } else {
      const userData_ = responseUser || userData;
      setUser(userData_);
      setAdmin(null);
      localStorage.setItem('cachedUserData', JSON.stringify(userData_));
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setUserType(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('cachedUserData');
    localStorage.removeItem('cachedAdminData');
  };

  const value = {
    user,
    admin,
    userType,
    login,
    logout,
    fetchCurrentUser,
    updateUserData,
    isLoading,
    isAuthenticated: !!(user || admin),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
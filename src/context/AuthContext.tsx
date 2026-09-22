import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

export interface CustomerUser {
  name: string;
  email: string;
  picture?: string;
  googleId?: string;
}

interface AuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  getAuthHeaders: () => Record<string, string>;
  
  // Customer Gmail / Google Auth
  customerUser: CustomerUser | null;
  loginWithGoogle: (email: string, name?: string, picture?: string) => void;
  logoutCustomer: () => void;
  isGoogleModalOpen: boolean;
  openGoogleModal: () => void;
  closeGoogleModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OWNER_EMAILS = ['flora7loveunfolded@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('flora7_owner_user') || sessionStorage.getItem('flora7_owner_session_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email && parsed.email.toLowerCase() === 'flora7loveunfolded@gmail.com' && parsed.role === 'OWNER') {
          return parsed;
        }
      }
      // Purge any non-flora7 owner sessions
      localStorage.removeItem('flora7_owner_token');
      localStorage.removeItem('flora7_owner_user');
      sessionStorage.removeItem('flora7_owner_session_token');
      sessionStorage.removeItem('flora7_owner_session_user');
    } catch {
      // ignore
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('flora7_owner_user') || sessionStorage.getItem('flora7_owner_session_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email && parsed.email.toLowerCase() === 'flora7loveunfolded@gmail.com' && parsed.role === 'OWNER') {
          return localStorage.getItem('flora7_owner_token') || sessionStorage.getItem('flora7_owner_session_token');
        }
      }
      localStorage.removeItem('flora7_owner_token');
      localStorage.removeItem('flora7_owner_user');
      sessionStorage.removeItem('flora7_owner_session_token');
      sessionStorage.removeItem('flora7_owner_session_user');
    } catch {
      // ignore
    }
    return null;
  });

  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('flora7_customer_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  useEffect(() => {
    if (customerUser) {
      localStorage.setItem('flora7_customer_user', JSON.stringify(customerUser));
    } else {
      localStorage.removeItem('flora7_customer_user');
    }
  }, [customerUser]);

  const loginWithGoogle = async (email: string, name?: string, picture?: string) => {
    const rawEmail = (email || '').trim().toLowerCase();
    const defaultName = name || (rawEmail.includes('@') ? rawEmail.split('@')[0].replace(/\./g, ' ').toUpperCase() : 'Customer');
    const newUser: CustomerUser = {
      email: rawEmail,
      name: defaultName,
      picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=B76E79&color=fff`,
      googleId: `google-${Date.now()}`
    };
    setCustomerUser(newUser);

    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: rawEmail, name: defaultName })
      });
    } catch {
      // ignore
    }

    setIsGoogleModalOpen(false);
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    logout();
  };

  const openGoogleModal = () => setIsGoogleModalOpen(true);
  const closeGoogleModal = () => setIsGoogleModalOpen(false);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials. Please try again.' };
      }

      if (data.token && data.user) {
        setToken(data.token);
        setAdminUser(data.user);
        try {
          sessionStorage.setItem('flora7_owner_session_token', data.token);
          sessionStorage.setItem('flora7_owner_session_user', JSON.stringify(data.user));
          localStorage.setItem('flora7_owner_token', data.token);
          localStorage.setItem('flora7_owner_user', JSON.stringify(data.user));
        } catch {
          // ignore storage quota error
        }
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch {
      return { success: false, error: 'Network error connecting to server.' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    try {
      sessionStorage.removeItem('flora7_owner_session_token');
      sessionStorage.removeItem('flora7_owner_session_user');
      localStorage.removeItem('flora7_owner_token');
      localStorage.removeItem('flora7_owner_user');
    } catch {
      // ignore
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        token,
        login,
        logout,
        isAuthenticated: Boolean(token && adminUser && adminUser.role === 'OWNER'),
        getAuthHeaders,
        customerUser,
        loginWithGoogle,
        logoutCustomer,
        isGoogleModalOpen,
        openGoogleModal,
        closeGoogleModal
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

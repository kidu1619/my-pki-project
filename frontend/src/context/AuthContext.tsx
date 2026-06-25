import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

interface User {
  id?: number;
  username: string;
  email: string;
  department?: string;
  status: string;
  roles: string[];
  mfaEnabled: boolean;
  profilePhoto?: string | null;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (e) {
      logout();
      throw e;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          fetchProfile(storedToken).catch(() => {});
        } else {
          try {
            await fetchProfile(storedToken);
          } catch (e) {
          } finally {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const profile = await fetchProfile(newToken);
    return profile;
  };

  const refreshProfile = async () => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      await fetchProfile(currentToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some((role) => user?.roles.includes(role)) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        refreshProfile,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

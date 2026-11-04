import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isLogoutModalOpen: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe((isAuth) => {
      setIsAuthenticated(isAuth);
      setUser(authService.getUser());
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean): Promise<AuthUser> => {
    const authUser = await authService.login(email, password, rememberMe);
    setUser(authUser);
    setIsAuthenticated(true);
    return authUser;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
  };

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        isLogoutModalOpen,
        openLogoutModal,
        closeLogoutModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

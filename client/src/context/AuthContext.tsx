
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';

import type { AuthUser } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    identifier: string,
    password: string
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isLogoutModalOpen: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export function AuthProvider({
  children
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] =
    useState(false);

  useEffect(() => {
    let active = true;

    authService.getCurrentUser()
      .then(currentUser => {
        if (active) setUser(currentUser);
      })
      .catch(error => {
        console.error('Session check failed:', error);
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (
    identifier: string,
    password: string
  ) => {
    const authenticatedUser =
      await authService.login(identifier, password);

    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsLogoutModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      loading,
      login,
      logout,
      isLogoutModalOpen,
      openLogoutModal: () => setIsLogoutModalOpen(true),
      closeLogoutModal: () => setIsLogoutModalOpen(false)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}

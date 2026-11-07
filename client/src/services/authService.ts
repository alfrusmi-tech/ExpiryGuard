import type { AuthUser } from '../types';
import {
  apiRequest,
  ApiError,
  clearCsrf
} from './apiClient';

interface ServerUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PHARMACIST';
}

function toAuthUser(data: ServerUser): AuthUser {
  return {
    id: String(data.id),
    email: data.email,
    name: data.name,
    role: data.role
  };
}

export const authService = {
  async login(
    identifier: string,
    password: string,
    _rememberMe?: boolean
  ): Promise<AuthUser> {
    if (!identifier.trim() || !password) {
      throw new Error('Enter username and password');
    }

    try {
      const data = await apiRequest<ServerUser>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            identifier: identifier.trim(),
            password
          })
        }
      );

      clearCsrf();
      return toAuthUser(data);
    } catch (error) {
      if (error instanceof ApiError &&
          error.status === 401) {
        throw new Error('Invalid username or password');
      }
      throw error;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const data = await apiRequest<ServerUser>(
        '/auth/me'
      );
      return toAuthUser(data);
    } catch (error) {
      if (error instanceof ApiError &&
          error.status === 401) {
        return null;
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    await apiRequest<void>('/auth/logout', {
      method: 'POST'
    });
    clearCsrf();
  }
};
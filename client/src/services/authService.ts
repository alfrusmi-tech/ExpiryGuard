import { AuthUser } from '../types';

const SESSION_KEY = 'expiryguard_auth_session';
const USER_KEY = 'expiryguard_auth_user';

type AuthListener = (isAuthenticated: boolean) => void;
const listeners = new Set<AuthListener>();

function notifyListeners(isAuth: boolean) {
  listeners.forEach(listener => {
    try {
      listener(isAuth);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

export const authService = {
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const hasSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    return Boolean(hasSession && this.getUser());
  },

  /**
   * Frontend-ready session login.
   * Validates credentials on the frontend and creates a persistent or session-based pharmacist session.
   * Note: Dedicated backend authentication will be integrated once the backend auth endpoints are available.
   */
  async login(emailOrUsername: string, password: string, rememberMe: boolean = true): Promise<AuthUser> {
    const cleanIdentifier = emailOrUsername.trim();
    if (!cleanIdentifier || !password.trim()) {
      throw new Error('Please enter both your email/username and password.');
    }

    // Format display name from username or email
    const baseName = cleanIdentifier.includes('@')
      ? cleanIdentifier.split('@')[0]
      : cleanIdentifier;
    const formattedName = baseName
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());

    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@expiryguard.local`,
      name: formattedName || 'Pharmacist Admin',
      role: 'Pharmacist Admin'
    };

    // Clear any previous session traces in both storages
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);

    // Save session in selected storage (localStorage for Remember Me, sessionStorage otherwise)
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, 'active');
    storage.setItem(USER_KEY, JSON.stringify(user));

    notifyListeners(true);
    return user;
  },

  /**
   * Frontend logout.
   * Clears the user session and authentication state from storage.
   */
  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);

    notifyListeners(false);
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

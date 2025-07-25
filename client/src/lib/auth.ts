// Centralized authentication utilities to prevent token key inconsistencies

export const AUTH_KEYS = {
  TOKEN: 'adminToken',
  USER: 'adminUser'
} as const;

export const authUtils = {
  // Get authentication token
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_KEYS.TOKEN);
  },

  // Get admin user data
  getUser: (): any | null => {
    const userData = localStorage.getItem(AUTH_KEYS.USER);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing admin user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = authUtils.getToken();
    const user = authUtils.getUser();
    return !!(token && user);
  },

  // Store authentication data
  storeAuth: (token: string, user: any): void => {
    localStorage.setItem(AUTH_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  },

  // Clear authentication data
  clearAuth: (): void => {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
  },

  // Get authorization headers for API requests
  getAuthHeaders: (): Record<string, string> => {
    const token = authUtils.getToken();
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }
};
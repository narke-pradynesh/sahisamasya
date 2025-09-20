// User entity with MongoDB backend integration
import { apiRequest } from '../config/api.js';

export class User {
  // Local storage keys
  static STORAGE_KEYS = {
    USER: 'SahiSamasya_user',
    TOKEN: 'SahiSamasya_token'
  };

  static async me() {
    try {
      // Check if user is stored in localStorage first
      const storedUser = localStorage.getItem(this.STORAGE_KEYS.USER);
      const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
      
      if (storedUser && token) {
        try {
          // Return stored user immediately for faster loading
          const userData = JSON.parse(storedUser);
          
          // Try to verify token with backend in the background (non-blocking)
          // Use setTimeout to make it truly non-blocking
          setTimeout(() => {
            apiRequest('/auth/me')
              .then(response => {
                if (response.success) {
                  // Update stored user data silently
                  localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(response.user));
                }
              })
              .catch(error => {
                console.warn('Background auth verification failed:', error);
              });
          }, 0);
          
          return userData;
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          // Clear corrupted data
          localStorage.removeItem(this.STORAGE_KEYS.USER);
          localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  static async register(userData) {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success) {
        // Store user data and token
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(response.user));
        localStorage.setItem(this.STORAGE_KEYS.TOKEN, response.token);
        
        return { success: true, user: response.user };
      }

      return { success: false, message: response.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || "Registration failed. Please try again." };
    }
  }

  static async login(email, password) {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success) {
        // Store user data and token
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(response.user));
        localStorage.setItem(this.STORAGE_KEYS.TOKEN, response.token);
        
        return { success: true, user: response.user };
      }

      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || "Login failed. Please try again." };
    }
  }

  static async logout() {
    try {
      // Clear stored user data
      this.clearStoredData();
      
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload even if there's an error
      window.location.reload();
    }
  }

  static clearStoredData() {
    localStorage.removeItem(this.STORAGE_KEYS.USER);
    localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
  }

  static getAuthToken() {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
  }

  static isAuthenticated() {
    try {
      const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
      const user = localStorage.getItem(this.STORAGE_KEYS.USER);
      return token !== null && user !== null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  static async getCurrentUser() {
    try {
      const user = await this.me();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

import { Platform } from 'react-native';

export class TokenStorage {
  private static token: string | null = null;

  static async setToken(token: string): Promise<void> {
    this.token = token;
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('auth_token', token);
      } catch (e) {
        console.warn('LocalStorage is not available', e);
      }
    }
  }

  static async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem('auth_token');
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  static async clearToken(): Promise<void> {
    this.token = null;
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('auth_token');
      } catch (e) {
        // ignore
      }
    }
  }
}

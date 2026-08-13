import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITokenStorage } from '../../../domain/ports/ITokenStorage';

const AUTH_TOKEN_KEY = 'auth_token';

/** Adapter de infraestructura: implementa el puerto ITokenStorage sobre AsyncStorage. */
export class TokenStorage implements ITokenStorage {
  static readonly instance: ITokenStorage = new TokenStorage();

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (e) {
      console.warn('AsyncStorage is not available', e);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (e) {
      // ignore
    }
  }
}

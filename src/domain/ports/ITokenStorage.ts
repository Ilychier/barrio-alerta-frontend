/**
 * Puerta de salida (port) para el almacenamiento seguro del token JWT.
 * La capa application depende de esta interfaz, no de AsyncStorage (DIP).
 */
export interface ITokenStorage {
  setToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  clearToken(): Promise<void>;
}

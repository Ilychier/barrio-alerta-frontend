import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../../domain/entities/usuario';
import { Barrio } from '../../domain/entities/barrio';
import { Cuadrante } from '../../domain/entities/cuadrante';
import { Configuracion } from '../../domain/entities/configuracion';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { TokenStorage } from '../../infrastructure/adapters/storage/TokenStorage';

interface AuthContextType {
  user: Usuario | null;
  barrio: Barrio | null;
  cuadrante: Cuadrante | null;
  configuracion: Configuracion | null;
  ciudadNombre: string | null;
  paisNombre: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** true si el usuario tiene clave temporal (registro rápido de emergencia) y debe cambiarla. */
  passwordTemporal: boolean;
  login: (identificador: string, password: string) => Promise<void>;
  register: (
    nombre: string,
    email: string,
    phone: string,
    address: string,
    barrioId: number,
    password: string
  ) => Promise<void>;
  /** Cambia la clave. Si el usuario es temporal, no exige la actual. */
  cambiarPassword: (identificador: string, passwordActual: string | null, passwordNueva: string) => Promise<void>;
  /** Auto-login con un JWT recién emitido (registro rápido de emergencia). */
  autenticarConToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setConfiguracion: (config: Configuracion | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [barrio, setBarrio] = useState<Barrio | null>(null);
  const [cuadrante, setCuadrante] = useState<Cuadrante | null>(null);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [ciudadNombre, setCiudadNombre] = useState<string | null>(null);
  const [paisNombre, setPaisNombre] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const applySesion = (sesion: {
    user: Usuario;
    barrio: Barrio | null;
    cuadrante: Cuadrante | null;
    configuracion: Configuracion | null;
    ciudadNombre: string | null;
    paisNombre: string | null;
  }) => {
    setUser(sesion.user);
    setBarrio(sesion.barrio);
    setCuadrante(sesion.cuadrante);
    setConfiguracion(sesion.configuracion);
    setCiudadNombre(sesion.ciudadNombre);
    setPaisNombre(sesion.paisNombre);
  };
  useEffect(() => {
    async function loadSession() {
      try {
        const token = await TokenStorage.getToken();
        if (token) {
          const authRepo = DependencyContainer.getInstance().getAuthRepository();
          const sesion = await authRepo.getMe();
          applySesion(sesion);
        }
      } catch (error) {
        console.warn('No active session or token expired', error);
        await TokenStorage.clearToken();
        setUser(null);
        setBarrio(null);
        setCuadrante(null);
        setConfiguracion(null);
        setCiudadNombre(null);
        setPaisNombre(null);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authRepo = DependencyContainer.getInstance().getAuthRepository();
      const sesion = await authRepo.login(email, password);
      applySesion(sesion);
    } catch (error) {
      setUser(null);
      setBarrio(null);
      setCuadrante(null);
      setConfiguracion(null);
      setCiudadNombre(null);
      setPaisNombre(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    nombre: string,
    email: string,
    phone: string,
    address: string,
    barrioId: number,
    password: string
  ) => {
    setLoading(true);
    try {
      const authRepo = DependencyContainer.getInstance().getAuthRepository();
      const sesion = await authRepo.register(nombre, email, phone, address, barrioId, password);
      applySesion(sesion);
    } catch (error) {
      setUser(null);
      setBarrio(null);
      setCuadrante(null);
      setConfiguracion(null);
      setCiudadNombre(null);
      setPaisNombre(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await TokenStorage.clearToken();
      setUser(null);
      setBarrio(null);
      setCuadrante(null);
      setConfiguracion(null);
      setCiudadNombre(null);
      setPaisNombre(null);
    } finally {
      setLoading(false);
    }
  };

  const cambiarPassword = async (
    identificador: string,
    passwordActual: string | null,
    passwordNueva: string
  ) => {
    try {
      const authRepo = DependencyContainer.getInstance().getAuthRepository();
      await authRepo.cambiarPassword(identificador, passwordActual, passwordNueva);
      // Tras cambiar la clave, el flag temporal se limpia en el usuario local
      setUser((prev) => (prev ? new Usuario(prev.id, prev.nombre, prev.email, prev.barrio_id, false) : prev));
    } catch (error) {
      throw error;
    }
  };

  const autenticarConToken = async (token: string) => {
    setLoading(true);
    try {
      await TokenStorage.setToken(token);
      const authRepo = DependencyContainer.getInstance().getAuthRepository();
      const sesion = await authRepo.getMe();
      applySesion(sesion);
    } catch (error) {
      await TokenStorage.clearToken();
      setUser(null);
      setBarrio(null);
      setCuadrante(null);
      setConfiguracion(null);
      setCiudadNombre(null);
      setPaisNombre(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        barrio,
        cuadrante,
        configuracion,
        ciudadNombre,
        paisNombre,
        isAuthenticated: !!user,
        loading,
        passwordTemporal: user?.passwordTemporal ?? false,
        login,
        register,
        cambiarPassword,
        autenticarConToken,
        logout,
        setConfiguracion,
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

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
  login: (email: string, password: string) => Promise<void>;
  register: (
    nombre: string,
    email: string,
    phone: string,
    address: string,
    barrioId: number,
    password: string
  ) => Promise<void>;
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
        login,
        register,
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

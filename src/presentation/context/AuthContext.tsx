import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../../domain/entities/usuario';
import { Barrio } from '../../domain/entities/barrio';
import { Cuadrante } from '../../domain/entities/cuadrante';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { TokenStorage } from '../../infrastructure/adapters/storage/TokenStorage';

interface AuthContextType {
  user: Usuario | null;
  barrio: Barrio | null;
  cuadrante: Cuadrante | null;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [barrio, setBarrio] = useState<Barrio | null>(null);
  const [cuadrante, setCuadrante] = useState<Cuadrante | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReferences = async (usuario: Usuario) => {
    try {
      const container = DependencyContainer.getInstance();
      const referenciaRepo = container.getReferenciaRepository();
      const resolvedBarrio = await referenciaRepo.getBarrioById(usuario.barrio_id);
      setBarrio(resolvedBarrio || null);
      if (resolvedBarrio) {
        const resolvedCuadrante = await referenciaRepo.getCuadranteById(resolvedBarrio.cuadrante_id);
        setCuadrante(resolvedCuadrante || null);
      } else {
        setCuadrante(null);
      }
    } catch (error) {
      console.error('Error fetching auth user references:', error);
      setBarrio(null);
      setCuadrante(null);
    }
  };

  useEffect(() => {
    async function loadSession() {
      try {
        const token = await TokenStorage.getToken();
        if (token) {
          const authRepo = DependencyContainer.getInstance().getAuthRepository();
          const me = await authRepo.getMe();
          setUser(me);
          if (me) {
            await fetchReferences(me);
          }
        }
      } catch (error) {
        console.warn('No active session or token expired', error);
        await TokenStorage.clearToken();
        setUser(null);
        setBarrio(null);
        setCuadrante(null);
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
      const { user: loggedUser } = await authRepo.login(email, password);
      setUser(loggedUser);
      if (loggedUser) {
        await fetchReferences(loggedUser);
      }
    } catch (error) {
      setUser(null);
      setBarrio(null);
      setCuadrante(null);
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
      const { user: registeredUser } = await authRepo.register(
        nombre,
        email,
        phone,
        address,
        barrioId,
        password
      );
      setUser(registeredUser);
      if (registeredUser) {
        await fetchReferences(registeredUser);
      }
    } catch (error) {
      setUser(null);
      setBarrio(null);
      setCuadrante(null);
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
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
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

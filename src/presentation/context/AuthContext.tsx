import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthController } from '../../application/controllers/useAuthController';
import { Usuario } from '../../domain/entities/usuario';
import { Barrio } from '../../domain/entities/barrio';
import { Cuadrante } from '../../domain/entities/cuadrante';
import { Configuracion } from '../../domain/entities/configuracion';

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

/**
 * Thin wrapper: delega TODA la lógica al useAuthController (capa application).
 * Este provider solo conecta el controller de aplicación con el árbol de React.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const controller = useAuthController();
  const { sesion, loading, isAuthenticated, passwordTemporal } = controller;

  const value: AuthContextType = {
    user: sesion.user,
    barrio: sesion.barrio,
    cuadrante: sesion.cuadrante,
    configuracion: sesion.configuracion,
    ciudadNombre: sesion.ciudadNombre,
    paisNombre: sesion.paisNombre,
    isAuthenticated,
    loading,
    passwordTemporal,
    login: (identificador, password) => controller.login({ identificador, password }),
    register: (nombre, email, phone, address, barrioId, password) =>
      controller.register({ nombre, email, phone, address, barrioId, password }),
    cambiarPassword: controller.cambiarPassword,
    autenticarConToken: controller.autenticarConToken,
    logout: controller.logout,
    setConfiguracion: controller.setConfiguracion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

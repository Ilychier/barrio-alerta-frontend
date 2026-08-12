import { useState, useCallback, useEffect } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { TokenStorage } from '../../infrastructure/adapters/storage/TokenStorage';
import { Usuario } from '../../domain/entities/usuario';
import { Barrio } from '../../domain/entities/barrio';
import { Cuadrante } from '../../domain/entities/cuadrante';
import { Configuracion } from '../../domain/entities/configuracion';
import { SesionDTO } from '../../domain/entities/sesion';
import { ITokenStorage } from '../../domain/ports/ITokenStorage';

export interface Sesion {
  user: Usuario | null;
  barrio: Barrio | null;
  cuadrante: Cuadrante | null;
  configuracion: Configuracion | null;
  ciudadNombre: string | null;
  paisNombre: string | null;
}

/** Mapea el DTO del repositorio a la sesión de UI (excluye el token: detalle de infraestructura). */
function aSesion(dto: SesionDTO): Sesion {
  return {
    user: dto.user,
    barrio: dto.barrio,
    cuadrante: dto.cuadrante,
    configuracion: dto.configuracion,
    ciudadNombre: dto.ciudadNombre,
    paisNombre: dto.paisNombre,
  };
}

export interface LoginParams {
  identificador: string;
  password: string;
}

export interface RegisterParams {
  nombre: string;
  email: string;
  phone: string;
  address: string;
  barrioId: number;
  password: string;
}

const SESION_VACIA: Sesion = {
  user: null,
  barrio: null,
  cuadrante: null,
  configuracion: null,
  ciudadNombre: null,
  paisNombre: null,
};

/**
 * Controller de autenticación/sesión.
 * Vive en la capa application; la presentación (AuthContext) lo consume
 * como thin wrapper. El contenedor se inyecta por prop; el token storage
 * via el puerto ITokenStorage (DIP).
 */
export function useAuthController(
  container: DependencyContainer,
  tokenStorage: ITokenStorage = TokenStorage.instance,
) {
  const [sesion, setSesion] = useState<Sesion>(SESION_VACIA);
  const [loading, setLoading] = useState<boolean>(true);

  const authRepo = container.getAuthRepository();

  // Carga sesión inicial (auto-login con token persistido)
  useEffect(() => {
    let active = true;
    async function loadSession() {
      try {
        const token = await tokenStorage.getToken();
        if (token) {
          const dto = await authRepo.getMe();
          if (active) setSesion(aSesion(dto));
        }
      } catch (error) {
        console.warn('No active session or token expired', error);
        await tokenStorage.clearToken();
        if (active) setSesion(SESION_VACIA);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSession();
    return () => {
      active = false;
    };
  }, [authRepo, tokenStorage]);

  const login = useCallback(
    async ({ identificador, password }: LoginParams) => {
      setLoading(true);
      try {
        const dto = await authRepo.login(identificador, password);
        setSesion(aSesion(dto));
      } catch (error) {
        setSesion(SESION_VACIA);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authRepo],
  );

  const register = useCallback(
    async (params: RegisterParams) => {
      setLoading(true);
      try {
        const dto = await authRepo.register(
          params.nombre,
          params.email,
          params.phone,
          params.address,
          params.barrioId,
          params.password,
        );
        setSesion(aSesion(dto));
      } catch (error) {
        setSesion(SESION_VACIA);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authRepo],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await tokenStorage.clearToken();
      setSesion(SESION_VACIA);
    } finally {
      setLoading(false);
    }
  }, [tokenStorage]);

  const cambiarPassword = useCallback(
    async (identificador: string, passwordActual: string | null, passwordNueva: string) => {
      await authRepo.cambiarPassword(identificador, passwordActual, passwordNueva);
      // Tras cambiar la clave, el flag temporal se limpia en el usuario local
      setSesion((prev) =>
        prev.user ? { ...prev, user: new Usuario(prev.user.id, prev.user.nombre, prev.user.email, prev.user.barrio_id, false) } : prev,
      );
    },
    [authRepo],
  );

  const autenticarConToken = useCallback(
    async (token: string) => {
      setLoading(true);
      try {
        await tokenStorage.setToken(token);
        const dto = await authRepo.getMe();
        setSesion(aSesion(dto));
      } catch (error) {
        await tokenStorage.clearToken();
        setSesion(SESION_VACIA);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authRepo, tokenStorage],
  );

  const setConfiguracion = useCallback((config: Configuracion | null) => {
    setSesion((prev) => ({ ...prev, configuracion: config }));
  }, []);

  return {
    sesion,
    loading,
    isAuthenticated: !!sesion.user,
    passwordTemporal: sesion.user?.passwordTemporal ?? false,
    login,
    register,
    logout,
    cambiarPassword,
    autenticarConToken,
    setConfiguracion,
  };
}

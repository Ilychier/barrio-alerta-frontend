import { SesionDTO } from '../entities/sesion';

export interface IAuthRepository {
  login(email: string, password: string): Promise<SesionDTO>;
  register(
    nombre: string,
    email: string,
    phone: string,
    address: string,
    barrioId: number,
    password: string
  ): Promise<SesionDTO>;
  getMe(): Promise<SesionDTO>;
  /** Cambia la clave. Si el usuario es temporal, passwordActual puede ser null. */
  cambiarPassword(identificador: string, passwordActual: string | null, passwordNueva: string): Promise<void>;
}

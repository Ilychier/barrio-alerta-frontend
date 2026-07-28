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
}

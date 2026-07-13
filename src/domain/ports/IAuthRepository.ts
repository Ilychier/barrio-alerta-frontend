import { Usuario } from '../entities/usuario';

export interface IAuthRepository {
  login(email: string, password: string): Promise<{ token: string; user: Usuario }>;
  register(
    nombre: string,
    email: string,
    phone: string,
    address: string,
    barrioId: number,
    password: string
  ): Promise<{ token: string; user: Usuario }>;
  getMe(): Promise<Usuario>;
}

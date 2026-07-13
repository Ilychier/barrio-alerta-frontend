import { IAuthRepository } from '../../../domain/ports/IAuthRepository';
import { Usuario } from '../../../domain/entities/usuario';

export class InMemoryAuthRepository implements IAuthRepository {
  private currentUser: Usuario = new Usuario(2, 'Carlos Mendoza', 'carlos.mendoza@email.com', 1);

  async login(email: string, _password: string): Promise<{ token: string; user: Usuario }> {
    // Mock login by creating/finding a user
    this.currentUser = new Usuario(2, 'Carlos Mendoza', email, 1);
    return {
      token: 'mock-jwt-token',
      user: this.currentUser,
    };
  }

  async register(
    nombre: string,
    email: string,
    _phone: string,
    _address: string,
    barrioId: number,
    _password: string
  ): Promise<{ token: string; user: Usuario }> {
    this.currentUser = new Usuario(Math.floor(Math.random() * 1000) + 10, nombre, email, barrioId);
    return {
      token: 'mock-jwt-token',
      user: this.currentUser,
    };
  }

  async getMe(): Promise<Usuario> {
    return this.currentUser;
  }
}

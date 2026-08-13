import { IAuthRepository } from '../../../domain/ports/IAuthRepository';
import { SesionDTO } from '../../../domain/entities/sesion';
import { Usuario } from '../../../domain/entities/usuario';
import { Barrio } from '../../../domain/entities/barrio';
import { Cuadrante } from '../../../domain/entities/cuadrante';
import { Configuracion } from '../../../domain/entities/configuracion';

export class InMemoryAuthRepository implements IAuthRepository {
  private currentUser: Usuario = new Usuario(2, 'Carlos Mendoza', 'carlos.mendoza@email.com', 1, false);

  private buildSesion(token: string | null, user: Usuario): SesionDTO {
    return {
      token,
      user,
      barrio: new Barrio(1, 'Centro', 101, 1),
      cuadrante: new Cuadrante(101, 'CAI Soacha Centro', '+57 310 555 0123'),
      configuracion: new Configuracion(1, user.id, true, false),
      ciudadNombre: 'Medellín',
      paisNombre: 'Colombia',
    };
  }

  async login(_email: string, _password: string): Promise<SesionDTO> {
    this.currentUser = new Usuario(2, 'Carlos Mendoza', _email, 1, false);
    return this.buildSesion('mock-jwt-token', this.currentUser);
  }

  async register(
    nombre: string,
    email: string,
    _phone: string,
    _address: string,
    barrioId: number,
    _password: string
  ): Promise<SesionDTO> {
    this.currentUser = new Usuario(Math.floor(Math.random() * 1000) + 10, nombre, email, barrioId, false);
    return this.buildSesion('mock-jwt-token', this.currentUser);
  }

  async getMe(): Promise<SesionDTO> {
    return this.buildSesion(null, this.currentUser);
  }

  async cambiarPassword(
    _identificador: string,
    _passwordActual: string | null,
    _passwordNueva: string
  ): Promise<void> {
    this.currentUser = new Usuario(this.currentUser.id, this.currentUser.nombre, this.currentUser.email, this.currentUser.barrio_id, false);
  }
}

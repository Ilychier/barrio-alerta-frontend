import { isAxiosError } from 'axios';
import { IAuthRepository } from '../../../domain/ports/IAuthRepository';
import { Usuario } from '../../../domain/entities/usuario';
import { HttpGenericService } from './HttpGenericService';
import { TokenStorage } from '../storage/TokenStorage';

export class HttpAuthRepository implements IAuthRepository {
  private readonly http = HttpGenericService.getInstance().getClient();

  async login(email: string, password: string): Promise<{ token: string; user: Usuario }> {
    try {
      const response = await this.http.post<any>('/auth/login', { email, password });
      const { token, user } = response.data;
      
      await TokenStorage.setToken(token);
      
      const mappedUser = new Usuario(
        user.id,
        user.name || user.nombre || 'Usuario',
        user.email,
        user.barrioId || user.barrio_id || 1
      );
      
      return { token, user: mappedUser };
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.errors?.[0]?.name || 'Error al iniciar sesión');
      }
      throw error;
    }
  }

  async register(
    nombre: string,
    email: string,
    phone: string,
    address: string,
    barrioId: number,
    password: string
  ): Promise<{ token: string; user: Usuario }> {
    try {
      const payload = {
        name: nombre,
        email,
        phone,
        address,
        barrioId,
        password
      };
      
      const response = await this.http.post<any>('/auth/register', payload);
      const { token, user } = response.data;
      
      await TokenStorage.setToken(token);
      
      const mappedUser = new Usuario(
        user.id,
        user.name || user.nombre || 'Usuario',
        user.email,
        user.barrioId || user.barrio_id || 1
      );
      
      return { token, user: mappedUser };
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.errors?.[0]?.name || 'Error al registrar usuario');
      }
      throw error;
    }
  }

  async getMe(): Promise<Usuario> {
    try {
      const response = await this.http.get<any>('/usuarios/me');
      if (response.data) {
        return new Usuario(
          response.data.id,
          response.data.name || response.data.nombre || 'Usuario',
          response.data.email,
          response.data.barrioId || response.data.barrio_id || 1
        );
      }
      throw new Error('No se pudo obtener la información de perfil.');
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.errors?.[0]?.name || 'Error al obtener sesión');
      }
      throw error;
    }
  }
}

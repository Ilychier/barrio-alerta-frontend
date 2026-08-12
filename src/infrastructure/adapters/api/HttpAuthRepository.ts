import { isAxiosError } from 'axios';
import { IAuthRepository } from '../../../domain/ports/IAuthRepository';
import { SesionDTO } from '../../../domain/entities/sesion';
import { Usuario } from '../../../domain/entities/usuario';
import { Barrio } from '../../../domain/entities/barrio';
import { Cuadrante } from '../../../domain/entities/cuadrante';
import { Configuracion } from '../../../domain/entities/configuracion';
import { HttpGenericService } from './HttpGenericService';
import { TokenStorage } from '../storage/TokenStorage';

export class HttpAuthRepository implements IAuthRepository {
  private readonly http = HttpGenericService.getInstance().getClient();

  async login(email: string, password: string): Promise<SesionDTO> {
    try {
      const response = await this.http.post<any>('/auth/login', { email, password });
      return this.toSesion(response.data);
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
  ): Promise<SesionDTO> {
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
      return this.toSesion(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.errors?.[0]?.name || 'Error al registrar usuario');
      }
      throw error;
    }
  }

  async getMe(): Promise<SesionDTO> {
    try {
      const response = await this.http.get<any>('/auth/me');
      return this.toSesion(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.errors?.[0]?.name || 'Error al obtener sesión');
      }
      throw error;
    }
  }

  async cambiarPassword(
    identificador: string,
    passwordActual: string | null,
    passwordNueva: string
  ): Promise<void> {
    try {
      await this.http.post<any>('/auth/cambiar-password', {
        identificador,
        passwordActual,
        passwordNueva,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'No se pudo cambiar la contraseña');
      }
      throw error;
    }
  }

  private async toSesion(raw: any): Promise<SesionDTO> {
    if (raw.token) {
      await TokenStorage.setToken(raw.token);
    }

    const user = new Usuario(
      raw.user.id,
      raw.user.name || raw.user.nombre || 'Usuario',
      raw.user.email,
      raw.user.barrioId ?? raw.user.barrio_id ?? 1,
      raw.user.passwordTemporal ?? false,
    );

    const barrio = raw.barrio
      ? new Barrio(
          raw.barrio.id,
          raw.barrio.nombre,
          raw.barrio.cuadranteId ?? raw.barrio.cuadrante_id ?? raw.barrio.cuadrante?.id,
          raw.barrio.localidadId ?? raw.barrio.localidad_id
        )
      : null;

    const cuadrante = raw.cuadrante
      ? new Cuadrante(
          raw.cuadrante.id,
          raw.cuadrante.nombreUnidad || raw.cuadrante.nombre_unidad,
          raw.cuadrante.telefonoEmergencia || raw.cuadrante.telefono_emergencia
        )
      : null;

    const configuracion = raw.configuracion
      ? new Configuracion(
          raw.configuracion.id,
          raw.configuracion.usuarioId ?? raw.configuracion.usuario_id,
          raw.configuracion.recibirNotificaciones ?? raw.configuracion.recibir_notificaciones,
          raw.configuracion.modoSilencioso ?? raw.configuracion.modo_silencioso
        )
      : null;

    return {
      token: raw.token,
      user,
      barrio,
      cuadrante,
      configuracion,
      ciudadNombre: raw.ciudadNombre ?? null,
      paisNombre: raw.paisNombre ?? null,
    };
  }
}

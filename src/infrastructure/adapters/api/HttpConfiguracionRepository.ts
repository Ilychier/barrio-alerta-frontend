import { isAxiosError } from 'axios';
import { IConfiguracionRepository } from '../../../domain/ports/IConfiguracionRepository';
import { Configuracion } from '../../../domain/entities/configuracion';
import { HttpGenericService } from './HttpGenericService';
import { InMemoryConfiguracionRepository } from '../memory/InMemoryConfiguracionRepository';

export class HttpConfiguracionRepository implements IConfiguracionRepository {
  private readonly fallback = new InMemoryConfiguracionRepository();
  private readonly http = HttpGenericService.getInstance().getClient();

  private readonly endpoints = {
    configuraciones: '/configuraciones',
  };

  async obtenerPorUsuarioId(usuarioId: number): Promise<Configuracion | undefined> {
    try {
      const response = await this.http.get<any>(`${this.endpoints.configuraciones}/usuario/${usuarioId}`);
      if (response.data) {
        const raw = response.data;
        return new Configuracion(
          raw.id,
          raw.usuarioId !== undefined ? raw.usuarioId : raw.usuario_id,
          raw.recibirNotificaciones !== undefined ? raw.recibirNotificaciones : raw.recibir_notificaciones,
          raw.modoSilencioso !== undefined ? raw.modoSilencioso : raw.modo_silencioso
        );
      }
      return undefined;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[HttpConfiguracionRepository] Failed to obtenerPorUsuarioId(${usuarioId}) [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn(`[HttpConfiguracionRepository] Failed to obtenerPorUsuarioId(${usuarioId}). Falling back to local data:`, error);
      }
      return this.fallback.obtenerPorUsuarioId(usuarioId);
    }
  }

  async actualizar(config: Configuracion): Promise<Configuracion> {
    try {
      const payload = {
        usuarioId: config.usuario_id,
        recibirNotificaciones: config.recibir_notificaciones,
        modoSilencioso: config.modo_silencioso,
      };
      const response = await this.http.put<any>(
        `${this.endpoints.configuraciones}/usuario/${config.usuario_id}`,
        payload
      );
      if (response.data) {
        const raw = response.data;
        return new Configuracion(
          raw.id,
          raw.usuarioId !== undefined ? raw.usuarioId : raw.usuario_id,
          raw.recibirNotificaciones !== undefined ? raw.recibirNotificaciones : raw.recibir_notificaciones,
          raw.modoSilencioso !== undefined ? raw.modoSilencioso : raw.modo_silencioso
        );
      }
      return config;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[HttpConfiguracionRepository] Failed to actualizar [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn('[HttpConfiguracionRepository] Failed to actualizar. Falling back to local data:', error);
      }
      return this.fallback.actualizar(config);
    }
  }
}

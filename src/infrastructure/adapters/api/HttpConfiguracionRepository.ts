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
      const response = await this.http.get<Configuracion>(`${this.endpoints.configuraciones}/${usuarioId}`);
      if (response.data) {
        return new Configuracion(
          response.data.id,
          response.data.usuario_id,
          response.data.recibir_notificaciones,
          response.data.modo_silencioso
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
      const response = await this.http.put<Configuracion>(
        `${this.endpoints.configuraciones}/${config.usuario_id}`,
        config
      );
      return response.data;
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

import { IConfiguracionRepository } from '../../domain/ports/IConfiguracionRepository';
import { Configuracion } from '../../domain/entities/configuracion';

export interface ActualizarConfiguracionRequest {
  usuarioId: number;
  campo: 'recibir_notificaciones' | 'modo_silencioso';
  valor: boolean;
}

export interface ActualizarConfiguracionResponse {
  configuracion: Configuracion;
}

export class ActualizarConfiguracionUseCase {
  constructor(private readonly configRepo: IConfiguracionRepository) {}

  async execute(request: ActualizarConfiguracionRequest): Promise<ActualizarConfiguracionResponse> {
    const actual = await this.configRepo.obtenerPorUsuarioId(request.usuarioId);

    if (!actual) {
      throw new Error(`Configuración no encontrada para el usuario ${request.usuarioId}`);
    }

    const actualizada = new Configuracion(
      actual.id,
      actual.usuario_id,
      request.campo === 'recibir_notificaciones' ? request.valor : actual.recibir_notificaciones,
      request.campo === 'modo_silencioso' ? request.valor : actual.modo_silencioso,
    );

    await this.configRepo.actualizar(actualizada);

    return { configuracion: actualizada };
  }
}

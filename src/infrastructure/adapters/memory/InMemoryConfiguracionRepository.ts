import { IConfiguracionRepository } from '../../../domain/ports/IConfiguracionRepository';
import { Configuracion } from '../../../domain/entities/configuracion';

const INITIAL_CONFIGURACIONES: Configuracion[] = [
  new Configuracion(301, 2, true, false),
  new Configuracion(302, 502, true, true),
];

export class InMemoryConfiguracionRepository implements IConfiguracionRepository {
  private configuraciones: Configuracion[] = [...INITIAL_CONFIGURACIONES];

  async obtenerPorUsuarioId(usuarioId: number): Promise<Configuracion | undefined> {
    return this.configuraciones.find((c) => c.usuario_id === usuarioId);
  }

  async actualizar(config: Configuracion): Promise<Configuracion> {
    const index = this.configuraciones.findIndex(
      (c) => c.usuario_id === config.usuario_id,
    );
    if (index !== -1) {
      this.configuraciones[index] = config;
    } else {
      this.configuraciones.push(config);
    }
    return config;
  }
}

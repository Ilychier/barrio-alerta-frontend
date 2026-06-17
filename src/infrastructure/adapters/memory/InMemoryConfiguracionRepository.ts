import { IConfiguracionRepository } from '../../../domain/ports/IConfiguracionRepository';
import { Configuracion } from '../../../domain/entities/configuracion';

const INITIAL_CONFIGURACIONES: Configuracion[] = [
  new Configuracion(301, 501, true, false),
  new Configuracion(302, 502, true, true),
];

export class InMemoryConfiguracionRepository implements IConfiguracionRepository {
  private configuraciones: Configuracion[] = [...INITIAL_CONFIGURACIONES];

  obtenerPorUsuarioId(usuarioId: number): Configuracion | undefined {
    return this.configuraciones.find((c) => c.usuario_id === usuarioId);
  }

  actualizar(config: Configuracion): Configuracion {
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

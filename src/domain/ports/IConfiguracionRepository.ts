import { Configuracion } from '../entities/configuracion';

export interface IConfiguracionRepository {
  obtenerPorUsuarioId(usuarioId: number): Promise<Configuracion | undefined>;
  actualizar(config: Configuracion): Promise<Configuracion>;
}

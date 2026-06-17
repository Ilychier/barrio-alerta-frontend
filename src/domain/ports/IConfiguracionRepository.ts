import { Configuracion } from '../entities/configuracion';

export interface IConfiguracionRepository {
  obtenerPorUsuarioId(usuarioId: number): Configuracion | undefined;
  actualizar(config: Configuracion): Configuracion;
}

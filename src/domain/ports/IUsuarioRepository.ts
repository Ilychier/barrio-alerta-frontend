import { Usuario } from '../entities/usuario';

/** Puerta de salida para usuarios (ISP). */
export interface IUsuarioRepository {
  getUsuarioById(id: number): Promise<Usuario | undefined>;
}

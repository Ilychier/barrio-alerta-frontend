import { Alerta } from '../../../domain/entities/alerta';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IFinalizarEmergenciaUseCase {
  execute(usuarioId: number): Promise<Alerta>;
}

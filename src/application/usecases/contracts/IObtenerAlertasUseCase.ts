import { ObtenerAlertasResponse } from '../ObtenerAlertasUseCase';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IObtenerAlertasUseCase {
  execute(usuarioId: number, fecha?: string): Promise<ObtenerAlertasResponse>;
}

import { ActualizarConfiguracionRequest, ActualizarConfiguracionResponse } from '../ActualizarConfiguracionUseCase';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IActualizarConfiguracionUseCase {
  execute(request: ActualizarConfiguracionRequest): Promise<ActualizarConfiguracionResponse>;
}

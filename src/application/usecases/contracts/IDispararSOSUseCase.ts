import { DispararSOSRequest, DispararSOSResponse } from '../DispararSOSUseCase';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IDispararSOSUseCase {
  execute(request: DispararSOSRequest): Promise<DispararSOSResponse>;
}

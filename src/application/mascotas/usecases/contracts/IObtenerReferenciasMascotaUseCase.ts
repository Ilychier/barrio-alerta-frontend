import { ReferenciasMascota } from '../ObtenerReferenciasMascotaUseCase';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IObtenerReferenciasMascotaUseCase {
  execute(): Promise<ReferenciasMascota>;
}

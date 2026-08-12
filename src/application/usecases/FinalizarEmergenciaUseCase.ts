import { Alerta } from '../../domain/entities/alerta';
import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';

/** Categoría reservada: emergencia finalizada (regla de dominio compartida con el backend). */
export const CATEGORIA_FIN_EMERGENCIA = 5;

/**
 * Registra la alerta de "fin de emergencia" cuando el usuario descarta el SOS.
 * Regla de dominio movida del controller a la capa de aplicación.
 * El ID lo asigna el repositorio (backend o in-memory), no se genera aquí.
 */
export class FinalizarEmergenciaUseCase {
  constructor(private readonly alertaRepo: IAlertaRepository) {}

  async execute(usuarioId: number): Promise<Alerta> {
    const alerta = Alerta.crearDesdeFormulario(
      0, // placeholder: el repo asigna el ID real (backend o in-memory)
      '¡Todo está bien ahora! Emergencia finalizada.',
      new Date().toISOString(),
      usuarioId,
      CATEGORIA_FIN_EMERGENCIA,
    );
    return this.alertaRepo.crearAlerta(alerta);
  }
}

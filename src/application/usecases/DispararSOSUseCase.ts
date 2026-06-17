import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';
import { Alerta } from '../../domain/entities/alerta';

export interface DispararSOSRequest {
  usuarioId: number;
}

export interface DispararSOSResponse {
  alerta: Alerta;
}

export class DispararSOSUseCase {
  constructor(private readonly alertaRepo: IAlertaRepository) {}

  execute(request: DispararSOSRequest): DispararSOSResponse {
    const newId = Math.floor(Math.random() * 1000) + 1000;

    const sosAlert = new Alerta(
      newId,
      '¡ALERTA S.O.S ACTIVA! Emergencia reportada en el sector Soacha Centro.',
      true,
      new Date().toISOString(),
      request.usuarioId,
      11, // categoría Robo
    );

    this.alertaRepo.crearAlerta(sosAlert);
    return { alerta: sosAlert };
  }
}

import { Alerta } from '../../domain/entities/alerta';
import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';

export interface DispararSOSRequest {
  usuarioId: number;
}

export interface DispararSOSResponse {
  alerta: Alerta;
}

export class DispararSOSUseCase {
  constructor(private readonly alertaRepo: IAlertaRepository) {}

  async execute(request: DispararSOSRequest): Promise<DispararSOSResponse> {
    const newId = Math.floor(Math.random() * 1000) + 1000;

    const sosAlert = Alerta.crearEmergenciaSOS(
      newId,
      'Alerta S.O.S Activada',
      new Date().toISOString(),
      request.usuarioId,
    );

    await this.alertaRepo.crearAlerta(sosAlert);
    return { alerta: sosAlert };
  }
}

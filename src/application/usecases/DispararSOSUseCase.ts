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
    // El ID lo asigna el repositorio (backend en producción, in-memory en dev).
    // El use case construye un borrador y usa la entidad persistida.
    const draft = Alerta.crearEmergenciaSOS(
      0,
      'Alerta S.O.S Activada',
      new Date().toISOString(),
      request.usuarioId,
    );

    const alerta = await this.alertaRepo.crearAlerta(draft);
    return { alerta };
  }
}

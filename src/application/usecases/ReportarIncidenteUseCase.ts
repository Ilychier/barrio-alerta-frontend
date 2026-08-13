import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';
import { Alerta } from '../../domain/entities/alerta';
import { Evidencia } from '../../domain/entities/evidencia';

export interface ReportarIncidenteRequest {
  descripcion: string;
  categoriaId: number;
  usuarioId: number;
  evidenciaUrl?: string;
}

export interface ReportarIncidenteResponse {
  alerta: Alerta;
  evidencia?: Evidencia;
}

export class ReportarIncidenteUseCase {
  constructor(private readonly alertaRepo: IAlertaRepository) {}

  async execute(request: ReportarIncidenteRequest): Promise<ReportarIncidenteResponse> {
    // El ID lo asigna el repositorio (backend en producción, in-memory en dev).
    const draft = Alerta.crearDesdeFormulario(
      0,
      request.descripcion,
      new Date().toISOString(),
      request.usuarioId,
      request.categoriaId,
    );

    let evidencia: Evidencia | undefined;

    if (request.evidenciaUrl) {
      // El ID lo asigna el repositorio (backend en producción).
      evidencia = new Evidencia(
        0,
        draft.id,
        request.evidenciaUrl,
        'image/jpeg',
      );
    }

    const alerta = await this.alertaRepo.crearAlerta(draft, evidencia ? [evidencia] : undefined);

    return { alerta, evidencia };
  }
}

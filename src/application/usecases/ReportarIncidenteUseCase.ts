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
    const newAlertId = Math.floor(Math.random() * 1000) + 1000;

    const incidentAlert = new Alerta(
      newAlertId,
      request.descripcion,
      false,
      new Date().toISOString(),
      request.usuarioId,
      request.categoriaId,
    );

    let evidencia: Evidencia | undefined;

    if (request.evidenciaUrl) {
      const newEvidenceId = Math.floor(Math.random() * 1000) + 2000;
      evidencia = new Evidencia(
        newEvidenceId,
        newAlertId,
        request.evidenciaUrl,
        'image/jpeg',
      );
    }

    await this.alertaRepo.crearAlerta(incidentAlert, evidencia ? [evidencia] : undefined);

    return { alerta: incidentAlert, evidencia };
  }
}

import { ReportarIncidenteRequest, ReportarIncidenteResponse } from '../ReportarIncidenteUseCase';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IReportarIncidenteUseCase {
  execute(request: ReportarIncidenteRequest): Promise<ReportarIncidenteResponse>;
}

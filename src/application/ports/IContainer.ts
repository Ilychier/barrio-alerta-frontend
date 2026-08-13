import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';
import { IConfiguracionRepository } from '../../domain/ports/IConfiguracionRepository';
import { IAuthRepository } from '../../domain/ports/IAuthRepository';
import { ICategoriaRepository } from '../../domain/ports/ICategoriaRepository';
import { IGeografiaRepository } from '../../domain/ports/IGeografiaRepository';
import { IUsuarioRepository } from '../../domain/ports/IUsuarioRepository';
import { ITokenStorage } from '../../domain/ports/ITokenStorage';
import { IReporteMascotaRepository } from '../../domain/mascotas/ports/IReporteMascotaRepository';
import { IMascotaReferenciaRepository } from '../../domain/mascotas/ports/IMascotaReferenciaRepository';
import { IReporteRapidoRepository } from '../../domain/mascotas/ports/IReporteRapidoRepository';
import { IDispararSOSUseCase } from '../usecases/contracts/IDispararSOSUseCase';
import { IReportarIncidenteUseCase } from '../usecases/contracts/IReportarIncidenteUseCase';
import { IActualizarConfiguracionUseCase } from '../usecases/contracts/IActualizarConfiguracionUseCase';
import { IObtenerAlertasUseCase } from '../usecases/contracts/IObtenerAlertasUseCase';
import { IFinalizarEmergenciaUseCase } from '../usecases/contracts/IFinalizarEmergenciaUseCase';
import { IListarReportesMascotaUseCase } from '../mascotas/usecases/contracts/IListarReportesMascotaUseCase';
import { ICrearReporteMascotaUseCase } from '../mascotas/usecases/contracts/ICrearReporteMascotaUseCase';
import { IGestionarMisReportesMascotaUseCase } from '../mascotas/usecases/contracts/IGestionarMisReportesMascotaUseCase';
import { IObtenerReferenciasMascotaUseCase } from '../mascotas/usecases/contracts/IObtenerReferenciasMascotaUseCase';
import { IRegistrarReporteRapidoUseCase } from '../mascotas/usecases/contracts/IRegistrarReporteRapidoUseCase';

/**
 * Contrato del composition root (DIP).
 * La capa application depende de esta interfaz, NO de DependencyContainer
 * (implementación concreta en infrastructure).
 *
 * Vive en application (no en domain) porque referencia los contratos I*UseCase
 * que ya habitan en application/usecases/contracts — mantenerlo aquí evita
 * crear una dependencia domain → application.
 */
export interface IContainer {
  // --- Repositorios ---
  getAlertaRepository(): IAlertaRepository;
  getConfiguracionRepository(): IConfiguracionRepository;
  getReferenciaRepository(): ICategoriaRepository & IGeografiaRepository & IUsuarioRepository;
  getAuthRepository(): IAuthRepository;
  getTokenStorage(): ITokenStorage;
  /** Base URL pública del backend (sin /api) para resolver assets relativos. */
  getBaseUrl(): string;

  // --- BC Mascotas: Repositorios ---
  getReporteMascotaRepository(): IReporteMascotaRepository;
  getMascotaReferenciaRepository(): IMascotaReferenciaRepository;
  getReporteRapidoRepository(): IReporteRapidoRepository;

  // --- Casos de Uso (Alertas) ---
  getDispararSOSUseCase(): IDispararSOSUseCase;
  getReportarIncidenteUseCase(): IReportarIncidenteUseCase;
  getActualizarConfiguracionUseCase(): IActualizarConfiguracionUseCase;
  getObtenerAlertasUseCase(): IObtenerAlertasUseCase;
  getFinalizarEmergenciaUseCase(): IFinalizarEmergenciaUseCase;

  // --- BC Mascotas: Casos de Uso ---
  getListarReportesMascotaUseCase(): IListarReportesMascotaUseCase;
  getCrearReporteMascotaUseCase(): ICrearReporteMascotaUseCase;
  getGestionarMisReportesMascotaUseCase(): IGestionarMisReportesMascotaUseCase;
  getObtenerReferenciasMascotaUseCase(): IObtenerReferenciasMascotaUseCase;
  getRegistrarReporteRapidoUseCase(): IRegistrarReporteRapidoUseCase;
}

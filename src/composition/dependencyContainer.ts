import { IAlertaRepository } from '../domain/ports/IAlertaRepository';
import { IConfiguracionRepository } from '../domain/ports/IConfiguracionRepository';
import { ICategoriaRepository } from '../domain/ports/ICategoriaRepository';
import { IGeografiaRepository } from '../domain/ports/IGeografiaRepository';
import { IUsuarioRepository } from '../domain/ports/IUsuarioRepository';
import { IAuthRepository } from '../domain/ports/IAuthRepository';
import { ITokenStorage } from '../domain/ports/ITokenStorage';

// BC Mascotas
import { IReporteMascotaRepository } from '../domain/mascotas/ports/IReporteMascotaRepository';
import { IMascotaReferenciaRepository } from '../domain/mascotas/ports/IMascotaReferenciaRepository';
import { IReporteRapidoRepository } from '../domain/mascotas/ports/IReporteRapidoRepository';

import { InMemoryAlertaRepository } from '../infrastructure/adapters/memory/InMemoryAlertaRepository';
import { InMemoryConfiguracionRepository } from '../infrastructure/adapters/memory/InMemoryConfiguracionRepository';
import { InMemoryReferenciaRepository } from '../infrastructure/adapters/memory/InMemoryReferenciaRepository';
import { InMemoryAuthRepository } from '../infrastructure/adapters/memory/InMemoryAuthRepository';
import { ApiReferenciaRepository } from '../infrastructure/adapters/api/ApiReferenciaRepository';
import { HttpAlertaRepository } from '../infrastructure/adapters/api/HttpAlertaRepository';
import { HttpConfiguracionRepository } from '../infrastructure/adapters/api/HttpConfiguracionRepository';
import { HttpAuthRepository } from '../infrastructure/adapters/api/HttpAuthRepository';

// BC Mascotas — adapters
import { HttpReporteMascotaRepository } from '../infrastructure/mascotas/adapters/api/HttpReporteMascotaRepository';
import { HttpMascotaReferenciaRepository } from '../infrastructure/mascotas/adapters/api/HttpMascotaReferenciaRepository';
import { HttpReporteRapidoRepository } from '../infrastructure/mascotas/adapters/api/HttpReporteRapidoRepository';
import { InMemoryReporteMascotaRepository } from '../infrastructure/mascotas/adapters/memory/InMemoryReporteMascotaRepository';
import { InMemoryMascotaReferenciaRepository } from '../infrastructure/mascotas/adapters/memory/InMemoryMascotaReferenciaRepository';
import { InMemoryReporteRapidoRepository } from '../infrastructure/mascotas/adapters/memory/InMemoryReporteRapidoRepository';

import { DispararSOSUseCase } from '../application/usecases/DispararSOSUseCase';
import { ReportarIncidenteUseCase } from '../application/usecases/ReportarIncidenteUseCase';
import { ActualizarConfiguracionUseCase } from '../application/usecases/ActualizarConfiguracionUseCase';
import { ObtenerAlertasUseCase } from '../application/usecases/ObtenerAlertasUseCase';
import { FinalizarEmergenciaUseCase } from '../application/usecases/FinalizarEmergenciaUseCase';

// Contratos (OCP: el container retorna interfaces, no clases concretas)
import { IDispararSOSUseCase } from '../application/usecases/contracts/IDispararSOSUseCase';
import { IReportarIncidenteUseCase } from '../application/usecases/contracts/IReportarIncidenteUseCase';
import { IActualizarConfiguracionUseCase } from '../application/usecases/contracts/IActualizarConfiguracionUseCase';
import { IObtenerAlertasUseCase } from '../application/usecases/contracts/IObtenerAlertasUseCase';
import { IFinalizarEmergenciaUseCase } from '../application/usecases/contracts/IFinalizarEmergenciaUseCase';
import { IListarReportesMascotaUseCase } from '../application/mascotas/usecases/contracts/IListarReportesMascotaUseCase';
import { ICrearReporteMascotaUseCase } from '../application/mascotas/usecases/contracts/ICrearReporteMascotaUseCase';
import { IGestionarMisReportesMascotaUseCase } from '../application/mascotas/usecases/contracts/IGestionarMisReportesMascotaUseCase';
import { IObtenerReferenciasMascotaUseCase } from '../application/mascotas/usecases/contracts/IObtenerReferenciasMascotaUseCase';
import { IRegistrarReporteRapidoUseCase } from '../application/mascotas/usecases/contracts/IRegistrarReporteRapidoUseCase';

// BC Mascotas — casos de uso
import { ListarReportesMascotaUseCase } from '../application/mascotas/usecases/ListarReportesMascotaUseCase';
import { CrearReporteMascotaUseCase } from '../application/mascotas/usecases/CrearReporteMascotaUseCase';
import { GestionarMisReportesMascotaUseCase } from '../application/mascotas/usecases/GestionarMisReportesMascotaUseCase';
import { ObtenerReferenciasMascotaUseCase } from '../application/mascotas/usecases/ObtenerReferenciasMascotaUseCase';
import { RegistrarReporteRapidoUseCase } from '../application/mascotas/usecases/RegistrarReporteRapidoUseCase';

import { getRepositoryType } from '../constants/env';
import { IContainer } from '../application/ports/IContainer';
import { TokenStorage } from '../infrastructure/adapters/storage/TokenStorage';
import { HttpGenericService } from '../infrastructure/adapters/api/HttpGenericService';

/**
 * COMPOSITION ROOT (capa neutra — no es domain/application/infrastructure/presentation).
 * Único módulo del sistema autorizado a importar de todas las capas: es el punto
 * de ensamblaje que cablea adapters (infrastructure) con use cases (application).
 * Vivía en infrastructure/config, lo que creaba un ciclo application → infrastructure → application.
 */
export class DependencyContainer implements IContainer {
  private static instance: DependencyContainer;

  private readonly _alertaRepo: IAlertaRepository;
  private readonly _configRepo: IConfiguracionRepository;
  private readonly _referenciaRepo: ICategoriaRepository & IGeografiaRepository & IUsuarioRepository;
  private readonly _authRepo: IAuthRepository;
  private readonly _tokenStorage: ITokenStorage;
  private readonly _reporteMascotaRepo: IReporteMascotaRepository;
  private readonly _mascotaReferenciaRepo: IMascotaReferenciaRepository;
  private readonly _reporteRapidoRepo: IReporteRapidoRepository;

  private constructor() {
    const repoType = getRepositoryType();

    switch (repoType) {
      case 'api':
        this._alertaRepo = new HttpAlertaRepository();
        this._configRepo = new HttpConfiguracionRepository();
        this._referenciaRepo = new ApiReferenciaRepository();
        this._authRepo = new HttpAuthRepository();
        this._reporteMascotaRepo = new HttpReporteMascotaRepository();
        this._mascotaReferenciaRepo = new HttpMascotaReferenciaRepository();
        this._reporteRapidoRepo = new HttpReporteRapidoRepository();
        break;
      case 'memory':
      default:
        this._alertaRepo = new InMemoryAlertaRepository();
        this._configRepo = new InMemoryConfiguracionRepository();
        this._referenciaRepo = new InMemoryReferenciaRepository();
        this._authRepo = new InMemoryAuthRepository();
        this._reporteMascotaRepo = new InMemoryReporteMascotaRepository();
        this._mascotaReferenciaRepo = new InMemoryMascotaReferenciaRepository();
        this._reporteRapidoRepo = new InMemoryReporteRapidoRepository();
        break;
    }
    this._tokenStorage = TokenStorage.instance;
  }

  static getInstance(): DependencyContainer {
    if (!this.instance) {
      this.instance = new DependencyContainer();
    }
    return this.instance;
  }

  // --- Repositorios ---
  getAlertaRepository(): IAlertaRepository {
    return this._alertaRepo;
  }

  getConfiguracionRepository(): IConfiguracionRepository {
    return this._configRepo;
  }

  getReferenciaRepository(): ICategoriaRepository & IGeografiaRepository & IUsuarioRepository {
    return this._referenciaRepo;
  }

  getAuthRepository(): IAuthRepository {
    return this._authRepo;
  }

  getTokenStorage(): ITokenStorage {
    return this._tokenStorage;
  }

  getBaseUrl(): string {
    return HttpGenericService.getInstance().getBaseUrl();
  }

  // --- BC Mascotas: Repositorios ---
  getReporteMascotaRepository(): IReporteMascotaRepository {
    return this._reporteMascotaRepo;
  }

  getMascotaReferenciaRepository(): IMascotaReferenciaRepository {
    return this._mascotaReferenciaRepo;
  }

  getReporteRapidoRepository(): IReporteRapidoRepository {
    return this._reporteRapidoRepo;
  }

  // --- Casos de Uso (retornan interfaces — OCP) ---
  getDispararSOSUseCase(): IDispararSOSUseCase {
    return new DispararSOSUseCase(this._alertaRepo);
  }

  getReportarIncidenteUseCase(): IReportarIncidenteUseCase {
    return new ReportarIncidenteUseCase(this._alertaRepo);
  }

  getActualizarConfiguracionUseCase(): IActualizarConfiguracionUseCase {
    return new ActualizarConfiguracionUseCase(this._configRepo);
  }

  getObtenerAlertasUseCase(): IObtenerAlertasUseCase {
    return new ObtenerAlertasUseCase(
      this._alertaRepo,
      this._configRepo,
      this._referenciaRepo,
      this._referenciaRepo,
    );
  }

  getFinalizarEmergenciaUseCase(): IFinalizarEmergenciaUseCase {
    return new FinalizarEmergenciaUseCase(this._alertaRepo);
  }

  // --- BC Mascotas: Casos de Uso ---
  getListarReportesMascotaUseCase(): IListarReportesMascotaUseCase {
    return new ListarReportesMascotaUseCase(this._reporteMascotaRepo);
  }

  getCrearReporteMascotaUseCase(): ICrearReporteMascotaUseCase {
    return new CrearReporteMascotaUseCase(this._reporteMascotaRepo);
  }

  getGestionarMisReportesMascotaUseCase(): IGestionarMisReportesMascotaUseCase {
    return new GestionarMisReportesMascotaUseCase(this._reporteMascotaRepo);
  }

  getObtenerReferenciasMascotaUseCase(): IObtenerReferenciasMascotaUseCase {
    return new ObtenerReferenciasMascotaUseCase(this._mascotaReferenciaRepo);
  }

  getRegistrarReporteRapidoUseCase(): IRegistrarReporteRapidoUseCase {
    return new RegistrarReporteRapidoUseCase(this._reporteRapidoRepo);
  }
}

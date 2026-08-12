import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';
import { IConfiguracionRepository } from '../../domain/ports/IConfiguracionRepository';
import { IReferenciaRepository } from '../../domain/ports/IReferenciaRepository';
import { IAuthRepository } from '../../domain/ports/IAuthRepository';

// BC Mascotas
import { IReporteMascotaRepository } from '../../domain/mascotas/ports/IReporteMascotaRepository';
import { IMascotaReferenciaRepository } from '../../domain/mascotas/ports/IMascotaReferenciaRepository';

import { InMemoryAlertaRepository } from '../adapters/memory/InMemoryAlertaRepository';
import { InMemoryConfiguracionRepository } from '../adapters/memory/InMemoryConfiguracionRepository';
import { InMemoryReferenciaRepository } from '../adapters/memory/InMemoryReferenciaRepository';
import { InMemoryAuthRepository } from '../adapters/memory/InMemoryAuthRepository';
import { ApiReferenciaRepository } from '../adapters/api/ApiReferenciaRepository';
import { HttpAlertaRepository } from '../adapters/api/HttpAlertaRepository';
import { HttpConfiguracionRepository } from '../adapters/api/HttpConfiguracionRepository';
import { HttpAuthRepository } from '../adapters/api/HttpAuthRepository';

// BC Mascotas — adapters
import { HttpReporteMascotaRepository } from '../mascotas/adapters/api/HttpReporteMascotaRepository';
import { HttpMascotaReferenciaRepository } from '../mascotas/adapters/api/HttpMascotaReferenciaRepository';
import { InMemoryReporteMascotaRepository } from '../mascotas/adapters/memory/InMemoryReporteMascotaRepository';
import { InMemoryMascotaReferenciaRepository } from '../mascotas/adapters/memory/InMemoryMascotaReferenciaRepository';

import { DispararSOSUseCase } from '../../application/usecases/DispararSOSUseCase';
import { ReportarIncidenteUseCase } from '../../application/usecases/ReportarIncidenteUseCase';
import { ActualizarConfiguracionUseCase } from '../../application/usecases/ActualizarConfiguracionUseCase';
import { ObtenerAlertasUseCase } from '../../application/usecases/ObtenerAlertasUseCase';

import { getRepositoryType } from '../../constants/env';

export class DependencyContainer {
  private static instance: DependencyContainer;

  private readonly _alertaRepo: IAlertaRepository;
  private readonly _configRepo: IConfiguracionRepository;
  private readonly _referenciaRepo: IReferenciaRepository;
  private readonly _authRepo: IAuthRepository;
  private readonly _reporteMascotaRepo: IReporteMascotaRepository;
  private readonly _mascotaReferenciaRepo: IMascotaReferenciaRepository;

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
        break;
      case 'memory':
      default:
        this._alertaRepo = new InMemoryAlertaRepository();
        this._configRepo = new InMemoryConfiguracionRepository();
        this._referenciaRepo = new InMemoryReferenciaRepository();
        this._authRepo = new InMemoryAuthRepository();
        this._reporteMascotaRepo = new InMemoryReporteMascotaRepository();
        this._mascotaReferenciaRepo = new InMemoryMascotaReferenciaRepository();
        break;
    }
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

  getReferenciaRepository(): IReferenciaRepository {
    return this._referenciaRepo;
  }

  getAuthRepository(): IAuthRepository {
    return this._authRepo;
  }

  // --- BC Mascotas: Repositorios ---
  getReporteMascotaRepository(): IReporteMascotaRepository {
    return this._reporteMascotaRepo;
  }

  getMascotaReferenciaRepository(): IMascotaReferenciaRepository {
    return this._mascotaReferenciaRepo;
  }

  // --- Casos de Uso ---
  getDispararSOSUseCase(): DispararSOSUseCase {
    return new DispararSOSUseCase(this._alertaRepo);
  }

  getReportarIncidenteUseCase(): ReportarIncidenteUseCase {
    return new ReportarIncidenteUseCase(this._alertaRepo);
  }

  getActualizarConfiguracionUseCase(): ActualizarConfiguracionUseCase {
    return new ActualizarConfiguracionUseCase(this._configRepo);
  }

  getObtenerAlertasUseCase(): ObtenerAlertasUseCase {
    return new ObtenerAlertasUseCase(
      this._alertaRepo,
      this._configRepo,
      this._referenciaRepo,
    );
  }
}

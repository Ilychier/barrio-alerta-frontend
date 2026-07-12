import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';
import { IConfiguracionRepository } from '../../domain/ports/IConfiguracionRepository';
import { IReferenciaRepository } from '../../domain/ports/IReferenciaRepository';
import { IAuthRepository } from '../../domain/ports/IAuthRepository';

import { InMemoryAlertaRepository } from '../adapters/memory/InMemoryAlertaRepository';
import { InMemoryConfiguracionRepository } from '../adapters/memory/InMemoryConfiguracionRepository';
import { InMemoryReferenciaRepository } from '../adapters/memory/InMemoryReferenciaRepository';
import { InMemoryAuthRepository } from '../adapters/memory/InMemoryAuthRepository';
import { ApiReferenciaRepository } from '../adapters/api/ApiReferenciaRepository';
import { HttpAlertaRepository } from '../adapters/api/HttpAlertaRepository';
import { HttpConfiguracionRepository } from '../adapters/api/HttpConfiguracionRepository';
import { HttpAuthRepository } from '../adapters/api/HttpAuthRepository';

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

  private constructor() {
    const repoType = getRepositoryType();

    switch (repoType) {
      case 'api':
        this._alertaRepo = new HttpAlertaRepository();
        this._configRepo = new HttpConfiguracionRepository();
        this._referenciaRepo = new ApiReferenciaRepository();
        this._authRepo = new HttpAuthRepository();
        break;
      case 'memory':
      default:
        this._alertaRepo = new InMemoryAlertaRepository();
        this._configRepo = new InMemoryConfiguracionRepository();
        this._referenciaRepo = new InMemoryReferenciaRepository();
        this._authRepo = new InMemoryAuthRepository();
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

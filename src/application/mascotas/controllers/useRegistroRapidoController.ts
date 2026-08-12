import { useMemo } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteRapidoResult } from '../../../domain/mascotas/ports/IReporteRapidoRepository';
import { IRegistrarReporteRapidoUseCase } from '../usecases/contracts/IRegistrarReporteRapidoUseCase';

export interface RegistrarRapidoParams {
  phonePersonal: string;
  telefonoContacto: string;
  tipoReporte: 'LOST' | 'FOUND';
  tipoMascotaId: number;
  otroTipoMascota?: string;
  ciudadId: number;
  ubicacion: string;
  descripcion?: string;
  fotoUri?: string;
  fotoMime?: string;
  fotoFile?: any;
}

/**
 * Controller del registro rápido de emergencia (BC Mascotas).
 * Expone el use case de application; el contenedor se inyecta por prop.
 */
export function useRegistroRapidoController(container: DependencyContainer) {
  const useCase: IRegistrarReporteRapidoUseCase = useMemo(
    () => container.getRegistrarReporteRapidoUseCase(),
    [container],
  );

  const registrar = async (params: RegistrarRapidoParams): Promise<ReporteRapidoResult> => {
    return useCase.execute({ ...params });
  };

  return { registrar };
}

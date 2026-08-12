import { useMemo } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteRapidoResult } from '../../../domain/mascotas/ports/IReporteRapidoRepository';
import { RegistrarReporteRapidoUseCase } from '../usecases/RegistrarReporteRapidoUseCase';

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
 * Expone el use case de application; la presentación no toca el contenedor.
 */
export function useRegistroRapidoController() {
  const useCase: RegistrarReporteRapidoUseCase = useMemo(
    () => DependencyContainer.getInstance().getRegistrarReporteRapidoUseCase(),
    [],
  );

  const registrar = async (params: RegistrarRapidoParams): Promise<ReporteRapidoResult> => {
    return useCase.execute({ ...params });
  };

  return { registrar };
}

import { useState, useCallback, useMemo } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { Ciudad } from '../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../domain/mascotas/entities/TipoMascota';
import { ReferenciasMascota } from '../../mascotas/usecases/ObtenerReferenciasMascotaUseCase';

export interface CrearReporteMascotaForm {
  tipoReporte: 'LOST' | 'FOUND';
  tipoMascotaId: number;
  ciudadId: number;
  ubicacion: string;
  telefono: string;
  descripcion?: string;
}

/**
 * Controller del formulario rápido de reporte de mascota.
 * Carga catálogos (ciudades/tipos), crea el reporte y expone estado de envío.
 */
export function useReporteMascotaController(currentUserId: number, onSuccess?: (reporte: ReporteMascota) => void) {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [tiposMascota, setTiposMascota] = useState<TipoMascota[]>([]);
  const [referenciasLoading, setReferenciasLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instancias memoizadas: crearlas en cada render rompe las deps de los callbacks
  const container = useMemo(() => DependencyContainer.getInstance(), []);
  const crearUseCase = useMemo(() => container.getCrearReporteMascotaUseCase(), [container]);
  const referenciasUseCase = useMemo(() => container.getObtenerReferenciasMascotaUseCase(), [container]);

  const cargarReferencias = useCallback(async () => {
    setReferenciasLoading(true);
    try {
      const refs: ReferenciasMascota = await referenciasUseCase.execute();
      setCiudades(refs.ciudades);
      setTiposMascota(refs.tiposMascota);
    } catch (e) {
      console.warn('[useReporteMascotaController] No se pudieron cargar catálogos:', e);
    } finally {
      setReferenciasLoading(false);
    }
  }, [referenciasUseCase]);

  const crear = useCallback(
    async (form: CrearReporteMascotaForm): Promise<ReporteMascota | null> => {
      setEnviando(true);
      setError(null);
      try {
        const reporte = await crearUseCase.execute({
          tipoReporte: form.tipoReporte,
          tipoMascotaId: form.tipoMascotaId,
          ciudadId: form.ciudadId,
          ubicacion: form.ubicacion,
          telefono: form.telefono,
          descripcion: form.descripcion,
          usuarioId: currentUserId,
        });
        if (onSuccess) onSuccess(reporte);
        return reporte;
      } catch (e) {
        setError('No se pudo crear el reporte. Verifica los datos e intenta de nuevo.');
        console.warn('[useReporteMascotaController] Error creando reporte:', e);
        return null;
      } finally {
        setEnviando(false);
      }
    },
    [currentUserId, onSuccess, crearUseCase],
  );

  return {
    ciudades,
    tiposMascota,
    referenciasLoading,
    cargarReferencias,
    crear,
    enviando,
    error,
  };
}

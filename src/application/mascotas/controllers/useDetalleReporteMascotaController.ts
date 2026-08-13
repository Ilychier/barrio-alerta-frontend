import { useState, useEffect } from 'react';
import { IContainer } from '../../ports/IContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';

/**
 * Controller del detalle público de un reporte de mascota.
 * Encapsula la carga del reporte y expone estado (loading/error).
 * El contenedor se inyecta por prop (regla hexagonal).
 */
export function useDetalleReporteMascotaController(
  container: IContainer,
  reporteId: number,
) {
  const [reporte, setReporte] = useState<ReporteMascota | null>(null);
  // Lazy init: sin reporteId no hay carga que hacer (evita setState síncrono en effect)
  const [loading, setLoading] = useState(() => !reporteId);
  const [error, setError] = useState<string | null>(null);

  const repo = container.getReporteMascotaRepository();

  useEffect(() => {
    if (!reporteId) return;
    let active = true;
    (async () => {
      try {
        const data = await repo.obtenerPublico(reporteId);
        if (active) setReporte(data ?? null);
      } catch {
        if (active) setError('No se pudo cargar el reporte');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [reporteId, repo]);

  return { reporte, loading, error };
}

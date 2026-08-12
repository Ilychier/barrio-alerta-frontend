import { useState, useEffect, useCallback } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';

/**
 * Controller del detalle público de un reporte de mascota.
 * Encapsula la carga del reporte y expone estado (loading/error).
 * El contenedor se inyecta por prop (regla hexagonal).
 */
export function useDetalleReporteMascotaController(
  container: DependencyContainer,
  reporteId: number,
) {
  const [reporte, setReporte] = useState<ReporteMascota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repo = container.getReporteMascotaRepository();

  const cargar = useCallback(async () => {
    if (!reporteId) return;
    let active = true;
    setLoading(true);
    setError(null);
    try {
      const data = await repo.obtenerPublico(reporteId);
      if (active) setReporte(data ?? null);
    } catch {
      if (active) setError('No se pudo cargar el reporte');
    } finally {
      if (active) setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [reporteId, repo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { reporte, loading, error, recargar: cargar };
}

import { useState, useEffect, useCallback } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';

/**
 * Controller del detalle público de un reporte de mascota.
 * Encapsula la carga del reporte y expone estado (loading/error).
 * La presentación consume este controller, no el repositorio (regla hexagonal).
 */
export function useDetalleReporteMascotaController(reporteId: number) {
  const [reporte, setReporte] = useState<ReporteMascota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repo = DependencyContainer.getInstance().getReporteMascotaRepository();

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

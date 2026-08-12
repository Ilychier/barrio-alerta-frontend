import { useState, useCallback, useEffect } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { EstadoReporte } from '../../../domain/mascotas/entities/EstadoReporte';

/**
 * Controller de "Mis reportes" (usuario autenticado).
 * Lista los reportes del usuario, permite cambiar estado (rescate)
 * y eliminar (soft delete).
 */
export function useMisReportesMascotaController(usuarioId: number, refreshTrigger?: number) {
  const [reportes, setReportes] = useState<ReporteMascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const useCase = DependencyContainer.getInstance().getGestionarMisReportesMascotaUseCase();

  const cargar = useCallback(async () => {
    if (!usuarioId || usuarioId === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await useCase.listarMios(usuarioId, 0, 100);
      setReportes(result.items);
    } catch (e) {
      setError('No se pudieron cargar tus reportes');
      console.warn('[useMisReportesMascotaController] Error:', e);
    } finally {
      setLoading(false);
    }
  }, [usuarioId, useCase]);

  useEffect(() => {
    cargar();
  }, [cargar, refreshTrigger]);

  const marcarRescatado = useCallback(
    async (id: number): Promise<ReporteMascota | null> => {
      try {
        const actualizado = await useCase.cambiarEstado(id, EstadoReporte.RESCUED);
        setReportes((prev) => prev.map((r) => (r.id === id ? actualizado : r)));
        return actualizado;
      } catch (e) {
        console.warn('[useMisReportesMascotaController] Error al marcar rescatado:', e);
        return null;
      }
    },
    [useCase],
  );

  const eliminar = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await useCase.eliminar(id);
        setReportes((prev) => prev.filter((r) => r.id !== id));
        return true;
      } catch (e) {
        console.warn('[useMisReportesMascotaController] Error al eliminar:', e);
        return false;
      }
    },
    [useCase],
  );

  return {
    reportes,
    loading,
    error,
    recargar: cargar,
    marcarRescatado,
    eliminar,
  };
}

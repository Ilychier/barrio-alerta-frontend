import { useState, useCallback, useEffect, useMemo } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { EstadoReporte } from '../../../domain/mascotas/entities/EstadoReporte';

/**
 * Controller de "Mis reportes" (usuario autenticado).
 * Lista los reportes del usuario, permite cambiar estado (rescate)
 * y eliminar (soft delete). El contenedor se inyecta por prop (regla hexagonal).
 */
export function useMisReportesMascotaController(
  container: DependencyContainer,
  usuarioId: number,
  refreshTrigger?: number,
) {
  const [reportes, setReportes] = useState<ReporteMascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // La instancia se memoiza: crearla en cada render causaba un loop
  // infinito de llamadas (el effect dependía de useCase → re-render → nueva instancia)
  const useCase = useMemo(
    () => container.getGestionarMisReportesMascotaUseCase(),
    [container],
  );
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!usuarioId || usuarioId === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await useCase.listarMios(usuarioId, 0, 100);
        if (active) setReportes(result.items);
      } catch (e) {
        if (active) setError('No se pudieron cargar tus reportes');
        console.warn('[useMisReportesMascotaController] Error:', e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [usuarioId, useCase, refresh, refreshTrigger]);

  const recargar = useCallback(() => {
    setRefresh((r) => r + 1);
  }, []);

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
    recargar,
    marcarRescatado,
    eliminar,
  };
}

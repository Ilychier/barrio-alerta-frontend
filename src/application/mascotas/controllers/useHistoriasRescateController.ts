import { useState, useEffect, useCallback } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { EstadoReporte } from '../../../domain/mascotas/entities/EstadoReporte';

/**
 * Controller de "Historias de rescate": feed de reportes con estado RESCUED.
 * Carga progresiva (scroll infinito) — el usuario percibe flujo continuo.
 */
export function useHistoriasRescateController(refreshTrigger?: number) {
  const [reportes, setReportes] = useState<ReporteMascota[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCase = DependencyContainer.getInstance().getListarReportesMascotaUseCase();

  const loadPage = useCallback(async (pagina: number, acumular: boolean) => {
    const setter = acumular ? setLoadingMore : setLoading;
    setter(true);
    setError(null);
    try {
      const result = await useCase.execute({
        filtros: { estado: EstadoReporte.RESCUED },
        page: pagina,
      });
      setTotalPages(result.totalPages);
      setReportes((prev) => (acumular ? [...prev, ...result.items] : result.items));
    } catch (e) {
      setError('No se pudieron cargar las historias de rescate');
      console.warn('[useHistoriasRescateController] Error:', e);
    } finally {
      setter(false);
    }
  }, [useCase]);

  useEffect(() => {
    setPage(0);
    loadPage(0, false);
  }, [loadPage, refreshTrigger]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || page + 1 >= totalPages) return;
    const next = page + 1;
    setPage(next);
    loadPage(next, true);
  }, [loadingMore, loading, page, totalPages, loadPage]);

  return {
    reportes,
    loading,
    loadingMore,
    error,
    hasMore: page + 1 < totalPages,
    loadMore,
  };
}

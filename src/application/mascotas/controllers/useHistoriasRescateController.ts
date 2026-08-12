import { useState, useEffect, useCallback, useMemo } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { EstadoReporte } from '../../../domain/mascotas/entities/EstadoReporte';

/**
 * Controller de "Historias de rescate": feed de reportes con estado RESCUED.
 * Carga progresiva (scroll infinito) — el usuario percibe flujo continuo.
 * El contenedor se inyecta por prop (regla hexagonal).
 */
export function useHistoriasRescateController(container: DependencyContainer, refreshTrigger?: number) {
  const [reportes, setReportes] = useState<ReporteMascota[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // La instancia se memoiza: crearla en cada render causaba un loop
  // infinito de llamadas (el effect dependía de useCase → re-render → nueva instancia)
  const useCase = useMemo(
    () => container.getListarReportesMascotaUseCase(),
    [container],
  );

  const loadPage = useCallback(async (pagina: number, acumular: boolean) => {
    const setter = acumular ? setLoadingMore : setLoading;
    setter(true);
    setError(null);
    try {
      const result = await useCase.execute({
        filtros: { estado: EstadoReporte.RESCUED },
        page: pagina,
      });
      setPage(pagina);
      setTotalPages(result.totalPages);
      setReportes((prev) => (acumular ? [...prev, ...result.items] : result.items));
    } catch (e) {
      setError('No se pudieron cargar las historias de rescate');
      console.warn('[useHistoriasRescateController] Error:', e);
    } finally {
      setter(false);
    }
  }, [useCase]);

  // Carga inicial (patrón loadData del BC Alertas: async fn dentro del effect)
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const result = await useCase.execute({
          filtros: { estado: EstadoReporte.RESCUED },
          page: 0,
        });
        if (!active) return;
        setPage(0);
        setTotalPages(result.totalPages);
        setReportes(result.items);
      } catch (e) {
        if (active) setError('No se pudieron cargar las historias de rescate');
        console.warn('[useHistoriasRescateController] Error:', e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [useCase, refreshTrigger]);

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

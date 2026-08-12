import { useState, useEffect, useCallback } from 'react';
import { DependencyContainer } from '../../../infrastructure/config/dependencyContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { Ciudad } from '../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../domain/mascotas/entities/TipoMascota';
import { FiltrosReporteMascota } from '../../../domain/mascotas/ports/IReporteMascotaRepository';
import { PAGE_SIZE_DEFAULT } from '../../mascotas/usecases/ListarReportesMascotaUseCase';
import { ReferenciasMascota } from '../../mascotas/usecases/ObtenerReferenciasMascotaUseCase';
import { nombrePorId } from '../../../infrastructure/mascotas/adapters/mappers';

/**
 * Controller del feed público de mascotas.
 * Carga progresiva: mantiene la lista acumulada y pide la siguiente
 * página al hacer scroll (el usuario percibe un flujo continuo).
 */
export function useFeedMascotasController(refreshTrigger?: number) {
  const [reportes, setReportes] = useState<ReporteMascota[]>([]);
  const [filtros, setFiltros] = useState<FiltrosReporteMascota>({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catálogos cacheados (ciudades + tipos) para resolver nombres en cliente
  const [referencias, setReferencias] = useState<ReferenciasMascota | null>(null);
  const [referenciasLoading, setReferenciasLoading] = useState(true);

  const container = DependencyContainer.getInstance();
  const useCase = container.getListarReportesMascotaUseCase();
  const referenciasUseCase = container.getObtenerReferenciasMascotaUseCase();

  // Carga catálogos una vez (los datos geográficos cambian muy rara vez)
  useEffect(() => {
    let active = true;
    setReferenciasLoading(true);
    referenciasUseCase
      .execute()
      .then((refs) => {
        if (active) setReferencias(refs);
      })
      .catch((e) => {
        console.warn('[useFeedMascotasController] No se pudieron cargar catálogos:', e);
      })
      .finally(() => {
        if (active) setReferenciasLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga del feed: resetea al cambiar filtros, acumula al hacer "load more"
  const loadPage = useCallback(
    async (pagina: number, acumular: boolean) => {
      const setter = acumular ? setLoadingMore : setLoading;
      setter(true);
      setError(null);
      try {
        const result = await useCase.execute({ filtros, page: pagina });
        setTotalPages(result.totalPages);
        setReportes((prev) => (acumular ? [...prev, ...result.items] : result.items));
      } catch (e) {
        setError('No se pudieron cargar los reportes de mascotas');
        console.warn('[useFeedMascotasController] Error cargando feed:', e);
      } finally {
        setter(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtros],
  );

  useEffect(() => {
    setPage(0);
    loadPage(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, refreshTrigger]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || page + 1 >= totalPages) return;
    const next = page + 1;
    setPage(next);
    loadPage(next, true);
  }, [loadingMore, loading, page, totalPages, loadPage]);

  const aplicarFiltros = useCallback((nuevos: FiltrosReporteMascota) => {
    setFiltros(nuevos);
  }, []);

  // Helpers de resolución de nombres (KISS — lookup en cliente)
  const nombreCiudad = (ciudadId: number): string =>
    nombrePorId(referencias?.ciudadMap ?? new Map(), ciudadId);
  const departamentoCiudad = (ciudadId: number): string =>
    nombrePorId(referencias?.departamentoMap ?? new Map(), ciudadId);
  const nombreTipoMascota = (tipoMascotaId: number): string =>
    nombrePorId(referencias?.tipoMascotaMap ?? new Map(), tipoMascotaId);

  return {
    reportes,
    filtros,
    aplicarFiltros,
    loading,
    loadingMore,
    error,
    hasMore: page + 1 < totalPages,
    loadMore,
    ciudades: referencias?.ciudades ?? ([] as Ciudad[]),
    tiposMascota: referencias?.tiposMascota ?? ([] as TipoMascota[]),
    referenciasLoading,
    nombreCiudad,
    departamentoCiudad,
    nombreTipoMascota,
  };
}

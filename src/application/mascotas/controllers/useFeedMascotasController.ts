import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IContainer } from '../../ports/IContainer';
import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { Ciudad } from '../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../domain/mascotas/entities/TipoMascota';
import { FiltrosReporteMascota } from '../../../domain/mascotas/ports/IReporteMascotaRepository';
import { ReferenciasMascota } from '../../mascotas/usecases/ObtenerReferenciasMascotaUseCase';
import { nombrePorId } from '../services/catalogos';

/** Espera entre tecleos antes de disparar la búsqueda por texto (KISS: evita 1 request por tecla). */
const DEBOUNCE_MS = 350;

/**
 * Controller del feed público de mascotas.
 * Carga progresiva: mantiene la lista acumulada y pide la siguiente
 * página al hacer scroll (el usuario percibe un flujo continuo).
 */
export function useFeedMascotasController(container: IContainer, refreshTrigger?: number) {
  const [reportes, setReportes] = useState<ReporteMascota[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catálogos cacheados (ciudades + tipos) para resolver nombres en cliente
  const [referencias, setReferencias] = useState<ReferenciasMascota | null>(null);
  const [referenciasLoading, setReferenciasLoading] = useState(true);

  // Instancias memoizadas: crearlas en cada render rompe las deps de los effects
  const useCase = useMemo(() => container.getListarReportesMascotaUseCase(), [container]);
  const referenciasUseCase = useMemo(() => container.getObtenerReferenciasMascotaUseCase(), [container]);

  // Filtros "efectivos" (sin debounce) vs. "pendientes" (texto del input).
  // La búsqueda por texto espera DEBOUNCE_MS; los demás filtros aplican al instante.
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosReporteMascota>({});
  const [busquedaPendiente, setBusquedaPendiente] = useState('');
  const [filtrosPendientes, setFiltrosPendientes] = useState<FiltrosReporteMascota>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set de ids ya cargados: dedup O(1) por item (antes O(n²) con prev.some).
  // Se resetea al cambiar filtros (carga no acumulada).
  const idsCargados = useRef(new Set<number>());

  // Carga catálogos una vez (los datos geográficos cambian muy rara vez)
  useEffect(() => {
    let active = true;
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

  // Debounce: aplica los filtros pendientes tras DEBOUNCE_MS de inactividad.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFiltrosAplicados(filtrosPendientes);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filtrosPendientes]);

  // Carga del feed: resetea al cambiar filtros, acumula al hacer "load more"
  const loadPage = useCallback(
    async (pagina: number, acumular: boolean) => {
      const setter = acumular ? setLoadingMore : setLoading;
      setter(true);
      setError(null);
      try {
        const result = await useCase.execute({ filtros: filtrosAplicados, page: pagina });
        setPage(pagina);
        setTotalPages(result.totalPages);
        if (acumular) {
          // Dedup O(1) por item con el Set persistente (evita O(n²) en JS thread)
          const nuevos = result.items.filter((i) => !idsCargados.current.has(i.id));
          nuevos.forEach((i) => idsCargados.current.add(i.id));
          setReportes((prev) => [...prev, ...nuevos]);
        } else {
          idsCargados.current = new Set(result.items.map((i) => i.id));
          setReportes(result.items);
        }
      } catch (e) {
        setError('No se pudieron cargar los reportes de mascotas');
        console.warn('[useFeedMascotasController] Error cargando feed:', e);
      } finally {
        setter(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtrosAplicados],
  );

  // Carga inicial del feed (patrón loadData del BC Alertas: async fn dentro del effect)
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const result = await useCase.execute({ filtros: filtrosAplicados, page: 0 });
        if (!active) return;
        setPage(0);
        setTotalPages(result.totalPages);
        setReportes(result.items);
      } catch (e) {
        if (active) setError('No se pudieron cargar los reportes de mascotas');
        console.warn('[useFeedMascotasController] Error cargando feed:', e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrosAplicados, refreshTrigger]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || page + 1 >= totalPages) return;
    // Sin setPage prematuro: loadPage ya actualiza `page` al llegar la
    // respuesta. Evita un re-render extra justo durante el scroll.
    loadPage(page + 1, true);
  }, [loadingMore, loading, page, totalPages, loadPage]);

  const aplicarFiltros = useCallback((nuevos: FiltrosReporteMascota) => {
    setFiltrosPendientes(nuevos);
  }, []);

  /** Actualiza el texto de búsqueda (debounced en el effect). */
  const setBusqueda = useCallback((texto: string) => {
    setBusquedaPendiente(texto);
  }, []);

  // Helpers de resolución de nombres (KISS — lookup en cliente)
  const nombreCiudad = (ciudadId: number): string =>
    nombrePorId(referencias?.ciudadMap ?? new Map(), ciudadId);
  const departamentoCiudad = (ciudadId: number): string =>
    nombrePorId(referencias?.departamentoMap ?? new Map(), ciudadId);
  const nombreTipoMascota = (reporte: ReporteMascota): string =>
    reporte.otroTipoMascota ?? nombrePorId(referencias?.tipoMascotaMap ?? new Map(), reporte.tipoMascotaId);

  // Carga inicial completa: feed (página 0) + catálogos. Evita el salto de
  // layout/texto al renderizar cards sin nombres de ciudad/tipo.
  const initialLoading = loading || referenciasLoading;

  return {
    reportes,
    filtros: filtrosAplicados,
    aplicarFiltros,
    busqueda: busquedaPendiente,
    setBusqueda,
    loading,
    initialLoading,
    loadingMore,
    error,
    hasMore: page + 1 < totalPages,
    loadMore,
    ciudades: referencias?.ciudades ?? ([] as Ciudad[]),
    tiposMascota: referencias?.tiposMascota ?? ([] as TipoMascota[]),
    referenciasLoading,
    // Mapas estables para lookup en cliente (props de MascotaCard memoizada)
    ciudadMap: referencias?.ciudadMap ?? new Map<number, string>(),
    departamentoMap: referencias?.departamentoMap ?? new Map<number, string>(),
    tipoMascotaMap: referencias?.tipoMascotaMap ?? new Map<number, string>(),
    nombreCiudad,
    departamentoCiudad,
    nombreTipoMascota,
  };
}

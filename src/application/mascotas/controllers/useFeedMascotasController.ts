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
 * Semilla de sesión: se genera UNA vez por arranque de la app (módulo).
 * El feed se aleatoriza por sesión — el orden es estable mientras la app
 * esté abierta (navegar y volver NO lo cambia) y distinto en cada arranque.
 *
 * OJO: Math.random() devuelve [0,1) — hay que escalarlo a entero de 32 bits
 * antes de pasarlo al PRNG, porque `seed >>> 0` truncaría el float a 0
 * (misma secuencia en todas las sesiones).
 */
const SESSION_SEED = (Math.random() * 0xffffffff) >>> 0;

/** PRNG determinista (mulberry32): misma semilla → misma secuencia. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle determinista por sesión (copia, no muta).
 * El feed llega ordenado del backend y se aleatoriza en el cliente:
 * mismo orden mientras la app está abierta, distinto en cada arranque.
 * Es presentación pura — la paginación, el dedup por id y la navegación
 * no dependen de la posición del item.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  const rand = seededRandom(SESSION_SEED);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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
          // Shuffle solo de la página entrante: los items ya en pantalla no se mueven
          setReportes((prev) => [...prev, ...shuffleArray(nuevos)]);
        } else {
          idsCargados.current = new Set(result.items.map((i) => i.id));
          setReportes(shuffleArray(result.items));
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
      // Limpiar reportes viejos antes de cargar: evita que se vea la lista
      // anterior durante un frame al re-entrar a la pantalla (el skeleton
      // debe cubrir el shuffle nuevo, no la data residual).
      setReportes([]);
      idsCargados.current = new Set();
      setLoading(true);
      setError(null);
      try {
        const result = await useCase.execute({ filtros: filtrosAplicados, page: 0 });
        if (!active) return;
        setPage(0);
        setTotalPages(result.totalPages);
        setReportes(shuffleArray(result.items));
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

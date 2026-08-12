import { useCallback, useMemo, useState } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { Barrio } from '../../domain/entities/barrio';
import { Localidad } from '../../domain/entities/localidad';
import { Ciudad } from '../../domain/mascotas/entities/Ciudad';

/**
 * Catálogos geográficos en cascada para el reporte de mascota (Opción B):
 * Departamento → Municipio → Localidad → Barrio, más un detalle libre.
 * <p>
 * El reporte guarda SOLO `ciudadId` (municipio) + `ubicacion` (string compuesto);
 * la cascada es un asistente de entrada en UI. El dominio/BD no cambian.
 * <p>
 * Patrón mimetizado de RegisterScreen: departamentos derivados del catálogo
 * de municipios (KISS: sin endpoint extra), localidades/barrios bajo demanda.
 */
export interface UbicacionOption {
  value: number | string;
  label: string;
}

export interface UbicacionGeografica {
  departamentoOptions: UbicacionOption[];
  municipioOptions: UbicacionOption[];
  localidadOptions: UbicacionOption[];
  barrioOptions: UbicacionOption[];
  departamento: string;
  municipioId: number;
  localidadId: number;
  barrioId: number;
  barriosHasMore: boolean;
  barriosLoadingMore: boolean;
  detalle: string;
  setDetalle: (v: string) => void;
  cambiarDepartamento: (v: number | string) => void;
  cambiarMunicipio: (v: number | string) => void;
  cambiarLocalidad: (v: number | string) => void;
  cambiarBarrio: (v: number | string) => void;
  cargarMasBarrios: () => void;
  /** String final para el campo `ubicacion` del reporte (≤255, límite backend). */
  ubicacionCompuesta: string;
}

const PAGE_SIZE = 20;

/**
 * Compone la ubicación legible: "Localidad — Barrio · detalle".
 * Si no hay catálogo seleccionado, el detalle libre funciona como antes
 * (compatibilidad total con el flujo de emergencia de baja fricción).
 */
export function componerUbicacion(
  localidad?: string,
  barrio?: string,
  detalle?: string,
): string {
  const partes: string[] = [];
  if (localidad) {
    partes.push(barrio ? `${localidad} — ${barrio}` : localidad);
  } else if (barrio) {
    partes.push(barrio);
  }
  const detalleTrim = detalle?.trim();
  if (detalleTrim) partes.push(detalleTrim);
  return partes.join(' · ').slice(0, 255);
}

export function useUbicacionGeografica(container: DependencyContainer, ciudades: Ciudad[]): UbicacionGeografica {
  const referenciasRepo = useMemo(
    () => container.getReferenciaRepository(),
    [container],
  );

  const [departamento, setDepartamento] = useState('');
  const [municipioId, setMunicipioId] = useState(0);
  const [localidadId, setLocalidadId] = useState(0);
  const [barrioId, setBarrioId] = useState(0);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [barriosPage, setBarriosPage] = useState(0);
  const [barriosHasMore, setBarriosHasMore] = useState(false);
  const [barriosLoadingMore, setBarriosLoadingMore] = useState(false);
  const [detalle, setDetalle] = useState('');

  const departamentoOptions = useMemo<UbicacionOption[]>(
    () =>
      [...new Set(ciudades.map((c) => c.departamento).filter(Boolean))]
        .sort()
        .map((d) => ({ value: d, label: d })),
    [ciudades],
  );

  const municipioOptions = useMemo<UbicacionOption[]>(
    () =>
      ciudades
        .filter((c) => c.departamento === departamento)
        .map((c) => ({ value: c.id, label: c.nombre })),
    [ciudades, departamento],
  );

  const localidadOptions = useMemo<UbicacionOption[]>(
    () => localidades.map((l) => ({ value: l.id, label: l.nombre })),
    [localidades],
  );

  const barrioOptions = useMemo<UbicacionOption[]>(
    () => barrios.map((b) => ({ value: b.id, label: b.nombre })),
    [barrios],
  );

  const resetCadena = useCallback(() => {
    setMunicipioId(0);
    setLocalidadId(0);
    setBarrioId(0);
    setLocalidades([]);
    setBarrios([]);
  }, []);

  const cambiarDepartamento = useCallback(
    (v: number | string) => {
      setDepartamento(String(v));
      resetCadena();
    },
    [resetCadena],
  );

  const cambiarMunicipio = useCallback(
    async (v: number | string) => {
      const id = Number(v);
      setMunicipioId(id);
      setLocalidadId(0);
      setBarrioId(0);
      setLocalidades([]);
      setBarrios([]);
      if (!id) return;
      try {
        const items = await referenciasRepo.getLocalidadesByMunicipio(id);
        setLocalidades(items);
      } catch (e) {
        console.warn('[useUbicacionGeografica] Error cargando localidades:', e);
      }
    },
    [referenciasRepo],
  );

  const cambiarLocalidad = useCallback(
    async (v: number | string) => {
      const id = Number(v);
      setLocalidadId(id);
      setBarrioId(0);
      setBarrios([]);
      if (!id) return;
      try {
        const result = await referenciasRepo.getBarriosPaginated(0, PAGE_SIZE, id);
        setBarrios(result.items);
        setBarriosPage(0);
        setBarriosHasMore(result.page + 1 < result.totalPages);
      } catch (e) {
        console.warn('[useUbicacionGeografica] Error cargando barrios:', e);
      }
    },
    [referenciasRepo],
  );

  const cambiarBarrio = useCallback((v: number | string) => {
    setBarrioId(Number(v));
  }, []);

  const cargarMasBarrios = useCallback(async () => {
    if (barriosLoadingMore || !barriosHasMore || !localidadId) return;
    setBarriosLoadingMore(true);
    try {
      const nextPage = barriosPage + 1;
      const result = await referenciasRepo.getBarriosPaginated(nextPage, PAGE_SIZE, localidadId);
      setBarrios((prev) => [...prev, ...result.items]);
      setBarriosPage(nextPage);
      setBarriosHasMore(nextPage + 1 < result.totalPages);
    } catch (e) {
      console.warn('[useUbicacionGeografica] Error cargando más barrios:', e);
    } finally {
      setBarriosLoadingMore(false);
    }
  }, [barriosLoadingMore, barriosHasMore, localidadId, barriosPage, referenciasRepo]);

  const localidadNombre = localidades.find((l) => l.id === localidadId)?.nombre;
  const barrioNombre = barrios.find((b) => b.id === barrioId)?.nombre;

  const ubicacionCompuesta = useMemo(
    () => componerUbicacion(localidadNombre, barrioNombre, detalle),
    [localidadNombre, barrioNombre, detalle],
  );

  return {
    departamentoOptions,
    municipioOptions,
    localidadOptions,
    barrioOptions,
    departamento,
    municipioId,
    localidadId,
    barrioId,
    barriosHasMore,
    barriosLoadingMore,
    detalle,
    setDetalle,
    cambiarDepartamento,
    cambiarMunicipio,
    cambiarLocalidad,
    cambiarBarrio,
    cargarMasBarrios,
    ubicacionCompuesta,
  };
}

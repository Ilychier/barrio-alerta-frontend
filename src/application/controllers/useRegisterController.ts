import { useCallback, useEffect, useState } from 'react';
import { IContainer } from '../ports/IContainer';
import { Ciudad } from '../../domain/mascotas/entities/Ciudad';
import { Localidad } from '../../domain/entities/localidad';
import { Barrio } from '../../domain/entities/barrio';

const PAGE_SIZE = 20;

/**
 * Controller del formulario de registro: carga los catálogos geográficos
 * (municipios → localidades → barrios paginados).
 * El contenedor se inyecta por prop (regla hexagonal).
 */
export function useRegisterController(container: IContainer) {
  const [municipios, setMunicipios] = useState<Ciudad[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [barriosPage, setBarriosPage] = useState(0);
  const [barriosHasMore, setBarriosHasMore] = useState(true);
  const [barriosLoadingMore, setBarriosLoadingMore] = useState(false);

  const mascotaRefRepo = container.getMascotaReferenciaRepository();
  const refRepo = container.getReferenciaRepository();

  // 1. Carga el catálogo de municipios (1125 reales de Colombia) una sola vez
  useEffect(() => {
    let active = true;
    async function fetchMunicipios() {
      try {
        const todas = await mascotaRefRepo.getCiudadesTodas();
        if (active) setMunicipios(todas);
      } catch (e) {
        console.error('Error fetching municipios:', e);
      }
    }
    fetchMunicipios();
    return () => {
      active = false;
    };
  }, [mascotaRefRepo]);

  // 2. Al elegir municipio, carga sus localidades
  const cargarLocalidades = useCallback(
    async (municipioId: number): Promise<Localidad[]> => {
      if (!municipioId) {
        setLocalidades([]);
        return [];
      }
      try {
        const items = await refRepo.getLocalidadesByMunicipio(municipioId);
        setLocalidades(items);
        return items;
      } catch (e) {
        console.error('Error fetching localidades:', e);
        return [];
      }
    },
    [refRepo],
  );

  // 3. Al elegir localidad, carga sus barrios (primera página)
  const cargarBarrios = useCallback(
    async (localidadId: number): Promise<Barrio[]> => {
      if (!localidadId) {
        setBarrios([]);
        return [];
      }
      try {
        const result = await refRepo.getBarriosPaginated(0, PAGE_SIZE, localidadId);
        setBarrios(result.items);
        setBarriosPage(0);
        setBarriosHasMore(result.page + 1 < result.totalPages);
        return result.items;
      } catch (e) {
        console.error('Error fetching barrios:', e);
        return [];
      }
    },
    [refRepo],
  );

  // 4. Paginación de barrios (scroll infinito en el selector)
  const cargarMasBarrios = useCallback(
    async (localidadId: number) => {
      if (barriosLoadingMore || !barriosHasMore || !localidadId) return;
      setBarriosLoadingMore(true);
      try {
        const nextPage = barriosPage + 1;
        const result = await refRepo.getBarriosPaginated(nextPage, PAGE_SIZE, localidadId);
        setBarrios((prev) => [...prev, ...result.items]);
        setBarriosPage(nextPage);
        setBarriosHasMore(nextPage + 1 < result.totalPages);
      } catch (e) {
        console.error('Error loading more barrios:', e);
      } finally {
        setBarriosLoadingMore(false);
      }
    },
    [barriosLoadingMore, barriosHasMore, barriosPage, refRepo],
  );

  /** Resetea la cadena geográfica (localidades + barrios) al cambiar departamento. */
  const resetCadenaGeografica = useCallback(() => {
    setLocalidades([]);
    setBarrios([]);
    setBarriosPage(0);
    setBarriosHasMore(true);
  }, []);

  return {
    municipios,
    localidades,
    barrios,
    barriosPage,
    barriosHasMore,
    barriosLoadingMore,
    cargarLocalidades,
    cargarBarrios,
    cargarMasBarrios,
    resetCadenaGeografica,
  };
}

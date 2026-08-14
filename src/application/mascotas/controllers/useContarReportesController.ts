import { useEffect, useState } from 'react';
import { IContainer } from '../../ports/IContainer';
import { EstadoReporte } from '../../../domain/mascotas/entities/EstadoReporte';
import { TipoReporte } from '../../../domain/mascotas/entities/TipoReporte';

/**
 * Resultado del conteo de reportes para el badge flotante del feed.
 * Los tres conteos son independientes (no se suman: "perdidos" y
 * "rescatados" son subconjuntos de "registrados").
 */
export interface ConteoReportes {
  registrados: number;
  perdidos: number;
  rescatados: number;
}

/**
 * Controller que cuenta reportes para el badge del feed.
 *
 * KISS: reutiliza el use case existente con size=1 — el backend
 * devuelve totalElements exacto aunque solo traiga 1 item. Así
 * evitamos un endpoint nuevo, un use case nuevo y un puerto nuevo.
 *
 * Las 3 peticiones se disparan en paralelo (Promise.all). Si una
 * falla, su contador queda en 0 (allSettled-style con catch individual).
 */
export function useContarReportesController(container: IContainer) {
  const [conteo, setConteo] = useState<ConteoReportes>({
    registrados: 0,
    perdidos: 0,
    rescatados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const useCase = container.getListarReportesMascotaUseCase();

    async function cargar() {
      setLoading(true);
      try {
        // 3 peticiones paralelas, cada una trae 1 solo item pero con
        // totalElements exacto. size=1 minimiza payload.
        const [todos, perdidos, rescatados] = await Promise.all([
          useCase.execute({ filtros: {}, page: 0, size: 1 }).catch(() => null),
          useCase.execute({ filtros: { tipoReporte: TipoReporte.LOST }, page: 0, size: 1 }).catch(() => null),
          useCase.execute({ filtros: { estado: EstadoReporte.RESCUED }, page: 0, size: 1 }).catch(() => null),
        ]);

        if (!active) return;
        setConteo({
          registrados: todos?.totalElements ?? 0,
          perdidos: perdidos?.totalElements ?? 0,
          rescatados: rescatados?.totalElements ?? 0,
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    cargar();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { conteo, loading };
}
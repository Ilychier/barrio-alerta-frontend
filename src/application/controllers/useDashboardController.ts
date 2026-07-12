import { useState, useEffect } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { Usuario } from '../../domain/entities/usuario';
import { Barrio } from '../../domain/entities/barrio';
import { Cuadrante } from '../../domain/entities/cuadrante';
import { Configuracion } from '../../domain/entities/configuracion';

export function useDashboardController(currentUserId: number, refreshTrigger?: number) {
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);
  const [barrio, setBarrio] = useState<Barrio | undefined>(undefined);
  const [cuadrante, setCuadrante] = useState<Cuadrante | undefined>(undefined);
  const [config, setConfig] = useState<Configuracion | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || currentUserId === 0) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    let active = true;
    const container = DependencyContainer.getInstance();
    const referenciaRepo = container.getReferenciaRepository();
    const configRepo = container.getConfiguracionRepository();

    async function loadData() {
      try {
        setLoading(true);
        const userRes = await referenciaRepo.getUsuarioById(currentUserId);

        if (!active) return;
        setUsuario(userRes);

        let resolvedBarrio: Barrio | undefined = undefined;

        if (userRes) {
          resolvedBarrio = await referenciaRepo.getBarrioById(userRes.barrio_id);
          if (!active) return;
          setBarrio(resolvedBarrio);

          if (resolvedBarrio) {
            const resolvedCuadrante = await referenciaRepo.getCuadranteById(resolvedBarrio.cuadrante_id);
            if (!active) return;
            setCuadrante(resolvedCuadrante);
          }
        }

        const configRes = await configRepo.obtenerPorUsuarioId(currentUserId);
        if (!active) return;
        setConfig(configRes);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [currentUserId, refreshTrigger]);

  return {
    usuario,
    barrio,
    cuadrante,
    config,
    loading,
  };
}

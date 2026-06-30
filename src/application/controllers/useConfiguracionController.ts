import { useState, useCallback, useEffect } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { Configuracion } from '../../domain/entities/configuracion';

type CampoConfig = 'recibir_notificaciones' | 'modo_silencioso';

export function useConfiguracionController(currentUserId: number) {
  const container = DependencyContainer.getInstance();
  const useCase = container.getActualizarConfiguracionUseCase();
  const configRepo = container.getConfiguracionRepository();

  const [config, setConfig] = useState<Configuracion | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await configRepo.obtenerPorUsuarioId(currentUserId);
        if (active) {
          setConfig(res);
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadConfig();
    return () => {
      active = false;
    };
  }, [currentUserId, configRepo]);

  const handleUpdate = useCallback(
    async (campo: CampoConfig, valor: boolean) => {
      try {
        const result = await useCase.execute({ usuarioId: currentUserId, campo, valor });
        setConfig(result.configuracion);
      } catch (error) {
        console.error('Error updating configuration:', error);
      }
    },
    [currentUserId, useCase],
  );

  return { config, handleUpdate, loading };
}

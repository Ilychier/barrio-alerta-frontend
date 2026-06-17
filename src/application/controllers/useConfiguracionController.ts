import { useState, useCallback } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { Configuracion } from '../../domain/entities/configuracion';

type CampoConfig = 'recibir_notificaciones' | 'modo_silencioso';

export function useConfiguracionController(currentUserId: number) {
  const container = DependencyContainer.getInstance();
  const useCase = container.getActualizarConfiguracionUseCase();
  const configRepo = container.getConfiguracionRepository();

  const [config, setConfig] = useState<Configuracion | undefined>(() =>
    configRepo.obtenerPorUsuarioId(currentUserId),
  );

  const handleUpdate = useCallback(
    (campo: CampoConfig, valor: boolean) => {
      const result = useCase.execute({ usuarioId: currentUserId, campo, valor });
      setConfig(result.configuracion);
    },
    [currentUserId, useCase],
  );

  return { config, handleUpdate };
}

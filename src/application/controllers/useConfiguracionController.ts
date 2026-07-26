import { useState, useCallback } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { useAuth } from '../../presentation/context/AuthContext';

type CampoConfig = 'recibir_notificaciones' | 'modo_silencioso';

export function useConfiguracionController() {
  const container = DependencyContainer.getInstance();
  const useCase = container.getActualizarConfiguracionUseCase();
  const { configuracion, setConfiguracion } = useAuth();

  const handleUpdate = useCallback(
    async (campo: CampoConfig, valor: boolean) => {
      try {
        const result = await useCase.execute({ usuarioId: configuracion?.usuario_id ?? 0, campo, valor });
        setConfiguracion(result.configuracion);
      } catch (error) {
        console.error('Error updating configuration:', error);
      }
    },
    [configuracion, useCase, setConfiguracion],
  );

  return { config: configuracion, handleUpdate };
}

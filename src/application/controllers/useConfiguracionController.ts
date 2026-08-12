import { useState, useCallback } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { Configuracion } from '../../domain/entities/configuracion';

type CampoConfig = 'recibir_notificaciones' | 'modo_silencioso';

export interface FeedbackState {
  message: string;
  type: 'success' | 'error';
}

/**
 * Dependencias que la presentación inyecta al controller.
 * La capa application NO conoce la capa presentation (regla hexagonal).
 */
export interface ConfiguracionControllerDeps {
  configuracion: Configuracion | null;
  setConfiguracion: (config: Configuracion | null) => void;
}

export function useConfiguracionController(deps: ConfiguracionControllerDeps) {
  const { configuracion, setConfiguracion } = deps;
  const container = DependencyContainer.getInstance();
  const useCase = container.getActualizarConfiguracionUseCase();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const handleUpdate = useCallback(
    async (campo: CampoConfig, valor: boolean) => {
      try {
        const result = await useCase.execute({ usuarioId: configuracion?.usuario_id ?? 0, campo, valor });
        setConfiguracion(result.configuracion);
        setFeedback({ message: 'Configuración actualizada', type: 'success' });
      } catch (error) {
        console.error('Error updating configuration:', error);
        setFeedback({ message: 'Error al actualizar la configuración', type: 'error' });
      } finally {
        setTimeout(() => setFeedback(null), 3000);
      }
    },
    [configuracion, useCase, setConfiguracion],
  );

  return { config: configuracion, handleUpdate, feedback, clearFeedback: () => setFeedback(null) };
}

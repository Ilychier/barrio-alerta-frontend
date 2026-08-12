import { useState, useEffect, useRef, useCallback } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { Alerta } from '../../domain/entities/alerta';

export type SOSStep = 0 | 1 | 2;

/**
 * Controller del flujo SOS. El contenedor se inyecta por prop
 * (regla hexagonal: application no importa infrastructure directamente).
 */
export function useSOSController(
  container: DependencyContainer,
  currentUserId: number,
  onSuccess?: () => void,
) {
  const [sosStep, setSosStep] = useState<SOSStep>(0);
  const [sosCountdown, setSosCountdown] = useState(3);
  const [performanceTracker, setPerformanceTracker] = useState<string | null>(null);

  const useCase = container.getDispararSOSUseCase();

  // Ref para evitar stale closure en el intervalo (se actualiza en efecto)
  const triggerSOSRef = useRef<() => void>(() => {});

  const triggerSOSFinal = useCallback(async () => {
    const start = Date.now();
    await useCase.execute({ usuarioId: currentUserId });

    const latency = Date.now() - start;
    setPerformanceTracker(`${latency}ms`);
    setSosStep(2);
    if (onSuccess) {
      onSuccess();
    }
  }, [currentUserId, useCase, onSuccess]);

  // Ref para evitar stale closure en el intervalo (se actualiza en efecto)
  useEffect(() => {
    triggerSOSRef.current = triggerSOSFinal;
  }, [triggerSOSFinal]);

  // Efecto: contador regresivo cuando sosStep = 1
  useEffect(() => {
    if (sosStep !== 1) return;

    const id = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [sosStep]);

  // Efecto: cuando el contador llega a 0, dispara SOS
  useEffect(() => {
    if (sosStep === 1 && sosCountdown <= 0) {
      triggerSOSRef.current();
    }
  }, [sosCountdown, sosStep]);

  const startSOS = useCallback(() => {
    if (sosStep !== 0) return;
    setSosStep(1);
    setSosCountdown(3);
  }, [sosStep]);

  const cancelSOS = useCallback(() => {
    setSosStep(0);
  }, []);

  const dismissSOS = useCallback(async () => {
    setSosStep(0);
    setPerformanceTracker(null);

    const newId = Math.floor(Math.random() * 1000) + 1000;
    const fineAlert = Alerta.crearDesdeFormulario(
      newId,
      '¡Todo está bien ahora! Emergencia finalizada.',
      new Date().toISOString(),
      currentUserId,
      5
    );
    try {
      await container.getAlertaRepository().crearAlerta(fineAlert);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.warn('[useSOSController] Failed to create stop emergency alert:', err);
    }
  }, [currentUserId, onSuccess, container]);

  return {
    sosStep,
    sosCountdown,
    performanceTracker,
    startSOS,
    cancelSOS,
    triggerSOSFinal,
    dismissSOS,
  };
}

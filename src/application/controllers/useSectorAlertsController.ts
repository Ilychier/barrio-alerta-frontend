import { useState, useEffect } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { AlertaConDatos } from '../../application/usecases/ObtenerAlertasUseCase';
import { Barrio } from '../../domain/entities/barrio';

export function useSectorAlertsController(currentUserId: number, refreshTrigger?: number) {
  const [alertas, setAlertas] = useState<AlertaConDatos[]>([]);
  const [barrio, setBarrio] = useState<Barrio | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());

  const formatearFechaISO = (fecha: Date): string => {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const cambiarDia = (dias: number) => {
    setFechaSeleccionada((prev) => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setDate(nuevaFecha.getDate() + dias);
      return nuevaFecha;
    });
  };

  useEffect(() => {
    if (!currentUserId || currentUserId === 0) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    let active = true;
    const container = DependencyContainer.getInstance();
    const obtenerAlertas = container.getObtenerAlertasUseCase();
    const referenciaRepo = container.getReferenciaRepository();

    async function loadData() {
      try {
        setLoading(true);
        const [alertasRes, userRes] = await Promise.all([
          obtenerAlertas.execute(currentUserId, formatearFechaISO(fechaSeleccionada)),
          referenciaRepo.getUsuarioById(currentUserId),
        ]);

        if (!active) return;
        setAlertas(alertasRes.alertas);

        if (userRes) {
          const resolvedBarrio = await referenciaRepo.getBarrioById(userRes.barrio_id);
          if (!active) return;
          setBarrio(resolvedBarrio);
        }
      } catch (error) {
        console.error('Error loading sector alerts:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [currentUserId, refreshTrigger, fechaSeleccionada]);

  return {
    alertas,
    barrio,
    loading,
    fechaSeleccionada,
    cambiarDia,
    formatearFechaISO,
  };
}

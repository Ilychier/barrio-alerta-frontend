import { useState, useEffect } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { AlertaConDatos } from '../../application/usecases/ObtenerAlertasUseCase';
import { Usuario } from '../../domain/entities/usuario';
import { Barrio } from '../../domain/entities/barrio';
import { Cuadrante } from '../../domain/entities/cuadrante';
import { Configuracion } from '../../domain/entities/configuracion';

export function useDashboardController(currentUserId: number, refreshTrigger?: number) {
  const [alertas, setAlertas] = useState<AlertaConDatos[]>([]);
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined);
  const [barrio, setBarrio] = useState<Barrio | undefined>(undefined);
  const [cuadrante, setCuadrante] = useState<Cuadrante | undefined>(undefined);
  const [config, setConfig] = useState<Configuracion | undefined>(undefined);
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
    const configRepo = container.getConfiguracionRepository();

    async function loadData() {
      try {
        setLoading(true);
        const [alertasRes, userRes] = await Promise.all([
          obtenerAlertas.execute(currentUserId, formatearFechaISO(fechaSeleccionada)),
          referenciaRepo.getUsuarioById(currentUserId),
        ]);

        if (!active) return;
        setAlertas(alertasRes.alertas);
        setUsuario(userRes);

        let resolvedBarrio: Barrio | undefined = undefined;
        let resolvedCuadrante: Cuadrante | undefined = undefined;

        if (userRes) {
          resolvedBarrio = await referenciaRepo.getBarrioById(userRes.barrio_id);
          if (!active) return;
          setBarrio(resolvedBarrio);

          if (resolvedBarrio) {
            resolvedCuadrante = await referenciaRepo.getCuadranteById(resolvedBarrio.cuadrante_id);
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
  }, [currentUserId, refreshTrigger, fechaSeleccionada]);

  return {
    alertas,
    usuario,
    barrio,
    cuadrante,
    config,
    loading,
    fechaSeleccionada,
    cambiarDia,
    formatearFechaISO,
  };
}

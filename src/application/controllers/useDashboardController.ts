import { useAuth } from '../../presentation/context/AuthContext';

export function useDashboardController() {
  const { user, barrio, cuadrante, configuracion } = useAuth();

  return {
    usuario: user ?? undefined,
    barrio: barrio ?? undefined,
    cuadrante: cuadrante ?? undefined,
    config: configuracion ?? undefined,
    loading: false,
  };
}

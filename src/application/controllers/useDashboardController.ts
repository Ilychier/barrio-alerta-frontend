import { Usuario } from '../../domain/entities/usuario';
import { Barrio } from '../../domain/entities/barrio';
import { Cuadrante } from '../../domain/entities/cuadrante';
import { Configuracion } from '../../domain/entities/configuracion';

/**
 * Dependencias que la presentación inyecta al controller.
 * La capa application NO conoce la capa presentation (regla hexagonal).
 */
export interface DashboardControllerDeps {
  user?: Usuario;
  barrio?: Barrio;
  cuadrante?: Cuadrante;
  configuracion?: Configuracion;
}

export function useDashboardController(deps: DashboardControllerDeps) {
  return {
    usuario: deps.user,
    barrio: deps.barrio,
    cuadrante: deps.cuadrante,
    config: deps.configuracion,
    loading: false,
  };
}

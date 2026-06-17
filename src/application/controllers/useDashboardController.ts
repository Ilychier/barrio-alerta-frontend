import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';

export function useDashboardController(currentUserId: number) {
  const container = DependencyContainer.getInstance();
  const obtenerAlertas = container.getObtenerAlertasUseCase();
  const referenciaRepo = container.getReferenciaRepository();
  const configRepo = container.getConfiguracionRepository();

  const { alertas } = obtenerAlertas.execute(currentUserId);
  const usuario = referenciaRepo.getUsuarioById(currentUserId);
  const barrio = usuario ? referenciaRepo.getBarrioById(usuario.barrio_id) : undefined;
  const cuadrante = barrio ? referenciaRepo.getCuadranteById(barrio.cuadrante_id) : undefined;
  const config = configRepo.obtenerPorUsuarioId(currentUserId);

  return { alertas, usuario, barrio, cuadrante, config };
}

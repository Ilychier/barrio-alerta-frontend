/**
 * Test Harness — C6 (cobertura 11/11 use cases).
 * FinalizarEmergenciaUseCase: crea la alerta de "fin de emergencia"
 * con la categoría reservada CATEGORIA_FIN_EMERGENCIA.
 */
import { FinalizarEmergenciaUseCase } from '../FinalizarEmergenciaUseCase';
import { CATEGORIA_FIN_EMERGENCIA } from '../../../domain/constants/categoriasReservadas';
import { InMemoryAlertaRepository } from '../../../infrastructure/adapters/memory/InMemoryAlertaRepository';

describe('FinalizarEmergenciaUseCase (C6)', () => {
  let repo: InMemoryAlertaRepository;
  let useCase: FinalizarEmergenciaUseCase;

  beforeEach(() => {
    repo = new InMemoryAlertaRepository();
    useCase = new FinalizarEmergenciaUseCase(repo);
  });

  it('crea una alerta con la categoría de fin de emergencia', async () => {
    const alerta = await useCase.execute(1);

    expect(alerta.es_sos).toBe(false);
    expect(alerta.categoria_id).toBe(CATEGORIA_FIN_EMERGENCIA);
    expect(alerta.usuario_id).toBe(1);
    expect(alerta.descripcion).toContain('Todo está bien');
  });

  it('persiste la alerta en el repositorio', async () => {
    const before = (await repo.obtenerTodas()).length;
    await useCase.execute(2);
    const after = (await repo.obtenerTodas()).length;

    expect(after).toBe(before + 1);
  });
});

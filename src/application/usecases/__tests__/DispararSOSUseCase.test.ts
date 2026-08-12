/**
 * Test Harness — Fase 0 (snapshot de comportamiento).
 * Congela el comportamiento ACTUAL de los use cases del BC Alertas
 * usando los adaptadores InMemory reales (no mocks).
 */
import { DispararSOSUseCase } from '../DispararSOSUseCase';
import { InMemoryAlertaRepository } from '../../../infrastructure/adapters/memory/InMemoryAlertaRepository';

describe('DispararSOSUseCase (snapshot Fase 0)', () => {
  const repo = new InMemoryAlertaRepository();
  const useCase = new DispararSOSUseCase(repo);

  it('crea una alerta SOS con es_sos=true', async () => {
    const res = await useCase.execute({ usuarioId: 1 });

    expect(res.alerta.es_sos).toBe(true);
    expect(res.alerta.usuario_id).toBe(1);
    expect(res.alerta.categoria_id).toBeUndefined();
    expect(res.alerta.descripcion).toContain('S.O.S');
  });

  it('persiste la alerta en el repositorio', async () => {
    const before = (await repo.obtenerTodas()).length;
    await useCase.execute({ usuarioId: 2 });
    const after = (await repo.obtenerTodas()).length;

    expect(after).toBe(before + 1);
  });
});

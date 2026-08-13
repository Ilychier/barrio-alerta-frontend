/**
 * Test Harness — Fase 0 (snapshot de comportamiento).
 * Congela el comportamiento ACTUAL de ReportarIncidenteUseCase.
 */
import { ReportarIncidenteUseCase } from '../ReportarIncidenteUseCase';
import { InMemoryAlertaRepository } from '../../../infrastructure/adapters/memory/InMemoryAlertaRepository';

describe('ReportarIncidenteUseCase (snapshot Fase 0)', () => {
  const repo = new InMemoryAlertaRepository();
  const useCase = new ReportarIncidenteUseCase(repo);

  it('crea una alerta de formulario con la categoría indicada', async () => {
    const res = await useCase.execute({
      descripcion: 'Robo en la esquina',
      categoriaId: 10,
      usuarioId: 1,
    });

    expect(res.alerta.es_sos).toBe(false);
    expect(res.alerta.categoria_id).toBe(10);
    expect(res.alerta.usuario_id).toBe(1);
    expect(res.alerta.descripcion).toBe('Robo en la esquina');
  });

  it('adjunta evidencia cuando se provee evidenciaUrl', async () => {
    const res = await useCase.execute({
      descripcion: 'Incidente con foto',
      categoriaId: 11,
      usuarioId: 1,
      evidenciaUrl: 'https://example.com/foto.jpg',
    });

    expect(res.evidencia).toBeDefined();
    expect(res.evidencia!.url_archivo).toBe('https://example.com/foto.jpg');
  });

  it('no crea evidencia si no se provee evidenciaUrl', async () => {
    const res = await useCase.execute({
      descripcion: 'Sin foto',
      categoriaId: 10,
      usuarioId: 1,
    });

    expect(res.evidencia).toBeUndefined();
  });
});

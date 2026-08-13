/**
 * Test Harness — C6 (cobertura 11/11 use cases).
 * CrearReporteMascotaUseCase: crea un reporte de mascota autenticado.
 */
import { CrearReporteMascotaUseCase } from '../CrearReporteMascotaUseCase';
import { TipoReporte } from '../../../../domain/mascotas/entities/TipoReporte';
import { InMemoryReporteMascotaRepository } from '../../../../infrastructure/mascotas/adapters/memory/InMemoryReporteMascotaRepository';

describe('CrearReporteMascotaUseCase (C6)', () => {
  let repo: InMemoryReporteMascotaRepository;
  let useCase: CrearReporteMascotaUseCase;

  beforeEach(() => {
    repo = new InMemoryReporteMascotaRepository();
    useCase = new CrearReporteMascotaUseCase(repo);
  });

  const request = {
    tipoReporte: 'LOST' as const,
    tipoMascotaId: 1,
    ciudadId: 1,
    ubicacion: 'Calle 1 #2-3',
    telefono: '+573001234567',
    descripcion: 'Perro criollo, collar rojo',
    usuarioId: 32,
  };

  it('crea el reporte con estado ACTIVE y lo persiste', async () => {
    const reporte = await useCase.execute(request);

    expect(reporte.id).toBeGreaterThan(0);
    expect(reporte.tipoReporte).toBe(TipoReporte.LOST);
    expect(reporte.estado).toBe('ACTIVE');
    expect(reporte.usuarioId).toBe(32);
    expect(reporte.descripcion).toBe('Perro criollo, collar rojo');
  });

  it('persiste el reporte en el feed público', async () => {
    const before = (await repo.listarPublico({}, 0, 100)).totalElements;
    await useCase.execute(request);
    const after = (await repo.listarPublico({}, 0, 100)).totalElements;

    expect(after).toBe(before + 1);
  });

  it('soporta tipoReporte FOUND', async () => {
    const reporte = await useCase.execute({ ...request, tipoReporte: 'FOUND' });

    expect(reporte.tipoReporte).toBe(TipoReporte.FOUND);
  });
});

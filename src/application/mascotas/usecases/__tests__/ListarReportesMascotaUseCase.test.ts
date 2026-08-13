/**
 * Test Harness — C6 (cobertura 11/11 use cases).
 * ListarReportesMascotaUseCase: feed público con filtros y paginación.
 */
import { ListarReportesMascotaUseCase } from '../ListarReportesMascotaUseCase';
import { EstadoReporte } from '../../../../domain/mascotas/entities/EstadoReporte';
import { TipoReporte } from '../../../../domain/mascotas/entities/TipoReporte';
import { InMemoryReporteMascotaRepository } from '../../../../infrastructure/mascotas/adapters/memory/InMemoryReporteMascotaRepository';

describe('ListarReportesMascotaUseCase (C6)', () => {
  let repo: InMemoryReporteMascotaRepository;
  let useCase: ListarReportesMascotaUseCase;

  beforeEach(() => {
    repo = new InMemoryReporteMascotaRepository();
    useCase = new ListarReportesMascotaUseCase(repo);
  });

  it('lista el feed público completo sin filtros', async () => {
    const res = await useCase.execute({ filtros: {}, page: 0 });

    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((r) => r.estado !== 'DELETED')).toBe(true);
  });

  it('filtra por estado RESCUED', async () => {
    const res = await useCase.execute({
      filtros: { estado: EstadoReporte.RESCUED },
      page: 0,
    });

    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((r) => r.estado === EstadoReporte.RESCUED)).toBe(true);
  });

  it('filtra por tipo LOST', async () => {
    const res = await useCase.execute({
      filtros: { tipoReporte: TipoReporte.LOST },
      page: 0,
    });

    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((r) => r.tipoReporte === TipoReporte.LOST)).toBe(true);
  });

  it('pagina correctamente', async () => {
    const res = await useCase.execute({ filtros: {}, page: 0, size: 2 });

    expect(res.items).toHaveLength(2);
    expect(res.totalPages).toBeGreaterThanOrEqual(3);
  });

  it('ordena de más reciente a más antigua', async () => {
    const res = await useCase.execute({ filtros: {}, page: 0, size: 100 });

    const fechas = res.items.map((r) => r.createdAt);
    for (let i = 1; i < fechas.length; i++) {
      expect(fechas[i - 1] >= fechas[i]).toBe(true);
    }
  });
});

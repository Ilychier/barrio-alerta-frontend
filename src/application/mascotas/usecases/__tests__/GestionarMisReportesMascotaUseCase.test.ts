/**
 * Test Harness — C6 (cobertura 11/11 use cases).
 * GestionarMisReportesMascotaUseCase: listar propios, cambiar estado, eliminar.
 */
import { GestionarMisReportesMascotaUseCase } from '../GestionarMisReportesMascotaUseCase';
import { EstadoReporte } from '../../../../domain/mascotas/entities/EstadoReporte';
import { InMemoryReporteMascotaRepository } from '../../../../infrastructure/mascotas/adapters/memory/InMemoryReporteMascotaRepository';

describe('GestionarMisReportesMascotaUseCase (C6)', () => {
  let repo: InMemoryReporteMascotaRepository;
  let useCase: GestionarMisReportesMascotaUseCase;

  beforeEach(() => {
    repo = new InMemoryReporteMascotaRepository();
    useCase = new GestionarMisReportesMascotaUseCase(repo);
  });

  it('lista solo los reportes del usuario', async () => {
    const res = await useCase.listarMios(32, 0, 100);

    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((r) => r.usuarioId === 32)).toBe(true);
  });

  it('devuelve lista vacía para un usuario sin reportes', async () => {
    const res = await useCase.listarMios(9999, 0, 100);

    expect(res.items).toHaveLength(0);
  });

  it('marca un reporte como RESCUED', async () => {
    const actualizado = await useCase.cambiarEstado(1, EstadoReporte.RESCUED);

    expect(actualizado.estado).toBe(EstadoReporte.RESCUED);
    expect(actualizado.id).toBe(1);
  });

  it('elimina un reporte (soft delete → no visible públicamente)', async () => {
    await useCase.eliminar(1);

    // Soft delete: no visible en el feed público
    const reporte = await repo.obtenerPublico(1);
    expect(reporte).toBeUndefined();

    // Comportamiento actual del repo: listarMios conserva el registro con estado DELETED
    const res = await useCase.listarMios(32, 0, 100);
    const eliminado = res.items.find((r) => r.id === 1);
    expect(eliminado).toBeDefined();
    expect(eliminado?.estado).toBe(EstadoReporte.DELETED);
  });

  it('actualiza ubicación y teléfono', async () => {
    const actualizado = await useCase.actualizar({
      id: 1,
      ubicacion: 'Nueva ubicación',
      telefono: '+571234567890',
    });

    expect(actualizado.ubicacion).toBe('Nueva ubicación');
    expect(actualizado.telefono).toBe('+571234567890');
  });
});

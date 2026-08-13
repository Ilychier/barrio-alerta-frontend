/**
 * Test Harness — C6 (cobertura 11/11 use cases).
 * RegistrarReporteRapidoUseCase: registro rápido de emergencia (público).
 */
import { RegistrarReporteRapidoUseCase } from '../RegistrarReporteRapidoUseCase';
import { TipoReporte } from '../../../../domain/mascotas/entities/TipoReporte';
import { InMemoryReporteRapidoRepository } from '../../../../infrastructure/mascotas/adapters/memory/InMemoryReporteRapidoRepository';

describe('RegistrarReporteRapidoUseCase (C6)', () => {
  let useCase: RegistrarReporteRapidoUseCase;

  beforeEach(() => {
    useCase = new RegistrarReporteRapidoUseCase(new InMemoryReporteRapidoRepository());
  });

  const request = {
    phonePersonal: '+573001234567',
    telefonoContacto: '+573001234567',
    tipoReporte: 'LOST' as const,
    tipoMascotaId: 1,
    ciudadId: 1,
    ubicacion: 'Barrio La Soledad, cerca al parque',
    descripcion: 'Perro criollo, collar rojo',
  };

  it('registra el reporte y lo persiste', async () => {
    const result = await useCase.execute(request);

    expect(result.reporte.id).toBeGreaterThan(0);
    expect(result.reporte.tipoReporte).toBe(TipoReporte.LOST);
    expect(result.reporte.estado).toBe('ACTIVE');
    expect(result.reporte.ubicacion).toBe('Barrio La Soledad, cerca al parque');
  });

  it('devuelve token null (el usuario debe loguear manualmente)', async () => {
    const result = await useCase.execute(request);

    expect(result.token).toBeNull();
  });

  it('marca el reporte como nuevo (esNuevo=true)', async () => {
    const result = await useCase.execute(request);

    expect(result.esNuevo).toBe(true);
    expect(result.passwordTemporal).toBe(false);
  });
});

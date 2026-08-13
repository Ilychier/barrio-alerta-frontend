/**
 * Test Harness — C6 (cobertura 11/11 use cases).
 * ObtenerReferenciasMascotaUseCase: carga catálogos y construye maps de lookup.
 */
import { ObtenerReferenciasMascotaUseCase } from '../ObtenerReferenciasMascotaUseCase';
import { InMemoryMascotaReferenciaRepository } from '../../../../infrastructure/mascotas/adapters/memory/InMemoryMascotaReferenciaRepository';

describe('ObtenerReferenciasMascotaUseCase (C6)', () => {
  let useCase: ObtenerReferenciasMascotaUseCase;

  beforeEach(() => {
    useCase = new ObtenerReferenciasMascotaUseCase(new InMemoryMascotaReferenciaRepository());
  });

  it('carga ciudades y tipos de mascota', async () => {
    const refs = await useCase.execute();

    expect(refs.ciudades.length).toBeGreaterThan(0);
    expect(refs.tiposMascota.length).toBeGreaterThan(0);
  });

  it('construye los maps de lookup ciudadId → nombre/departamento', async () => {
    const refs = await useCase.execute();
    const ciudad = refs.ciudades[0];

    expect(refs.ciudadMap.get(ciudad.id)).toBe(ciudad.nombre);
    expect(refs.departamentoMap.get(ciudad.id)).toBe(ciudad.departamento);
  });

  it('construye el map tipoMascotaId → nombre', async () => {
    const refs = await useCase.execute();
    const tipo = refs.tiposMascota[0];

    expect(refs.tipoMascotaMap.get(tipo.id)).toBe(tipo.nombre);
  });
});

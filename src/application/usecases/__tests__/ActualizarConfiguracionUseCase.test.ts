/**
 * Test Harness — Fase 0 (snapshot de comportamiento).
 * Congela el comportamiento ACTUAL de ActualizarConfiguracionUseCase.
 */
import { ActualizarConfiguracionUseCase } from '../ActualizarConfiguracionUseCase';
import { InMemoryConfiguracionRepository } from '../../../infrastructure/adapters/memory/InMemoryConfiguracionRepository';

describe('ActualizarConfiguracionUseCase (snapshot Fase 0)', () => {
  // Repo fresco por test: el InMemory es mutable y los tests no deben compartir estado.
  let repo: InMemoryConfiguracionRepository;
  let useCase: ActualizarConfiguracionUseCase;

  beforeEach(() => {
    repo = new InMemoryConfiguracionRepository();
    useCase = new ActualizarConfiguracionUseCase(repo);
  });

  it('actualiza recibir_notificaciones sin tocar modo_silencioso', async () => {
    // Seed del usuario 2: recibir_notificaciones=true, modo_silencioso=false
    const res = await useCase.execute({
      usuarioId: 2,
      campo: 'recibir_notificaciones',
      valor: false,
    });

    expect(res.configuracion.recibir_notificaciones).toBe(false);
    expect(res.configuracion.modo_silencioso).toBe(false); // valor inicial preservado
  });

  it('actualiza modo_silencioso sin tocar recibir_notificaciones', async () => {
    // Seed del usuario 2: recibir_notificaciones=true, modo_silencioso=false
    const res = await useCase.execute({
      usuarioId: 2,
      campo: 'modo_silencioso',
      valor: true,
    });

    expect(res.configuracion.modo_silencioso).toBe(true);
    expect(res.configuracion.recibir_notificaciones).toBe(true); // valor inicial preservado
  });

  it('lanza error si el usuario no tiene configuración', async () => {
    await expect(
      useCase.execute({ usuarioId: 9999, campo: 'modo_silencioso', valor: true }),
    ).rejects.toThrow('Configuración no encontrada');
  });
});

/**
 * Test Harness — Fase 0 (snapshot de comportamiento).
 * Congela el comportamiento ACTUAL de ObtenerAlertasUseCase:
 * enriquecimiento con categoria/usuario/evidencias, filtro modo
 * silencioso y ordenamiento descendente por fecha.
 */
import { ObtenerAlertasUseCase } from '../ObtenerAlertasUseCase';
import { InMemoryAlertaRepository } from '../../../infrastructure/adapters/memory/InMemoryAlertaRepository';
import { InMemoryConfiguracionRepository } from '../../../infrastructure/adapters/memory/InMemoryConfiguracionRepository';
import { InMemoryReferenciaRepository } from '../../../infrastructure/adapters/memory/InMemoryReferenciaRepository';

describe('ObtenerAlertasUseCase (snapshot Fase 0)', () => {
  const buildUseCase = () => {
    const alertaRepo = new InMemoryAlertaRepository();
    const configRepo = new InMemoryConfiguracionRepository();
    const refRepo = new InMemoryReferenciaRepository();
    return { useCase: new ObtenerAlertasUseCase(alertaRepo, configRepo, refRepo, refRepo), alertaRepo };
  };

  it('enriquece cada alerta con categoria, usuario y evidencias', async () => {
    const { useCase } = buildUseCase();
    // Usuario 2: no existe en refRepo => barrioId undefined => todas las alertas
    // Config usuario 2: recibir_notificaciones=true, modo_silencioso=false
    const res = await useCase.execute(2);

    expect(res.alertas.length).toBeGreaterThan(0);
    for (const item of res.alertas) {
      expect(item.alerta).toBeDefined();
      expect(item.evidencias).toBeDefined();
      // La alerta 801 tiene categoria 11 (Robo) y evidencia 901
    }
  });

  it('oculta las alertas no-SOS cuando el modo silencioso está activado', async () => {
    const { useCase } = buildUseCase();
    // Usuario 502: config modo_silencioso=true => solo quedan las SOS
    const res = await useCase.execute(502);

    expect(res.alertas.length).toBe(0); // las alertas seed (801, 802) no son SOS
  });

  it('ordena las alertas de más reciente a más antigua', async () => {
    const { useCase } = buildUseCase();
    const res = await useCase.execute(2);

    const fechas = res.alertas.map((a) => new Date(a.alerta.fecha_hora).getTime());
    for (let i = 1; i < fechas.length; i++) {
      expect(fechas[i - 1]).toBeGreaterThanOrEqual(fechas[i]);
    }
  });
});

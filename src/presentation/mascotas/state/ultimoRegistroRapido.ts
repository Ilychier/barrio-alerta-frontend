import { ReporteRapidoResult } from '../../../domain/mascotas/ports/IReporteRapidoRepository';

/**
 * Estado compartido del último registro rápido de emergencia.
 * <p>
 * El auto-login del registro rápido pasa por el spinner de loading del
 * layout raíz, que DESMONTA la landing de emergencia (pierde su estado
 * local). Este singleton sobrevive al remount: la landing lo lee al montar
 * y muestra la pantalla de gracias aunque la instancia se haya recreado.
 * <p>
 * KISS: un módulo con get/set/clear, sin AsyncStorage (no necesita persistir
 * entre sesiones — solo sobrevive al remount del mismo render).
 */
let ultimoResultado: ReporteRapidoResult | null = null;

export const ultimoRegistroRapido = {
  set(result: ReporteRapidoResult): void {
    ultimoResultado = result;
  },
  get(): ReporteRapidoResult | null {
    return ultimoResultado;
  },
  clear(): void {
    ultimoResultado = null;
  },
};

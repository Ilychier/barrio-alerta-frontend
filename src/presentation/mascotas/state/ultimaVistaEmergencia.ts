/**
 * Estado compartido de la vista activa del toggle de la landing de emergencia.
 * <p>
 * Al navegar a una sub-ruta (ej: detalle de reporte en /mascotas/12) el layout
 * raíz desmonta la landing de emergencia. Este singleton sobrevive al remount:
 * al volver atrás, la landing restaura la vista ("reportar" | "ver") que el
 * usuario tenía activa.
 * <p>
 * KISS: un módulo con get/set, sin AsyncStorage (no necesita persistir entre
 * sesiones — solo sobrevive al remount del mismo render).
 */
export type VistaEmergencia = "reportar" | "ver";

let ultimaVista: VistaEmergencia = "reportar";

export const ultimaVistaEmergencia = {
  set(vista: VistaEmergencia): void {
    ultimaVista = vista;
  },
  get(): VistaEmergencia {
    return ultimaVista;
  },
};

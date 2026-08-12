const DEFAULT_REPOSITORY = 'memory';

export type RepositoryType = 'memory' | 'api';

export function getRepositoryType(): RepositoryType {
  const apiUrl =
    typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_API_URL : undefined;

  // Si hay una API URL configurada, usamos modo api
  if (apiUrl) {
    return 'api';
  }

  return DEFAULT_REPOSITORY;
}

/**
 * Modo emergencia (runtime, frontend): cuando es true, la app abre en la
 * landing de emergencia de mascotas (formulario rápido + feed público) y la
 * landing de marketing original queda oculta (pero intacta en el código).
 * Se revierte con EXPO_PUBLIC_MODO_EMERGENCIA=false o eliminando la variable.
 */
export function getModoEmergencia(): boolean {
  if (typeof process === 'undefined') return false;
  const raw = process.env.EXPO_PUBLIC_MODO_EMERGENCIA;
  if (raw === undefined || raw === '') return false;
  return raw === 'true' || raw === '1';
}

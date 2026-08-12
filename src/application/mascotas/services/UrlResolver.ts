import { HttpGenericService } from '../../../infrastructure/adapters/api/HttpGenericService';

/**
 * Resuelve la URL pública de una foto.
 * El backend devuelve rutas relativas (/uploads/xxx.jpg) que Nginx sirve en el
 * mismo origen en producción; en dev (frontend 8081, backend 8080) se prefija
 * la base de la API.
 *
 * Nota: toca infraestructura (HttpGenericService) para obtener la baseUrl.
 * Es el punto de entrada del boundary — la presentación consume este servicio
 * de aplicación, no el adapter directamente (regla hexagonal).
 */
export function resolverUrlFoto(fotoUrl: string | null | undefined): string | null {
  if (!fotoUrl) return null;
  if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) return fotoUrl;
  return `${HttpGenericService.getInstance().getBaseUrl()}${fotoUrl}`;
}

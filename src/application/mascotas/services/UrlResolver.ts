/**
 * Resuelve la URL pública de una foto.
 * FUNCIÓN PURA: recibe la baseUrl por parámetro (la provee el container).
 * El backend devuelve rutas relativas (/uploads/xxx.jpg) que Nginx sirve en el
 * mismo origen en producción; en dev se prefija la base de la API.
 */
export function resolverUrlFoto(
  fotoUrl: string | null | undefined,
  baseUrl: string,
): string | null {
  if (!fotoUrl) return null;
  if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) return fotoUrl;
  return `${baseUrl}${fotoUrl}`;
}

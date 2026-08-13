export enum TipoReporte {
  LOST = 'LOST',
  FOUND = 'FOUND',
}

export function tipoReporteFromString(value: string): TipoReporte {
  const normalized = value?.toUpperCase();
  if (normalized === 'LOST') return TipoReporte.LOST;
  if (normalized === 'FOUND') return TipoReporte.FOUND;
  throw new Error(`TipoReporte inválido: ${value}. Valores permitidos: LOST, FOUND`);
}

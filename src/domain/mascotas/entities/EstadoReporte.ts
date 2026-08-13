export enum EstadoReporte {
  ACTIVE = 'ACTIVE',
  RESCUED = 'RESCUED',
  DELETED = 'DELETED',
}

export function estadoReporteFromString(value: string): EstadoReporte {
  const normalized = value?.toUpperCase();
  if (normalized === 'ACTIVE') return EstadoReporte.ACTIVE;
  if (normalized === 'RESCUED') return EstadoReporte.RESCUED;
  if (normalized === 'DELETED') return EstadoReporte.DELETED;
  throw new Error(`EstadoReporte inválido: ${value}. Valores permitidos: ACTIVE, RESCUED, DELETED`);
}

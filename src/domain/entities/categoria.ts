export class Categoria {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly icono_referencia: string,
  ) {}

  /**
   * Regla de dominio: las categorías reservadas (SOS=4, Emergencia finalizada=5)
   * no se ofrecen en el formulario de reporte manual — se crean solo por flujos
   * automáticos (botón SOS / fin de emergencia).
   */
  esReportableEnFormulario(): boolean {
    return this.id !== 4 && this.id !== 5;
  }
}

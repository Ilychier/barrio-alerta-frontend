export class Evidencia {
  constructor(
    public readonly id: number,
    public readonly alerta_id: number,
    public readonly url_archivo: string,
    public readonly tipo_archivo: string,
  ) {}
}

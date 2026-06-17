export class Configuracion {
  constructor(
    public readonly id: number,
    public readonly usuario_id: number,
    public readonly recibir_notificaciones: boolean,
    public readonly modo_silencioso: boolean,
  ) {}
}

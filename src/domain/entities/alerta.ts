export class Alerta {
  constructor(
    public readonly id: number,
    public readonly descripcion: string,
    public readonly es_sos: boolean,
    public readonly fecha_hora: string,
    public readonly usuario_id: number,
    public readonly categoria_id: number,
  ) {
    if (!descripcion && !es_sos) {
      throw new Error("Una alerta requiere descripción o ser una alerta SOS");
    }
  }
}

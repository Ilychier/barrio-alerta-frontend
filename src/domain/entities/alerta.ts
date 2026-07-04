export class Alerta {
  public readonly id: number;
  public readonly descripcion: string;
  public readonly es_sos: boolean;
  public readonly fecha_hora: string;
  public readonly usuario_id: number;
  public readonly categoria_id: number;

  constructor(
    id: number,
    descripcion: string,
    es_sos: boolean,
    fecha_hora: string,
    usuario_id: number,
  );
  constructor(
    id: number,
    descripcion: string,
    es_sos: boolean,
    fecha_hora: string,
    usuario_id: number,
    categoria_id: number,
  );
  constructor(
    id: number,
    descripcion: string,
    es_sos: boolean,
    fecha_hora: string,
    usuario_id: number,
    categoria_id?: number,
  ) {
    this.id = id;
    this.descripcion = descripcion;
    this.es_sos = es_sos;
    this.fecha_hora = fecha_hora;
    this.usuario_id = usuario_id;
    this.categoria_id = categoria_id !== undefined ? categoria_id : (es_sos ? 11 : 10);
  }
}

export class Alerta {
  public readonly id: number;
  public readonly descripcion: string;
  public readonly es_sos: boolean;
  public readonly fecha_hora: string;
  public readonly usuario_id: number;
  public readonly categoria_id?: number;

// 1. El constructor real es privado. Nadie fuera de esta clase puede usar "new Alerta(...)"
  private constructor(
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
    this.categoria_id = categoria_id;
  }

  // 2. CONSTRUCTOR 1: Para el Formulario tradicional.
  // Aquí "categoria_id" es OBLIGATORIO. Si no lo pasan, TypeScript no compila.
  // Además, asumimos que "es_sos" siempre será false en este flujo.
  public static crearDesdeFormulario(
    id: number,
    descripcion: string,
    fecha_hora: string,
    usuario_id: number,
    categoria_id: number,
  ): Alerta {
    return new Alerta(id, descripcion, false, fecha_hora, usuario_id, categoria_id);
  }

  // 3. CONSTRUCTOR 2: Para el Botón de Emergencia (SOS).
  // No recibe "categoria_id" porque no lo necesita, quitando el hardcodeo de la entidad.
  // Forzamos que "es_sos" sea siempre true.
  public static crearEmergenciaSOS(
    id: number,
    descripcion: string,
    fecha_hora: string,
    usuario_id: number,
  ): Alerta {
    return new Alerta(id, descripcion, true, fecha_hora, usuario_id, undefined);
  }
}

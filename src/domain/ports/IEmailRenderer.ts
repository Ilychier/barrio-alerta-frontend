/**
 * Puerta de salida (port) para el renderizado de notificaciones por email.
 * El dominio define el contrato; la infraestructura (plantillas HTML) lo implementa.
 */
export interface EmailData {
  id: number;
  descripcion: string;
  esSos: boolean;
  fechaHora: string;
  emailDestino: string;
  categoriaId?: number;
  /** URL base del backend (sin /api) para servir el logo y assets estáticos */
  baseUrl?: string;
}

export interface IEmailRenderer {
  getSubject(data: EmailData): string;
  render(data: EmailData): string;
}

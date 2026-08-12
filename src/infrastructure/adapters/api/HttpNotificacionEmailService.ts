import { IEmailRenderer } from '../../../domain/ports/IEmailRenderer';
import { HttpGenericService } from '../api/HttpGenericService';
import { EmailRendererAdapter } from '../../email/EmailRendererAdapter';

export interface NotificacionEmailData {
  id: number;
  descripcion: string;
  esSos: boolean;
  fechaHora: string;
  emailDestino: string;
  categoriaId: number;
  baseUrl: string;
}

/**
 * Servicio de infraestructura: notificaciones por email de alertas.
 * Separa la responsabilidad de notificar del CRUD de alertas (SRP).
 */
export class HttpNotificacionEmailService {
  private readonly http = HttpGenericService.getInstance().getClient();
  private readonly emailRenderer: IEmailRenderer = new EmailRendererAdapter();
  private readonly endpoint = '/email/send-email';

  async enviarEmailAlerta(data: NotificacionEmailData): Promise<void> {
    await this.http.post(this.endpoint, {
      toEmail: data.emailDestino,
      subject: this.emailRenderer.getSubject(data),
      body: this.emailRenderer.render(data),
    });
  }
}

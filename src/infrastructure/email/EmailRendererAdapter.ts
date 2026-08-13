import { IEmailRenderer, EmailData } from '../../domain/ports/IEmailRenderer';
import { getSubject, renderAlertaEmail } from './alertaEmailTemplate';

/**
 * Adapter de infraestructura: implementa el puerto IEmailRenderer
 * delegando en las plantillas HTML del módulo email.
 */
export class EmailRendererAdapter implements IEmailRenderer {
  getSubject(data: EmailData): string {
    return getSubject(data);
  }

  render(data: EmailData): string {
    return renderAlertaEmail(data);
  }
}

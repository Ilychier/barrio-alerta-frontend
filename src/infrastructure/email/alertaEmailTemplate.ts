/**
 * Plantillas HTML para correos de alerta.
 * Módulo puro de infraestructura: entrada → string HTML.
 * Sin dependencias externas, testeable aisladamente.
 */

interface AlertaEmailData {
  id: number;
  descripcion: string;
  esSos: boolean;
  fechaHora: string;
  emailDestino: string;
}

const BRAND = "Alerta Barrio";

function formatFecha(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function buildStyles(esSos: boolean): string {
  const primary = esSos ? "#dc2626" : "#0ea5e9";
  const gradientFrom = esSos ? "#dc2626" : "#0ea5e9";
  const gradientTo = esSos ? "#991b1b" : "#0369a1";
  const badgeBg = esSos ? "#fef2f2" : "#f0f9ff";
  const badgeText = esSos ? "#991b1b" : "#0369a1";
  const badgeBorder = esSos ? "#fecaca" : "#bae6fd";

  return `
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 24px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, ${gradientFrom}, ${gradientTo});
      padding: 32px 40px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      line-height: 1;
      margin-bottom: 8px;
    }
    .header-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      color: rgba(255, 255, 255, 0.85);
      font-size: 14px;
      margin: 4px 0 0;
    }
    .badge {
      display: inline-block;
      background-color: ${badgeBg};
      color: ${badgeText};
      border: 1px solid ${badgeBorder};
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 12px;
    }
    .body-content {
      padding: 32px 40px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin: 0 0 6px;
    }
    .description-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0 24px;
    }
    .description-text {
      font-size: 16px;
      line-height: 1.6;
      color: #1e293b;
      margin: 0;
      white-space: pre-wrap;
    }
    .meta-grid {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .meta-item {
      flex: 1;
      min-width: 120px;
    }
    .meta-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      margin: 0 0 2px;
    }
    .meta-value {
      font-size: 14px;
      font-weight: 500;
      color: #334155;
      margin: 0;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 24px 0;
    }
    .footer {
      padding: 0 40px 32px;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      color: #94a3b8;
      margin: 0 0 4px;
    }
    .footer-brand {
      font-size: 13px;
      font-weight: 600;
      color: ${primary};
      margin: 0;
    }
    @media only screen and (max-width: 600px) {
      .header { padding: 24px 20px; }
      .body-content { padding: 24px 20px; }
      .footer { padding: 0 20px 24px; }
      .meta-grid { flex-direction: column; gap: 12px; }
    }
  `;
}

function buildHeader(esSos: boolean): string {
  const icon = esSos ? "🚨" : "📋";
  const badgeText = esSos ? "Emergencia S.O.S" : "Alerta Reportada";
  const subtitle = esSos
    ? "Se ha activado un botón de emergencia"
    : "Se ha reportado un nuevo incidente";

  return `
    <div class="header">
      <div class="header-icon">${icon}</div>
      <h1 class="header-title">${BRAND}</h1>
      <p class="header-subtitle">${subtitle}</p>
      <span class="badge">${badgeText}</span>
    </div>
  `;
}

function buildBody(descripcion: string, fechaHora: string, id: number): string {
  return `
    <div class="body-content">
      <p class="section-label">Descripción</p>
      <div class="description-card">
        <p class="description-text">${descripcion}</p>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <p class="meta-label">Fecha y hora</p>
          <p class="meta-value">${formatFecha(fechaHora)}</p>
        </div>
        <div class="meta-item">
          <p class="meta-label">ID de alerta</p>
          <p class="meta-value">#${id}</p>
        </div>
      </div>
    </div>
  `;
}

function buildFooter(esSos: boolean): string {
  const primary = esSos ? "#dc2626" : "#0ea5e9";
  return `
    <div class="footer">
      <div class="divider"></div>
      <p class="footer-text">Este es un mensaje automático del sistema de alertas.</p>
      <p class="footer-text">No respondas a este correo.</p>
      <p class="footer-brand" style="color:${primary}">${BRAND}</p>
    </div>
  `;
}

/**
 * Renderiza la plantilla HTML completa para un correo de alerta.
 * @returns string HTML listo para enviar como `htmlContent` a Brevo.
 */
export function renderAlertaEmail(data: AlertaEmailData): string {
  const { esSos, descripcion, fechaHora, id } = data;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND} — ${esSos ? "S.O.S" : "Alerta"}</title>
  <style>${buildStyles(esSos)}</style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f1f5f9; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr><td>${buildHeader(esSos)}</td></tr>
          <tr><td>${buildBody(descripcion, fechaHora, id)}</td></tr>
          <tr><td>${buildFooter(esSos)}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

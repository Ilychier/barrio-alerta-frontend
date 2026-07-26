/**
 * Plantillas HTML para correos de alerta.
 * Módulo puro de infraestructura: entrada → string HTML.
 *
 * Tres tipos de correo:
 *  - 'sos'        → S.O.S activado (urgencia, rojo #C2573F)
 *  - 'reporte'    → Incidente reportado (informativo, verde #2A768A)
 *  - 'finalizada' → Emergencia finalizada (tranquilizadora, verde #2A768A)
 */

type EmailTipo = 'sos' | 'reporte' | 'finalizada';

interface AlertaEmailData {
  id: number;
  descripcion: string;
  esSos: boolean;
  fechaHora: string;
  emailDestino: string;
  categoriaId?: number;
  /** URL base del backend (sin /api) para servir el logo y assets estáticos */
  baseUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// Colores de marca (lightTheme / darkTheme)
// ─────────────────────────────────────────────────────────────

const BRAND = 'Alerta Barrio';
const COLORS = {
  red: '#C2573F',
  redDark: '#9C4737',
  redBg: 'rgba(194, 87, 63, 0.10)',
  redBorder: 'rgba(194, 87, 63, 0.30)',
  green: '#2A768A',
  greenDark: '#1E5A6B',
  greenBg: 'rgba(42, 118, 138, 0.10)',
  greenBorder: 'rgba(42, 118, 138, 0.25)',
  bg: '#F5F7F8',
  surface: '#FFFFFF',
  surfaceLight: '#EDF1F2',
  surfaceDark: '#E4E8EA',
  surfaceBorder: '#CCD4D6',
  border: '#E1E6E8',
  textPrimary: '#171C1E',
  textSecondary: '#414B4E',
  textTertiary: '#6B787C',
  textMuted: '#8E9C9F',
  white: '#FFFFFF',
};

// ─────────────────────────────────────────────────────────────
// Resolución del tipo de correo
// ─────────────────────────────────────────────────────────────

function resolveTipo(data: AlertaEmailData): EmailTipo {
  if (data.categoriaId === 5) return 'finalizada';
  if (data.esSos) return 'sos';
  return 'reporte';
}

function formatFecha(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─────────────────────────────────────────────────────────────
// Config por tipo
// ─────────────────────────────────────────────────────────────

interface TipoConfig {
  primary: string;
  primaryDark: string;
  primaryBg: string;
  primaryBorder: string;
  icon: string;
  badgeLabel: string;
  headerTitle: string;
  headerSubtitle: string;
  subject: string;
  sectionLabel: string;
  statusBanner: string;
}

function getTipoConfig(tipo: EmailTipo): TipoConfig {
  switch (tipo) {
    case 'sos':
      return {
        primary: COLORS.red,
        primaryDark: COLORS.redDark,
        primaryBg: COLORS.redBg,
        primaryBorder: COLORS.redBorder,
        icon: '🚨',
        badgeLabel: 'Emergencia S.O.S',
        headerTitle: 'Alerta S.O.S Activada',
        headerSubtitle: 'Se ha activado un botón de emergencia en tu comunidad',
        subject: '🚨 Alerta S.O.S Activada — Se requiere atención inmediata',
        sectionLabel: 'Detalle de la emergencia',
        statusBanner: '⚠ Se requiere atención inmediata del cuadrante de emergencia',
      };
    case 'finalizada':
      return {
        primary: COLORS.green,
        primaryDark: COLORS.greenDark,
        primaryBg: COLORS.greenBg,
        primaryBorder: COLORS.greenBorder,
        icon: '✓',
        badgeLabel: 'Emergencia Finalizada',
        headerTitle: 'Situación Controlada',
        headerSubtitle: 'La emergencia ha sido finalizada por el vecino',
        subject: '✓ Emergencia finalizada — Todo está bien en tu comunidad',
        sectionLabel: 'Mensaje del vecino',
        statusBanner: 'El vecino ha confirmado que la situación está bajo control',
      };
    case 'reporte':
    default:
      return {
        primary: COLORS.green,
        primaryDark: COLORS.greenDark,
        primaryBg: COLORS.greenBg,
        primaryBorder: COLORS.greenBorder,
        icon: '📋',
        badgeLabel: 'Incidente Reportado',
        headerTitle: 'Nuevo Reporte Vecinal',
        headerSubtitle: 'Un vecino ha reportado un incidente en el sector',
        subject: '📋 Nuevo incidente reportado en tu barrio',
        sectionLabel: 'Descripción del incidente',
        statusBanner: '',
      };
  }
}

// ─────────────────────────────────────────────────────────────
// SVG decorativo de fondo (estilo mesh glows + escudo)
// ─────────────────────────────────────────────────────────────

function buildDecorativeSvg(primary: string): string {
  return `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;pointer-events:none;">
      <defs>
        <radialGradient id="g1" cx="90%" cy="10%" r="45%">
          <stop offset="0%" stop-color="${primary}" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g2" cx="10%" cy="90%" r="50%">
          <stop offset="0%" stop-color="${primary}" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="600" height="400" fill="url(#g1)"/>
      <rect width="600" height="400" fill="url(#g2)"/>
      <g transform="translate(530,50) rotate(-10) scale(0.7)" fill="none" stroke="${primary}" stroke-width="1.5" opacity="0.15">
        <path d="M0,-24 L18,-16 L18,2 C18,14 0,24 0,24 C0,24 -18,14 -18,2 L-18,-16 Z"/>
        <path d="M-6,-2 L-2,2 L6,-6" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="translate(70,340)" fill="none" stroke="${primary}" stroke-width="0.8" opacity="0.12">
        <circle cx="0" cy="0" r="24" stroke-dasharray="3,3"/>
        <circle cx="0" cy="0" r="14"/>
        <path d="M-30,0 H30 M0,-30 V30"/>
      </g>
    </svg>
  `;
}

// ─────────────────────────────────────────────────────────────
// Build HTML parts
// ─────────────────────────────────────────────────────────────

function buildStyles(cfg: TipoConfig): string {
  return `
    body {
      margin: 0;
      padding: 0;
      background-color: ${COLORS.bg};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: ${COLORS.bg};
      padding: 40px 0;
    }
    .email-container {
      max-width: 560px;
      margin: 0 auto;
      background-color: ${COLORS.surface};
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.08);
      position: relative;
    }
    .header {
      background: linear-gradient(135deg, ${cfg.primary}, ${cfg.primaryDark});
      padding: 36px 40px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header-logo {
      margin-bottom: 20px;
    }
    .header-logo img {
      width: 160px;
      height: auto;
      display: inline-block;
    }
    .header-icon {
      font-size: 44px;
      line-height: 1;
      margin-bottom: 8px;
    }
    .header-title {
      color: ${COLORS.white};
      font-size: 22px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .header-subtitle {
      color: rgba(255,255,255,0.80);
      font-size: 14px;
      margin: 6px 0 0;
      font-weight: 400;
      line-height: 20px;
    }
    .badge {
      display: inline-block;
      background-color: rgba(255,255,255,0.15);
      color: ${COLORS.white};
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 16px;
    }
    .body-content {
      padding: 32px 40px;
      position: relative;
    }
    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: ${COLORS.textMuted};
      margin: 0 0 8px;
    }
    .description-card {
      background-color: ${COLORS.surfaceLight};
      border: 1px solid ${COLORS.border};
      border-radius: 14px;
      padding: 20px;
      margin: 8px 0 24px;
    }
    .description-text {
      font-size: 15px;
      line-height: 1.6;
      color: ${COLORS.textPrimary};
      margin: 0;
      white-space: pre-wrap;
    }
    .meta-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .meta-item {
      flex: 1;
      min-width: 120px;
      background-color: ${COLORS.surfaceLight};
      border-radius: 10px;
      padding: 12px 14px;
    }
    .meta-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${COLORS.textMuted};
      margin: 0 0 2px;
    }
    .meta-value {
      font-size: 13px;
      font-weight: 600;
      color: ${COLORS.textSecondary};
      margin: 0;
    }
    .status-banner {
      margin-top: 20px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      line-height: 18px;
    }
    .status-sos {
      background-color: ${COLORS.redBg};
      color: ${COLORS.redDark};
      border: 1px solid ${COLORS.redBorder};
    }
    .status-ok {
      background-color: ${COLORS.greenBg};
      color: ${COLORS.greenDark};
      border: 1px solid ${COLORS.greenBorder};
    }
    .divider {
      height: 1px;
      background-color: ${COLORS.border};
      margin: 24px 0;
    }
    .footer {
      padding: 0 40px 32px;
      text-align: center;
    }
    .footer-logo {
      margin-bottom: 12px;
    }
    .footer-logo img {
      width: 120px;
      height: auto;
      display: inline-block;
      opacity: 0.6;
    }
    .footer-text {
      font-size: 12px;
      color: ${COLORS.textMuted};
      margin: 0 0 2px;
      line-height: 18px;
    }
    .footer-brand {
      font-size: 13px;
      font-weight: 700;
      color: ${cfg.primary};
      margin: 8px 0 0;
      letter-spacing: 0.3px;
    }
    @media only screen and (max-width: 600px) {
      .header { padding: 28px 20px; }
      .body-content { padding: 24px 20px; }
      .footer { padding: 0 20px 24px; }
      .meta-grid { flex-direction: column; }
      .header-logo img { width: 140px; }
    }
  `;
}

function buildHeader(cfg: TipoConfig, baseUrl?: string): string {
  const logoHtml = baseUrl
    ? `<div class="header-logo"><img src="${baseUrl}/images/horizontal-logo.png" alt="${BRAND}" /></div>`
    : '';

  return `
    <div class="header">
      ${buildDecorativeSvg(cfg.primary)}
      ${logoHtml}
      <div class="header-icon">${cfg.icon}</div>
      <h1 class="header-title">${cfg.headerTitle}</h1>
      <p class="header-subtitle">${cfg.headerSubtitle}</p>
      <span class="badge">${cfg.badgeLabel}</span>
    </div>
  `;
}

function buildBody(cfg: TipoConfig, descripcion: string, fechaHora: string, id: number, tipo: EmailTipo): string {
  const statusBanner = cfg.statusBanner
    ? `<div class="status-banner ${tipo === 'sos' ? 'status-sos' : 'status-ok'}">${cfg.statusBanner}</div>`
    : '';

  return `
    <div class="body-content">
      <p class="section-label">${cfg.sectionLabel}</p>
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

      ${statusBanner}
    </div>
  `;
}

function buildFooter(cfg: TipoConfig, baseUrl?: string): string {
  const logoHtml = baseUrl
    ? `<div class="footer-logo"><img src="${baseUrl}/images/horizontal-logo.png" alt="${BRAND}" /></div>`
    : '';

  return `
    <div class="footer">
      <div class="divider"></div>
      ${logoHtml}
      <p class="footer-text">Este es un mensaje automático del sistema de alertas comunitarias.</p>
      <p class="footer-text">No respondas a este correo — para emergencias llama al 123.</p>
      <p class="footer-brand" style="color:${cfg.primary}">${BRAND}</p>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────

/**
 * Resuelve el subject del correo según el tipo de alerta.
 */
export function getSubject(data: AlertaEmailData): string {
  return getTipoConfig(resolveTipo(data)).subject;
}

/**
 * Renderiza la plantilla HTML completa para un correo de alerta.
 * @returns string HTML listo para enviar como `htmlContent` a Brevo.
 */
export function renderAlertaEmail(data: AlertaEmailData): string {
  const tipo = resolveTipo(data);
  const cfg = getTipoConfig(tipo);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND} — ${cfg.headerTitle}</title>
  <style>${buildStyles(cfg)}</style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${COLORS.bg}; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px; background-color:${COLORS.surface}; border-radius:24px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.08);">
          <tr><td>${buildHeader(cfg, data.baseUrl)}</td></tr>
          <tr><td>${buildBody(cfg, data.descripcion, data.fechaHora, data.id, tipo)}</td></tr>
          <tr><td>${buildFooter(cfg, data.baseUrl)}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Icon from "../components/atomic/Icon";
import { SVGBackground } from "../components/layout/SVGBackground";
import { AppTheme, useAppTheme } from "../theme/ThemeContext";

interface LandingScreenProps {
  onLoginPress: () => void;
  onRegisterPress: () => void;
}

// ─────────────────────────────────────────────────────────────
// Content data
// ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "ShieldAlert",
    title: "Alertas en tiempo real",
    description:
      "Reporta incidentes y activa S.O.S. con un solo toque. La comunidad se entera al instante.",
  },
  {
    icon: "Mail",
    title: "Notificación al cuadrante",
    description:
      "Cada alerta se envía automáticamente al correo del cuadrante de emergencia de tu barrio.",
  },
  {
    icon: "MapPin",
    title: "Organización por barrios",
    description:
      "El sistema se adapta a la estructura real de tu comunidad: barrios, cuadrantes y vecinos.",
  },
  {
    icon: "Lock",
    title: "Privacidad por diseño",
    description:
      "Sin perfiles comerciales, sin venta de datos, sin publicidad. Tu información es tuya.",
  },
];

const PRINCIPLES = [
  {
    icon: "Heart",
    title: "Bienestar antes que lucro",
    description:
      "Cada línea de código está al servicio de la comunidad. No extraemos datos, no vendemos atención, no lucramos con el miedo.",
  },
  {
    icon: "Users",
    title: "Justicia distributiva",
    description:
      "La seguridad no es un privilegio. La plataforma funciona en cualquier dispositivo de bajo costo, sin hardware especializado.",
  },
  {
    icon: "Leaf",
    title: "Límites ecológicos",
    description:
      "Arquitectura ligera, mapeos en compilación, sin reflexión en runtime. Menos CPU, menos memoria, menos energía.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Regístrate en tu barrio",
    description:
      "Crea tu cuenta y selecciona el barrio al que perteneces. En segundos formas parte de la red.",
  },
  {
    number: "02",
    title: "Reporta o activa S.O.S.",
    description:
      "Desde el formulario reportas incidentes con categoría. El botón S.O.S. activa emergencias inmediatas.",
  },
  {
    number: "03",
    title: "La comunidad responde",
    description:
      "Tu cuadrante de emergencia recibe el correo automático. Los vecinos ven la alerta en el dashboard.",
  },
];

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function LandingScreen({
  onLoginPress,
  onRegisterPress,
}: LandingScreenProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;
  const styles = getStyles(theme, isDesktop, isMobile);

  return (
    <SVGBackground>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── HERO ─────────────────────────────────────────── */}
        <View style={styles.heroOuter}>
          <View style={styles.contentWrapper}>
            <View style={styles.heroInner}>
              {/* Left column */}
              <View style={styles.heroLeft}>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.heroLogo}
                  resizeMode="contain"
                />

                <Text style={styles.heroTitle}>
                  Cuidar al barrio,{"\n"}es cuidar a todos
                </Text>

                <Text style={styles.heroSubtitle}>
                  Una red de seguridad comunitaria que prioriza la solidaridad
                  vecinal sobre la lógica comercial. Sin extracción de datos,
                  sin lucro, solo comunidad.
                </Text>

                <View style={styles.heroCTAs}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onRegisterPress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>
                      Unirme a la red
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onLoginPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Ya tengo cuenta
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Right column — mockup */}
              {isDesktop && (
                <View style={styles.heroRight}>
                  <View style={styles.mockupContainer}>
                    <View style={styles.mockupHeader}>
                      <View style={styles.mockupDot} />
                      <View
                        style={[
                          styles.mockupDot,
                          { backgroundColor: theme.colors.green },
                        ]}
                      />
                      <View
                        style={[
                          styles.mockupDot,
                          { backgroundColor: theme.colors.red },
                        ]}
                      />
                    </View>
                    <View style={styles.mockupBody}>
                      <View style={styles.mockupRow}>
                        <View
                          style={[
                            styles.mockupBadge,
                            {
                              backgroundColor: theme.colors.redBg,
                              borderColor: theme.colors.redBorder,
                            },
                          ]}
                        >
                          <Icon
                            name="ShieldAlert"
                            size={14}
                            color={theme.colors.red}
                          />
                          <Text
                            style={[
                              styles.mockupBadgeText,
                              { color: theme.colors.red },
                            ]}
                          >
                            S.O.S Activa
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.mockupBadge,
                            {
                              backgroundColor: theme.colors.greenBg,
                              borderColor: theme.colors.greenBorder,
                            },
                          ]}
                        >
                          <Icon
                            name="MapPin"
                            size={14}
                            color={theme.colors.green}
                          />
                          <Text
                            style={[
                              styles.mockupBadgeText,
                              { color: theme.colors.green },
                            ]}
                          >
                            Barrio Centro
                          </Text>
                        </View>
                      </View>
                      <View style={styles.mockupDivider} />
                      <View style={styles.mockupAlertRow}>
                        <View
                          style={[
                            styles.mockupAlertDot,
                            { backgroundColor: theme.colors.red },
                          ]}
                        />
                        <View style={styles.mockupAlertContent}>
                          <Text style={styles.mockupAlertTitle}>
                            Robo en vía pública
                          </Text>
                          <Text style={styles.mockupAlertMeta}>
                            Hace 3 min · Cra 7 # 24-35
                          </Text>
                        </View>
                      </View>
                      <View style={styles.mockupAlertRow}>
                        <View
                          style={[
                            styles.mockupAlertDot,
                            { backgroundColor: theme.colors.green },
                          ]}
                        />
                        <View style={styles.mockupAlertContent}>
                          <Text style={styles.mockupAlertTitle}>
                            Vehículo sospechoso
                          </Text>
                          <Text style={styles.mockupAlertMeta}>
                            Hace 12 min · Calle 5 # 10-20
                          </Text>
                        </View>
                      </View>
                      <View style={styles.mockupAlertRow}>
                        <View
                          style={[
                            styles.mockupAlertDot,
                            { backgroundColor: theme.colors.purple },
                          ]}
                        />
                        <View style={styles.mockupAlertContent}>
                          <Text style={styles.mockupAlertTitle}>
                            Luz extraña en parque
                          </Text>
                          <Text style={styles.mockupAlertMeta}>
                            Hace 28 min · Parque Central
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── MISSION ──────────────────────────────────────── */}
        <View style={styles.missionOuter}>
          <View style={styles.contentWrapper}>
            <View style={styles.missionInner}>
              <Text style={styles.sectionTag}>Nuestra misión</Text>
              <Text style={styles.sectionTitle}>
                Seguridad ciudadana como derecho, no producto
              </Text>
              <Text style={styles.sectionBody}>
                En comunidades donde la respuesta institucional es limitada, la
                solidaridad vecinal es el recurso más valioso. Barrio Alerta
                nace para fortalecer esa red de apoyo: una herramienta
                accesible, eficiente y ética que permite a cualquier persona
                reportar incidentes, activar alertas de emergencia y coordinar
                la respuesta comunitaria en tiempo real.
              </Text>
            </View>
          </View>
        </View>

        {/* ── HOW IT WORKS ────────────────────────────────── */}
        <View style={styles.stepsOuter}>
          <View style={styles.contentWrapper}>
            <Text style={styles.sectionTag}>Cómo funciona</Text>
            <Text style={styles.sectionTitle}>
              Tres pasos para proteger tu comunidad
            </Text>

            <View style={styles.stepsRow}>
              {STEPS.map((step, idx) => (
                <View key={step.number} style={styles.stepCard}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumber}>{step.number}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── FEATURES ────────────────────────────────────── */}
        <View style={styles.featuresOuter}>
          <View style={styles.contentWrapper}>
            <Text style={styles.sectionTag}>La herramienta</Text>
            <Text style={styles.sectionTitle}>
              Diseñada para la comunidad real
            </Text>

            <View style={styles.featuresGrid}>
              {FEATURES.map((feature) => (
                <View key={feature.title} style={styles.featureCard}>
                  <View style={styles.featureIconCircle}>
                    <Icon
                      name={feature.icon as any}
                      size={28}
                      color={theme.colors.green}
                    />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── PRINCIPLES ───────────────────────────────────── */}
        <View style={styles.principlesOuter}>
          <View style={styles.contentWrapper}>
            <Text style={styles.sectionTag}>Compromiso socioambiental</Text>
            <Text style={styles.sectionTitle}>
              No es solo software, es ética aplicada
            </Text>

            <View style={styles.principlesContainer}>
              {PRINCIPLES.map((principle) => (
                <View key={principle.title} style={styles.principleCard}>
                  <View style={styles.principleIconCircle}>
                    <Icon
                      name={principle.icon as any}
                      size={26}
                      color={theme.colors.red}
                    />
                  </View>
                  <View style={styles.principleTextContainer}>
                    <Text style={styles.principleTitle}>{principle.title}</Text>
                    <Text style={styles.principleDescription}>
                      {principle.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── CTA FINAL ────────────────────────────────────── */}
        <View style={styles.ctaOuter}>
          <View style={styles.contentWrapper}>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>¿Lista tu comunidad?</Text>
              <Text style={styles.ctaBody}>
                Únete hoy. Sin costo, sin datos vendidos, sin condiciones. Solo
                vecinos cuidando vecinos.
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={onRegisterPress}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaButtonText}>Comenzar ahora</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ctaLinkButton}
                onPress={onLoginPress}
                activeOpacity={0.7}
              >
                <Text style={styles.ctaLinkText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <View style={styles.footerOuter}>
          <View style={styles.contentWrapper}>
            <View style={styles.footerInner}>
              <View style={styles.footerLeft}>
                <Image
                  source={require("@/assets/images/horizontal-logo.png")}
                  style={styles.footerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.footerTagline}>
                  Software comunitario de código abierto
                </Text>
              </View>
              <View style={styles.footerRight}>
                <Text style={styles.footerLink}>Privacidad</Text>
                <Text style={styles.footerLink}>Licencia</Text>
                <Text style={styles.footerLink}>Contacto</Text>
              </View>
            </View>
            <View style={styles.footerDivider} />
            <Text style={styles.footerCopy}>
              Hecho con ética y eficiencia · Barrio Alerta{" "}
              {new Date().getFullYear()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SVGBackground>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const getStyles = (theme: AppTheme, isDesktop: boolean, isMobile: boolean) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: 1100,
      alignSelf: "center",
      paddingHorizontal: isMobile ? 24 : 32,
    },

    // ── HERO ──────────────────────────────────────────────
    heroOuter: {
      //transparent background to allow SVG to show through
      backgroundColor: theme.colors.surface + "00",
      paddingTop: isDesktop ? 80 : 48,
      paddingBottom: isDesktop ? 120 : 60,
    },
    heroInner: {
      flexDirection: isDesktop ? "row" : "column",
      alignItems: isDesktop ? "center" : "center",
      gap: isDesktop ? 64 : 0,
    },
    heroLeft: {
      flex: isDesktop ? 1 : undefined,
      alignItems: isMobile ? "center" : "flex-start",
      maxWidth: isDesktop ? 520 : undefined,
    },
    heroRight: {
      flex: 1,
      alignItems: "center",
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.greenBg,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginBottom: 24,
    },
    badgeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.green,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.green,
      letterSpacing: 0.3,
    },
    heroLogo: {
      width: isDesktop ? 100 : 120,
      height: isDesktop ? 120 : 120,
      marginBottom: 24,
    },
    heroTitle: {
      fontSize: isDesktop ? 64 : 36,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      lineHeight: isDesktop ? 72 : 44,
      letterSpacing: -1.5,
      textAlign: isMobile ? "center" : "left",
    },
    heroSubtitle: {
      fontSize: isDesktop ? 18 : 15,
      color: theme.colors.textTertiary,
      lineHeight: isDesktop ? 30 : 24,
      marginTop: 20,
      maxWidth: 480,
      textAlign: isMobile ? "center" : "left",
    },
    heroCTAs: {
      flexDirection: "row",
      gap: 12,
      marginTop: 36,
      flexWrap: "wrap",
      justifyContent: isMobile ? "center" : "flex-start",
    },
    primaryButton: {
      backgroundColor: theme.colors.red,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 16,
      shadowColor: theme.colors.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8,
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontWeight: "700",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    secondaryButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceBorder,
      backgroundColor: theme.colors.surfaceLight,
    },
    secondaryButtonText: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
      fontSize: 16,
    },

    // ── Mockup ───────────────────────────────────────────
    mockupContainer: {
      width: 380,
      backgroundColor: theme.colors.surfaceDark,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.15,
      shadowRadius: 48,
      elevation: 12,
    },
    mockupHeader: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    mockupDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.textDim,
    },
    mockupBody: {
      padding: 20,
      gap: 16,
    },
    mockupRow: {
      flexDirection: "row",
      gap: 8,
    },
    mockupBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },
    mockupBadgeText: {
      fontSize: 11,
      fontWeight: "700",
    },
    mockupDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    mockupAlertRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    mockupAlertDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 4,
    },
    mockupAlertContent: {
      flex: 1,
    },
    mockupAlertTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    mockupAlertMeta: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },

    // ── METRICS ───────────────────────────────────────────
    metricsOuter: {
      backgroundColor: theme.colors.surfaceDark,
      paddingVertical: 48,
    },
    metricsRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: isMobile ? 16 : 48,
    },
    metricItem: {
      alignItems: "center",
      gap: 4,
    },
    metricNumber: {
      fontSize: isDesktop ? 40 : 32,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      letterSpacing: -1,
    },
    metricLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textTertiary,
    },
    metricDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.border,
    },

    // ── MISSION ──────────────────────────────────────────
    missionOuter: {
      backgroundColor: theme.colors.surface,
      paddingVertical: isDesktop ? 100 : 60,
    },
    missionInner: {
      alignItems: "center",
      maxWidth: 800,
      alignSelf: "center",
    },

    // ── SEPARATOR ─────────────────────────────────────────
    separatorOuter: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 12,
      paddingHorizontal: isMobile ? 24 : 32,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      maxWidth: 1100,
      alignSelf: "center",
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    separatorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.textDim,
    },

    // ── STEPS ─────────────────────────────────────────────
    stepsOuter: {
      backgroundColor: theme.colors.surface + "00",
      paddingVertical: isDesktop ? 100 : 60,
    },
    stepsRow: {
      flexDirection: isDesktop ? "row" : "column",
      gap: isDesktop ? 24 : 16,
      marginTop: 32,
    },
    stepCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 20,
      padding: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      position: "relative",
    },
    stepNumberCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.greenBg,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    stepNumber: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.green,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    stepDescription: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      lineHeight: 22,
    },
    stepArrow: {
      position: "absolute",
      right: -16,
      top: "50%",
      marginTop: -10,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },

    // ── FEATURES ──────────────────────────────────────────
    featuresOuter: {
      backgroundColor: theme.colors.surfaceDark,
      paddingVertical: isDesktop ? 100 : 60,
    },
    featuresGrid: {
      flexDirection: isDesktop ? "row" : "column",
      flexWrap: "wrap",
      gap: 20,
      marginTop: 32,
    },
    featureCard: {
      width: isDesktop ? "48%" : "100%",
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 210,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    featureIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.greenBg,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 18,
    },
    featureTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    featureDescription: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      lineHeight: 20,
    },

    // ── PRINCIPLES ────────────────────────────────────────
    principlesOuter: {
      backgroundColor: theme.colors.surface + "00",
      paddingVertical: isDesktop ? 100 : 60,
    },
    principlesContainer: {
      gap: 20,
      marginTop: 32,
    },
    principleCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 20,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 20,
      padding: 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      maxWidth: 800,
      alignSelf: "center",
    },
    principleIconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.redBg,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    principleTextContainer: {
      flex: 1,
      gap: 6,
    },
    principleTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    principleDescription: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      lineHeight: 22,
    },

    // ── IMPACT ────────────────────────────────────────────
    impactOuter: {
      backgroundColor: theme.colors.surfaceDark,
      paddingVertical: isDesktop ? 100 : 60,
    },
    impactCard: {
      backgroundColor: theme.colors.surface + "00",
      borderRadius: 24,
      padding: isDesktop ? 40 : 28,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
    },
    impactRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 20,
    },
    impactIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.greenBg,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    impactTextContainer: {
      flex: 1,
    },
    impactLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    impactDetail: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      lineHeight: 22,
    },
    impactDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 24,
    },

    // ── CTA ───────────────────────────────────────────────
    ctaOuter: {
      backgroundColor: theme.colors.surface + "00",
      paddingVertical: isDesktop ? 120 : 80,
    },
    ctaCard: {
      backgroundColor: theme.colors.greenBg,
      borderRadius: 32,
      padding: isDesktop ? 60 : 40,
      borderWidth: 1.5,
      borderColor: theme.colors.greenBorder,
      alignItems: "center",
    },
    ctaTitle: {
      fontSize: isDesktop ? 40 : 28,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      marginBottom: 12,
      textAlign: "center",
    },
    ctaBody: {
      fontSize: isDesktop ? 18 : 15,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: isDesktop ? 28 : 22,
      marginBottom: 32,
      maxWidth: 520,
    },
    ctaButton: {
      backgroundColor: theme.colors.red,
      paddingVertical: 18,
      paddingHorizontal: 48,
      borderRadius: 16,
      shadowColor: theme.colors.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8,
    },
    ctaButtonText: {
      color: theme.colors.white,
      fontWeight: "700",
      fontSize: 18,
      letterSpacing: 0.5,
    },
    ctaLinkButton: {
      marginTop: 20,
      paddingVertical: 8,
    },
    ctaLinkText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.green,
    },

    // ── FOOTER ────────────────────────────────────────────
    footerOuter: {
      backgroundColor: theme.colors.surfaceDark,
      paddingVertical: isDesktop ? 60 : 40,
    },
    footerInner: {
      flexDirection: isDesktop ? "row" : "column",
      justifyContent: "space-between",
      alignItems: isDesktop ? "center" : "center",
      gap: isMobile ? 24 : 16,
    },
    footerLeft: {
      alignItems: isMobile ? "center" : "flex-start",
    },
    footerLogo: {
      width: 160,
      height: 36,
    },
    footerTagline: {
      fontSize: 13,
      color: theme.colors.textMuted,
      marginTop: 6,
    },
    footerRight: {
      flexDirection: "row",
      gap: 24,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    footerLink: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textTertiary,
    },
    footerDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 24,
    },
    footerCopy: {
      fontSize: 12,
      color: theme.colors.textDim,
      textAlign: "center",
    },

    // ── Shared section elements ───────────────────────────
    sectionTag: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      color: theme.colors.green,
      marginBottom: 8,
      textAlign: isMobile ? "center" : "left",
    },
    sectionTitle: {
      fontSize: isDesktop ? 40 : 28,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      lineHeight: isDesktop ? 48 : 36,
      letterSpacing: -0.5,
      marginBottom: 20,
      textAlign: isMobile ? "center" : "left",
    },
    sectionBody: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 28,
      textAlign: isMobile ? "center" : "left",
    },
  });

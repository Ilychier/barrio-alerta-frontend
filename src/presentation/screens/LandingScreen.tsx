import { useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
// Datos de contenido — separados de la presentación (SRP)
// ─────────────────────────────────────────────────────────────

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
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

interface PrincipleItem {
  icon: string;
  title: string;
  description: string;
}

const PRINCIPLES: PrincipleItem[] = [
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

interface StepItem {
  number: string;
  title: string;
  description: string;
}

const STEPS: StepItem[] = [
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
// Componente principal
// ─────────────────────────────────────────────────────────────

export function LandingScreen({
  onLoginPress,
  onRegisterPress,
}: LandingScreenProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <SVGBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Hero ───────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <Image
            source={require("@/assets/images/horizontal-logo.png")}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>
            Cuidar al barrio,{"\n"}es cuidar a todos
          </Text>
          <Text style={styles.heroSubtitle}>
            Una red de seguridad comunitaria que prioriza la solidaridad vecinal
            sobre la lógica comercial. Sin extracción de datos, sin lucro, solo
            comunidad.
          </Text>
          <View style={styles.heroCTAs}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRegisterPress}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Unirme a la red</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onLoginPress}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Misión ────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTag}>Nuestra misión</Text>
          <Text style={styles.sectionTitle}>
            Seguridad ciudadana como derecho, no producto
          </Text>
          <Text style={styles.sectionBody}>
            En comunidades donde la respuesta institucional es limitada, la
            solidaridad vecinal es el recurso más valioso. Barrio Alerta nace
            para fortalecer esa red de apoyo: una herramienta accesible,
            eficiente y ética que permite a cualquier persona reportar
            incidentes, activar alertas de emergencia y coordinar la respuesta
            comunitaria en tiempo real.
          </Text>
        </View>

        {/* ── Cómo funciona ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTag}>Cómo funciona</Text>
          <Text style={styles.sectionTitle}>
            Tres pasos para proteger tu comunidad
          </Text>

          <View style={styles.stepsContainer}>
            {STEPS.map((step, idx) => (
              <TouchableOpacity
                key={step.number}
                style={[
                  styles.stepCard,
                  activeStep === idx && styles.stepCardActive,
                ]}
                onPress={() => setActiveStep(idx)}
                activeOpacity={0.7}
              >
                <View style={styles.stepHeader}>
                  <Text
                    style={[
                      styles.stepNumber,
                      activeStep === idx && styles.stepNumberActive,
                    ]}
                  >
                    {step.number}
                  </Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                {activeStep === idx && (
                  <Text style={styles.stepDescription}>{step.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Características ───────────────────────────────── */}
        <View style={styles.section}>
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
                    size={22}
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

        {/* ── Principios socioambientales ───────────────────── */}
        <View style={[styles.section, styles.principlesSection]}>
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
                    size={24}
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

        {/* ── Impacto técnico ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTag}>Detrás del código</Text>
          <Text style={styles.sectionTitle}>Eficiencia con conciencia</Text>

          <View style={styles.impactCard}>
            <View style={styles.impactRow}>
              <Icon name="Zap" size={20} color={theme.colors.green} />
              <View style={styles.impactTextContainer}>
                <Text style={styles.impactLabel}>Mapeos en compilación</Text>
                <Text style={styles.impactDetail}>
                  Sin reflexión en runtime. Menos CPU, menos batería en el
                  servidor.
                </Text>
              </View>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactRow}>
              <Icon name="Database" size={20} color={theme.colors.green} />
              <View style={styles.impactTextContainer}>
                <Text style={styles.impactLabel}>
                  Dominio puro, sin frameworks
                </Text>
                <Text style={styles.impactDetail}>
                  El núcleo del sistema es Java puro. Ejecutable en cualquier
                  entorno, sin el peso de librerías comerciales.
                </Text>
              </View>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactRow}>
              <Icon name="Eye" size={20} color={theme.colors.green} />
              <View style={styles.impactTextContainer}>
                <Text style={styles.impactLabel}>Transparencia radical</Text>
                <Text style={styles.impactDetail}>
                  Código abierto, documentado y auditable. Cualquier comunidad
                  puede desplegar su propia instancia.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── CTA Final ──────────────────────────────────────── */}
        <View style={styles.finalCTASection}>
          <View style={styles.finalCTACard}>
            <Text style={styles.finalCTATitle}>¿Lista tu comunidad?</Text>
            <Text style={styles.finalCTABody}>
              Únete hoy. Sin costo, sin datos vendidos, sin condiciones. Solo
              vecinos cuidando vecinos.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRegisterPress}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Comenzar ahora</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.textLinkButton}
              onPress={onLoginPress}
              activeOpacity={0.7}
            >
              <Text style={styles.textLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Barrio Alerta</Text>
          <Text style={styles.footerTagline}>
            Software comunitario de código abierto · Hecho con ética y
            eficiencia
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://github.com/")}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Ver código fuente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SVGBackground>
  );
}

// ─────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },

    // ── Hero ──────────────────────────────────────────────
    heroSection: {
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 24,
    },
    heroLogo: {
      width: 240,
      height: 80,
      marginBottom: 40,
    },
    heroTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      textAlign: "center",
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontSize: 15,
      color: theme.colors.textTertiary,
      textAlign: "center",
      lineHeight: 22,
      marginTop: 16,
      maxWidth: 480,
    },
    heroCTAs: {
      flexDirection: "row",
      gap: 12,
      marginTop: 32,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    primaryButton: {
      backgroundColor: theme.colors.red,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 16,
      shadowColor: theme.colors.red,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontWeight: "700",
      fontSize: 15,
      letterSpacing: 0.5,
    },
    secondaryButton: {
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceBorder,
      backgroundColor: theme.colors.surfaceLight,
    },
    secondaryButtonText: {
      color: theme.colors.textPrimary,
      fontWeight: "600",
      fontSize: 15,
    },

    // ── Sections ──────────────────────────────────────────
    section: {
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    sectionTag: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      color: theme.colors.green,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      lineHeight: 32,
      marginBottom: 16,
    },
    sectionBody: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },

    // ── Steps ─────────────────────────────────────────────
    stepsContainer: {
      gap: 12,
      marginTop: 20,
    },
    stepCard: {
      backgroundColor: theme.colors.surface + "D9",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    stepCardActive: {
      borderColor: theme.colors.green,
      backgroundColor: theme.colors.greenBg,
    },
    stepHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    stepNumber: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.textDim,
    },
    stepNumberActive: {
      color: theme.colors.green,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    stepDescription: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      lineHeight: 20,
      marginTop: 10,
      marginLeft: 40,
    },

    // ── Features ──────────────────────────────────────────
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginTop: 20,
    },
    featureCard: {
      flex: 1,
      minWidth: 160,
      backgroundColor: theme.colors.surface + "D9",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    featureIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.greenBg,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 14,
    },
    featureTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 6,
    },
    featureDescription: {
      fontSize: 13,
      color: theme.colors.textTertiary,
      lineHeight: 18,
    },

    // ── Principles ────────────────────────────────────────
    principlesSection: {
      backgroundColor: theme.colors.surfaceDark + "80",
    },
    principlesContainer: {
      gap: 16,
      marginTop: 20,
    },
    principleCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      backgroundColor: theme.colors.surface + "D9",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    principleIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.redBg,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    principleTextContainer: {
      flex: 1,
      gap: 4,
    },
    principleTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    principleDescription: {
      fontSize: 13,
      color: theme.colors.textTertiary,
      lineHeight: 19,
    },

    // ── Impact ────────────────────────────────────────────
    impactCard: {
      backgroundColor: theme.colors.surface + "D9",
      borderRadius: 20,
      padding: 24,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      marginTop: 20,
    },
    impactRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
    },
    impactTextContainer: {
      flex: 1,
    },
    impactLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    impactDetail: {
      fontSize: 13,
      color: theme.colors.textTertiary,
      lineHeight: 19,
    },
    impactDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 20,
    },

    // ── Final CTA ─────────────────────────────────────────
    finalCTASection: {
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    finalCTACard: {
      backgroundColor: theme.colors.greenBg,
      borderRadius: 24,
      padding: 32,
      borderWidth: 1.5,
      borderColor: theme.colors.greenBorder,
      alignItems: "center",
    },
    finalCTATitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    finalCTABody: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 24,
      maxWidth: 360,
    },
    textLinkButton: {
      marginTop: 16,
      paddingVertical: 8,
    },
    textLink: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.green,
    },

    // ── Footer ────────────────────────────────────────────
    footer: {
      paddingVertical: 40,
      paddingHorizontal: 24,
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    footerBrand: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    footerTagline: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: "center",
      marginBottom: 12,
    },
    footerLink: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.green,
    },
  });

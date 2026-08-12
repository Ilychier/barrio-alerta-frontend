import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useDashboardController } from "../../application/controllers/useDashboardController";
import { useSOSController } from "../../application/controllers/useSOSController";
import Icon from "../components/atomic/Icon";
import { SOSButton } from "../components/molecules/SOSButton";
import { useAuth } from "../context/AuthContext";
import { AppTheme, useAppTheme } from "../theme/ThemeContext";

const QUICK_ACTIONS = [
  {
    icon: "Bell",
    iconColor: "orange",
    title: "Alerta inmediata",
    description: "Notificación instantánea al cuadrante.",
  },
  {
    icon: "Mail",
    iconColor: "blue",
    title: "Comunicación directa",
    description: "Contacto directo con el cuadrante asignado.",
  },
  {
    icon: "ShieldCheck",
    iconColor: "green",
    title: "Respuesta comunitaria",
    description: "Tu comunidad está siempre alerta.",
  },
] as const;

function getActionColors(theme: AppTheme, colorKey: string) {
  switch (colorKey) {
    case "orange":
      return { bg: "rgba(194, 87, 63, 0.08)", fg: theme.colors.red };
    case "blue":
      return { bg: "rgba(69, 102, 112, 0.08)", fg: theme.colors.purple };
    case "green":
    default:
      return { bg: theme.colors.greenBg, fg: theme.colors.green };
  }
}

export function DashboardScreen() {
  const { user, cuadrante: authCuadrante } = useAuth();
  const userId = user?.id ?? 0;
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);

  const { cuadrante } = useDashboardController({
    user: user ?? undefined,
    cuadrante: authCuadrante ?? undefined,
  });
  const sos = useSOSController(userId, () => {});

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO ─────────────────────────────────────────── */}
      <View style={styles.heroRow}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroTitle}>Botón de Pánico S.O.S</Text>
          <View style={styles.titleAccent} />
          <Text style={styles.heroDescription}>
            Contacto directo con el cuadrante de emergencia de tu barrio. Toca
            el botón en caso de necesitar auxilio inmediato.
          </Text>
        </View>
      </View>

      {/* ── BOTÓN S.O.S ──────────────────────────────────── */}
      <View style={styles.sosButtonContainer}>
        <SOSButton
          step={sos.sosStep}
          countdown={sos.sosCountdown}
          performanceTracker={sos.performanceTracker}
          onStart={sos.startSOS}
          onConfirm={sos.triggerSOSFinal}
          onCancel={sos.cancelSOS}
          onDismiss={sos.dismissSOS}
        />
      </View>

      {/* ── TARJETA DE ACCIONES RÁPIDAS ──────────────────── */}
      <View style={styles.actionsCard}>
        {QUICK_ACTIONS.map((action, idx) => {
          const colors = getActionColors(theme, action.iconColor);
          return (
            <View key={action.title} style={styles.actionColumnWrapper}>
              <View style={styles.actionColumn}>
                <View
                  style={[
                    styles.actionIconCircle,
                    { backgroundColor: colors.bg },
                  ]}
                >
                  <Icon name={action.icon as any} size={22} color={colors.fg} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>
                  {action.description}
                </Text>
              </View>
              {idx < QUICK_ACTIONS.length - 1 && (
                <View style={styles.actionDivider} />
              )}
            </View>
          );
        })}
      </View>

      {/* ── TARJETA DEL CUADRANTE ────────────────────────── */}
      <View style={styles.cuadranteCard}>
        <View style={styles.cuadranteLeft}>
          <View style={styles.cuadranteIconCircle}>
            <Icon name="MapPin" size={12} color={theme.colors.green} />
          </View>
          <View style={styles.cuadranteInfo}>
            <Text style={styles.cuadranteLabel}>CUADRANTE ASIGNADO</Text>
            <Text style={styles.cuadranteTitle}>
              {cuadrante?.nombre_unidad || "Cargando..."}
            </Text>
            <Text style={styles.cuadranteDesc}>
              Siempre conectados, siempre seguros.
            </Text>
          </View>
        </View>

        <View style={styles.cuadranteRight}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeLabel}>Cel. del CAI</Text>
            <Text style={styles.codeBadgeValue}>
              {cuadrante?.telefono_emergencia || "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* ── BOTTOM: CAI / ID ─────────────────────────────── */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>
          CAI: {cuadrante?.nombre_unidad || "Cargando..."}
        </Text>
        <View style={styles.bottomDot} />
        <Text style={styles.bottomText}>ID: {userId}</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: AppTheme, isDesktop: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    content: {
      padding: isDesktop ? 32 : 20,
      paddingBottom: 48,
      gap: isDesktop ? 48 : 40,
      maxWidth: isDesktop ? 1000 : undefined,
      alignSelf: "center",
      width: "100%",
    },

    // ── HERO ──────────────────────────────────────────────
    heroRow: {
      flexDirection: isDesktop ? "row" : "column",
      justifyContent: "space-between",
      alignItems: isDesktop ? "flex-start" : "stretch",
      gap: isDesktop ? 32 : 16,
      marginTop: 8,
    },
    heroLeft: {
      flex: 1,
    },
    heroTitle: {
      fontSize: isDesktop ? 40 : 32,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      letterSpacing: -1,
      textAlign: isDesktop ? "left" : "center",
      lineHeight: isDesktop ? 48 : 40,
    },
    titleAccent: {
      width: 120,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.red,
      marginTop: 10,
      alignSelf: isDesktop ? "flex-start" : "center",
      marginBottom: 16,
    },
    heroDescription: {
      fontSize: 15,
      color: theme.colors.textTertiary,
      lineHeight: 22,
      textAlign: isDesktop ? "left" : "center",
      maxWidth: 420,
    },

    // ── INFO CARD ────────────────────────────────────────
    infoCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.colors.greenBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.greenBorder,
      padding: 14,
      maxWidth: isDesktop ? 260 : "100%",
      alignSelf: isDesktop ? "flex-end" : "flex-start",
    },
    infoCardIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    infoCardText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.green,
      lineHeight: 18,
    },

    // ── SOS BUTTON ───────────────────────────────────────
    sosButtonContainer: {
      alignItems: "center",
      paddingVertical: 8,
    },

    // ── ACTIONS CARD ─────────────────────────────────────
    actionsCard: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 24,
    },
    actionColumnWrapper: {
      flex: 1,
      flexDirection: "row",
    },
    actionColumn: {
      flex: 1,
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 8,
    },
    actionIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    actionDescription: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      textAlign: "center",
      lineHeight: 16,
    },
    actionDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 4,
    },

    // ── CUADRANTE CARD ───────────────────────────────────
    cuadranteCard: {
      flexDirection: isDesktop ? "row" : "column",
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: isDesktop ? 24 : 20,
      gap: isDesktop ? 20 : 16,
      alignItems: isDesktop ? "center" : "center",
    },
    cuadranteLeft: {
      flex: 1,
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
      minWidth: 0,
    },
    cuadranteIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 28,
      backgroundColor: theme.colors.greenBg,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    cuadranteInfo: {
      flex: 1,
      gap: 2,
    },
    cuadranteLabel: {
      fontSize: 8,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
      color: theme.colors.textMuted,
    },
    cuadranteTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    cuadranteDesc: {
      fontSize: 11,
      color: theme.colors.textTertiary,
    },
    cuadranteRight: {
      flexShrink: 0,
    },
    codeBadge: {
      backgroundColor: theme.colors.greenBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.greenBorder,
      padding: 14,
      alignItems: "center",
      minWidth: 120,
    },
    codeBadgeLabel: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: theme.colors.green,
      marginBottom: 4,
    },
    codeBadgeValue: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      fontFamily: "monospace",
    },

    // ── BOTTOM BAR ───────────────────────────────────────
    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    bottomText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.textMuted,
    },
    bottomDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textDim,
    },
  });

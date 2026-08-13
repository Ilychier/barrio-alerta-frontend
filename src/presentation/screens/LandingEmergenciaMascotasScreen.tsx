import { useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReporteMascota } from "../../domain/mascotas/entities/ReporteMascota";
import { ReporteRapidoResult } from "../../domain/mascotas/ports/IReporteRapidoRepository";
import Icon from "../components/atomic/Icon";
import { SVGBackground } from "../components/layout/SVGBackground";
import { AboutDeveloperModal } from "../components/molecules/AboutDeveloperModal";
import { useAuth } from "../context/AuthContext";
import { RegistroRapidoForm } from "../mascotas/components/RegistroRapidoForm";
import { DetalleReporteMascotaScreen } from "../mascotas/screens/DetalleReporteMascotaScreen";
import { FeedMascotasScreen } from "../mascotas/screens/FeedMascotasScreen";
import { ultimaVistaEmergencia } from "../mascotas/state/ultimaVistaEmergencia";
import { ultimoRegistroRapido } from "../mascotas/state/ultimoRegistroRapido";
import { AppTheme, useAppTheme } from "../theme/ThemeContext";

interface LandingEmergenciaMascotasScreenProps {
  onLoginPress: () => void;
  onDashboardPress: () => void;
  onCambiarPasswordPress: () => void;
  /** Forzar el cambio de clave a nivel de root (registro rápido con clave temporal).
   *  La landing delega al _layout, que renderiza CambiarPasswordScreen sin landing
   *  ni drawer — el usuario no puede evadir el cambio. */
  onForzarCambioClave: () => void;
  onLogoutPress: () => void;
}

type Vista = "reportar" | "ver";
type EstadoRegistro = "idle" | "exito" | "existente";
/**
 * Landing de emergencia (BC Mascotas) — pantalla inicial cuando
 * MODO_EMERGENCIA=true. Reemplaza a la landing de marketing (que queda
 * intacta en el código, solo oculta).
 *
 * - Toggle superior: "Reportar" (formulario rápido) / "Ver Animalitos" (feed público).
 * - Menú: "Emergencia Colombia" (esta pantalla), "Ver Dashboard" (entra a la
 *   app normal), "Cambiar mi contraseña" (si clave temporal), login/logout.
 * - Tras reportar: auto-login con el JWT (usuario nuevo o temporal). Si la
 *   clave es temporal, se fuerza el cambio de clave ANTES de mostrar la
 *   pantalla de gracias (evita que los usuarios pierdan sus claves). Si el
 *   usuario ya existía con clave real, mensaje + botón a login.
 */
export function LandingEmergenciaMascotasScreen({
  onLoginPress,
  onDashboardPress,
  onCambiarPasswordPress,
  onForzarCambioClave,
  onLogoutPress,
}: LandingEmergenciaMascotasScreenProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const styles = getStyles(theme, isDesktop);
  const insets = useSafeAreaInsets();
  const { isAuthenticated, passwordTemporal, autenticarConToken } = useAuth();

  const [vista, setVista] = useState<Vista>(() => ultimaVistaEmergencia.get());
  const [menuVisible, setMenuVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [detalleReporte, setDetalleReporte] = useState<ReporteMascota | null>(
    null,
  );
  const [estadoRegistro, setEstadoRegistro] = useState<EstadoRegistro>(() => {
    const res = ultimoRegistroRapido.get();
    if (!res) return "idle";
    // Si la clave sigue temporal, el _layout ya debió forzar la pantalla
    // de cambio de clave a nivel de root. Llegar aquí con passwordTemporal
    // es un edge case: disparamos el callback para no mostrar la landing.
    if (passwordTemporal) return "exito";
    return "exito";
  });
  const [resultado, setResultado] = useState<ReporteRapidoResult | null>(() =>
    ultimoRegistroRapido.get(),
  );
  const [autologinError, setAutologinError] = useState<string | null>(null);
  const [slideAnim] = useState(() => new Animated.Value(-280));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuVisible(false));
  };

  const handleRegistroExitoso = async (result: ReporteRapidoResult) => {
    setResultado(result);
    setAutologinError(null);
    // Persiste el resultado para sobrevivir al remount del auto-login
    ultimoRegistroRapido.set(result);
    if (result.token) {
      try {
        await autenticarConToken(result.token);
        // Clave temporal: el _layout fuerza la pantalla de cambio de clave
        // a nivel de root (sin landing ni drawer). La landing delega.
        if (result.passwordTemporal) {
          onForzarCambioClave();
        } else {
          setEstadoRegistro("exito");
        }
      } catch {
        setAutologinError(
          "Tu reporte quedó registrado, pero no pudimos iniciar sesión automáticamente.",
        );
        setEstadoRegistro("exito");
      }
    } else {
      // Usuario existente con clave real: no autologin (seguridad)
      setEstadoRegistro("existente");
    }
  };

  const volverAReportar = () => {
    setEstadoRegistro("idle");
    setResultado(null);
    ultimoRegistroRapido.clear();
    setVista("reportar");
    ultimaVistaEmergencia.set("reportar");
  };

  return (
    <SVGBackground>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={openMenu}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Icon name="Menu" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>Barrio Alerta</Text>
            <Text style={styles.headerSubtitle}>Emergencia Colombia</Text>
          </View>
        </View>
        {isAuthenticated && (
          <TouchableOpacity
            onPress={onDashboardPress}
            style={styles.dashboardBtn}
            activeOpacity={0.7}
          >
            <Icon name="LayoutDashboard" size={16} color={theme.colors.white} />
            <Text style={styles.dashboardBtnText}>Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Toggle Reportar / Ver Animalitos ───────────── */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleBtn,
            vista === "reportar" && styles.toggleBtnActivo,
          ]}
          onPress={() => {
            setVista("reportar");
            ultimaVistaEmergencia.set("reportar");
          }}
        >
          <Icon
            name="CirclePlus"
            size={16}
            color={
              vista === "reportar"
                ? theme.colors.white
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              vista === "reportar" && styles.toggleTextActivo,
            ]}
          >
            Reportar
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, vista === "ver" && styles.toggleBtnActivo]}
          onPress={() => {
            setVista("ver");
            ultimaVistaEmergencia.set("ver");
          }}
        >
          <Icon
            name="PawPrint"
            size={16}
            color={
              vista === "ver" ? theme.colors.white : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              vista === "ver" && styles.toggleTextActivo,
            ]}
          >
            Ver Animalitos
          </Text>
        </Pressable>
      </View>

      {/* ── Contenido ──────────────────────────────────── */}
      <View style={styles.content}>
        {vista === "reportar" ? (
          estadoRegistro === "idle" ? (
            <RegistroRapidoForm onSuccess={handleRegistroExitoso} />
          ) : estadoRegistro === "exito" ? (
            <View style={styles.graciasCard}>
              <View style={styles.graciasIcon}>
                <Icon
                  name="HeartHandshake"
                  size={40}
                  color={theme.colors.green}
                />
              </View>
              <Text style={styles.graciasTitle}>¡Gracias por reportar! 🐾</Text>
              <Text style={styles.graciasBody}>
                Tu reporte de{" "}
                {resultado?.reporte.tipoReporte === "LOST"
                  ? "mascota perdida"
                  : "mascota encontrada"}{" "}
                quedó publicado. Quien la vea podrá contactarte por WhatsApp.
              </Text>
              {autologinError && (
                <Text style={styles.error}>{autologinError}</Text>
              )}
              <View style={styles.graciasActions}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={volverAReportar}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryBtnText}>
                    Reportar otro animalito
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={onDashboardPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkBtnText}>Ver Dashboard →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.graciasCard}>
              <View style={styles.graciasIcon}>
                <Icon name="CircleCheck" size={40} color={theme.colors.green} />
              </View>
              <Text style={styles.graciasTitle}>¡Reporte agregado!</Text>
              <Text style={styles.graciasBody}>
                Ya tienes una cuenta con este celular, así que agregamos el
                reporte a tu perfil. Inicia sesión para verlo y gestionarlo.
              </Text>
              <View style={styles.graciasActions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={onLoginPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={volverAReportar}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkBtnText}>
                    Reportar otro animalito
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        ) : detalleReporte ? (
          <DetalleReporteMascotaScreen
            reporteId={detalleReporte.id}
            onBack={() => setDetalleReporte(null)}
          />
        ) : (
          <FeedMascotasScreen onVerDetalle={setDetalleReporte} />
        )}
      </View>

      {/* ── Menú lateral ───────────────────────────────── */}
      {menuVisible && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}>
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
          </Pressable>
          <Animated.View
            style={[
              styles.drawerPanel,
              {
                paddingTop: Math.max(insets.top, 24) + 12,
                paddingBottom: Math.max(insets.bottom, 16) + 12,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Image
                source={require("@/assets/images/horizontal-logo.png")}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={closeMenu}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Icon name="X" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.navLinks}>
              <Text style={styles.sectionLabel}>Menú</Text>

              <TouchableOpacity
                style={[styles.navLink, styles.navLinkActivo]}
                onPress={() => {
                  closeMenu();
                  setVista("reportar");
                  ultimaVistaEmergencia.set("reportar");
                }}
                activeOpacity={0.7}
              >
                <Icon name="Siren" size={16} color={theme.colors.red} />
                <Text
                  style={[
                    styles.navLinkText,
                    { color: theme.colors.red, fontWeight: "700" },
                  ]}
                >
                  Emergencia Colombia
                </Text>
              </TouchableOpacity>

              {isAuthenticated ? (
                <>
                  <TouchableOpacity
                    style={styles.navLink}
                    onPress={() => {
                      closeMenu();
                      onDashboardPress();
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="LayoutDashboard"
                      size={16}
                      color={theme.colors.textMuted}
                    />
                    <Text style={styles.navLinkText}>
                      Ver Dashboard / Mi cuenta
                    </Text>
                  </TouchableOpacity>
                  {passwordTemporal && (
                    <TouchableOpacity
                      style={styles.navLink}
                      onPress={() => {
                        closeMenu();
                        onCambiarPasswordPress();
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name="KeyRound"
                        size={16}
                        color={theme.colors.red}
                      />
                      <Text
                        style={[
                          styles.navLinkText,
                          { color: theme.colors.red },
                        ]}
                      >
                        Cambiar mi contraseña
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.navLink}
                    onPress={() => {
                      closeMenu();
                      onLogoutPress();
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="LogOut" size={16} color={theme.colors.red} />
                    <Text
                      style={[styles.navLinkText, { color: theme.colors.red }]}
                    >
                      Cerrar sesión
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.navLink}
                  onPress={() => {
                    closeMenu();
                    onLoginPress();
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="LogIn" size={16} color={theme.colors.textMuted} />
                  <Text style={styles.navLinkText}>Iniciar sesión</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.navLink}
                onPress={() => {
                  closeMenu();
                  setAboutModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Icon name="Info" size={16} color={theme.colors.textMuted} />
                <Text style={styles.navLinkText}>Sobre el desarrollador</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawerFooter}>
              <Text style={styles.footerText}>Barrio Alerta</Text>
              <Text style={styles.footerSubtext}>
                Hecho con ❤️ por desarrolladores colombianos
              </Text>
            </View>
          </Animated.View>
        </View>
      )}

      <AboutDeveloperModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
      />
    </SVGBackground>
  );
}

const getStyles = (theme: AppTheme, isDesktop: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceDark,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    menuButton: { padding: 6, borderRadius: 8 },
    logoImage: { width: 36, height: 36 },
    headerTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      fontSize: 11,
      color: theme.colors.red,
      fontWeight: "600",
    },
    dashboardBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.green,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    dashboardBtnText: {
      color: theme.colors.white,
      fontSize: 13,
      fontWeight: "700",
    },
    hero: {
      paddingHorizontal: isDesktop ? 32 : 20,
      alignItems: "center",
      maxWidth: 900,
      alignSelf: "center",
      width: "100%",
      marginTop: 7,
      marginBottom: -10,
    },
    heroTitle: {
      fontSize: isDesktop ? 36 : 23,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      textAlign: "center",
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontSize: isDesktop ? 16 : 14,
      color: theme.colors.textTertiary,
      textAlign: "center",
      lineHeight: isDesktop ? 26 : 21,
      marginTop: 3,
      maxWidth: 640,
    },
    toggleContainer: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 4,
      marginTop: 16,
      gap: 4,
      maxWidth: 400,
      alignSelf: "center",
      width: "100%",
    },
    toggleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 9,
    },
    toggleBtnActivo: { backgroundColor: theme.colors.red },
    toggleText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textSecondary,
    },
    toggleTextActivo: { color: theme.colors.white },
    content: {
      flex: 1,
      marginTop: 16,
    },
    graciasCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: isDesktop ? 40 : 24,
      alignItems: "center",
      gap: 12,
      maxWidth: 560,
      alignSelf: "center",
      width: "100%",
      marginHorizontal: isDesktop ? 32 : 20,
    },
    graciasIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.greenBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    graciasTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    graciasBody: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },
    graciasActions: { gap: 10, width: "100%", marginTop: 8 },
    primaryBtn: {
      backgroundColor: theme.colors.red,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    primaryBtnText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: "700",
    },
    secondaryBtn: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    secondaryBtnText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    linkBtn: { alignItems: "center", paddingVertical: 6 },
    linkBtnText: { color: theme.colors.green, fontSize: 14, fontWeight: "700" },
    error: { color: theme.colors.red, fontSize: 13, textAlign: "center" },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
    drawerPanel: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: 280,
      backgroundColor: theme.colors.surfaceDark,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      padding: 20,
      justifyContent: "space-between",
      zIndex: 1001,
    },
    drawerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    drawerLogo: { width: 180, height: 56 },
    closeButton: { padding: 6 },
    navLinks: { flex: 1, gap: 8 },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textMuted,
      letterSpacing: 1,
      marginBottom: 8,
    },
    navLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    navLinkActivo: { backgroundColor: theme.colors.redBg },
    navLinkText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textMuted,
    },
    drawerFooter: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      alignItems: "center",
      gap: 2,
    },
    footerText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.textTertiary,
    },
    footerSubtext: { fontSize: 9, color: theme.colors.textMuted },
  });

import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import Icon from "@/presentation/components/atomic/Icon";
import { IconRenderer } from "@/presentation/components/atomic/IconRenderer";
import { Header } from "@/presentation/components/layout/Header";
import { SVGBackground } from "@/presentation/components/layout/SVGBackground";
import { AuthProvider, useAuth } from "@/presentation/context/AuthContext";
import { LandingScreen } from "@/presentation/screens/LandingScreen";
import { LoginScreen } from "@/presentation/screens/LoginScreen";
import { RegisterScreen } from "@/presentation/screens/RegisterScreen";
import {
  AppTheme,
  ThemeProvider,
  useAppTheme,
} from "@/presentation/theme/ThemeContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TabLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}

function TabLayout() {
  const { user, barrio, cuadrante, ciudadNombre, isAuthenticated, loading, logout } =
    useAuth();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const [authView, setAuthView] = useState<"landing" | "login" | "register">(
    "landing",
  );
  // Modo del drawer: por defecto "desaparecidos" (BC Mascotas)
  const [menuMode, setMenuMode] = useState<"desaparecidos" | "alertas">(
    "desaparecidos",
  );

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);

  // Use state instead of useRef to avoid ESLint rules about accessing ref during render
  const [slideAnim] = useState(() => new Animated.Value(-280));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  // Al iniciar sesión (transición !isAuthenticated → isAuthenticated),
  // el modo por defecto es "desaparecidos" y navega a su primera opción (/mascotas)
  const wasAuthenticated = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current) {
      wasAuthenticated.current = true;
      setMenuMode("desaparecidos");
      router.replace("/mascotas");
    }
    if (!isAuthenticated) {
      wasAuthenticated.current = false;
    }
  }, [isAuthenticated, router]);

  const openMenu = () => {
    // Sincroniza el toggle con la ruta activa al abrir el drawer
    if (pathname.startsWith("/mascotas")) {
      setMenuMode("desaparecidos");
    } else {
      setMenuMode("alertas");
    }
    setVisible(true);
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
    ]).start(() => {
      setVisible(false);
    });
  };

  const handleNavigate = (route: any) => {
    router.push(route);
    closeMenu();
  };

  // Al cambiar el modo con el toggle, navega a la primera opción de cada menú
  const handleModeChange = (mode: "desaparecidos" | "alertas") => {
    setMenuMode(mode);
    if (mode === "desaparecidos") {
      handleNavigate("/mascotas");
    } else {
      handleNavigate("/");
    }
  };

  const isRouteActive = (route: string) => {
    if (route === "/") {
      return pathname === "/" || pathname === "/index" || pathname === "";
    }
    // El feed de mascotas solo se marca activo en su ruta exacta,
    // no en sub-rutas (reportar, mis-reportes, historias, detalle)
    if (route === "/mascotas") {
      return pathname === "/mascotas" || pathname === "/mascotas/index";
    }
    return pathname.startsWith(route);
  };

  // Es sub-ruta (ej: /mascotas/1) → muestra flecha "atrás" en el header
  const isSubRoute =
    pathname !== "/" &&
    pathname !== "/mascotas" &&
    pathname !== "/mascotas/index" &&
    pathname !== "/index" &&
    pathname !== "";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (pathname.startsWith("/mascotas")) {
      router.replace("/mascotas");
    } else {
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <SVGBackground>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.green} />
        </View>
      </SVGBackground>
    );
  }

  if (!isAuthenticated) {
    if (authView === "register") {
      return (
        <RegisterScreen
          onLoginPress={() => setAuthView("login")}
          onBackPress={() => setAuthView("landing")}
        />
      );
    }
    if (authView === "login") {
      return (
        <LoginScreen
          onRegisterPress={() => setAuthView("register")}
          onBackPress={() => setAuthView("landing")}
        />
      );
    }
    return (
      <LandingScreen
        onLoginPress={() => setAuthView("login")}
        onRegisterPress={() => setAuthView("register")}
      />
    );
  }

  return (
    <SVGBackground>
      {/* Header with hamburger menu toggle - badges conditionally visible outside based on screen size */}
      <Header
        isMobile={isSmallScreen}
        onMenuPress={openMenu}
        onBackPress={isSubRoute ? handleBack : undefined}
        onLogoutPress={async () => {
          await logout();
        }}
      />

      {/* Active Screen Area */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Hamburger Menu slide-out drawer */}
      {visible && (
        <View style={StyleSheet.absoluteFill}>
          {/* Dark translucent backdrop */}
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}>
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
          </Pressable>

          {/* Slide-out Panel */}
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
            {/* Header inside Menu */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerLogoContainer}>
                <Image
                  source={require("@/assets/images/horizontal-logo.png")}
                  style={styles.drawerLogoImage}
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity
                onPress={closeMenu}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <IconRenderer
                  name="X"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Conditionally include username and location badges ONLY on smaller screens */}
            {isSmallScreen && (
              <View style={styles.drawerSection}>
                {user?.nombre && (
                  <View style={styles.drawerUserBadge}>
                    <Icon name="User" size={14} color={theme.colors.green} />
                    <View>
                      <Text style={styles.drawerUserTitle}>Usuario Activo</Text>
                      <Text style={styles.drawerUserName}>{user.nombre}</Text>
                    </View>
                  </View>
                )}
                {barrio?.nombre && (
                  <View style={styles.drawerLocationBadge}>
                    <Icon name="MapPin" size={14} color={theme.colors.green} />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.drawerLocationTitle}>
                        Ciudad / Barrio
                      </Text>
                      <Text style={styles.drawerCuadranteText}>
                        {ciudadNombre ?? "—"} / {barrio.nombre}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Navigation list */}
            <View style={styles.navLinks}>
              {/* Toggle de módulo: Desaparecidos (Mascotas) / Alertas (Barrio Alerta) */}
              <View style={styles.modeToggle}>
                <Pressable
                  style={[
                    styles.modeBtn,
                    menuMode === "desaparecidos" && styles.modeBtnActive,
                  ]}
                  onPress={() => handleModeChange("desaparecidos")}
                >
                  <Icon
                    name="PawPrint"
                    size={14}
                    color={
                      menuMode === "desaparecidos"
                        ? theme.colors.white
                        : theme.colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.modeBtnText,
                      menuMode === "desaparecidos" && styles.modeBtnTextActive,
                    ]}
                  >
                    Desaparecidos
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modeBtn,
                    menuMode === "alertas" && styles.modeBtnActive,
                  ]}
                  onPress={() => handleModeChange("alertas")}
                >
                  <Icon
                    name="Bell"
                    size={14}
                    color={
                      menuMode === "alertas"
                        ? theme.colors.white
                        : theme.colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.modeBtnText,
                      menuMode === "alertas" && styles.modeBtnTextActive,
                    ]}
                  >
                    Alertas
                  </Text>
                </Pressable>
              </View>

              {menuMode === "desaparecidos" ? (
                <>
                  {/* ── BC MASCOTAS ─────────────────────────── */}
                  <Text style={styles.sectionLabel}>Mascotas</Text>

                  <TouchableOpacity
                    onPress={() => handleNavigate("/mascotas")}
                    style={[
                      styles.navLink,
                      isRouteActive("/mascotas") && styles.navLinkActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="PawPrint"
                      size={16}
                      color={
                        isRouteActive("/mascotas")
                          ? theme.colors.textPrimary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        isRouteActive("/mascotas") && styles.navLinkTextActive,
                      ]}
                    >
                      Mascotas en Emergencia
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleNavigate("/mascotas/reportar")}
                    style={[
                      styles.navLink,
                      isRouteActive("/mascotas/reportar") &&
                        styles.navLinkActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="CirclePlus"
                      size={16}
                      color={
                        isRouteActive("/mascotas/reportar")
                          ? theme.colors.textPrimary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        isRouteActive("/mascotas/reportar") &&
                          styles.navLinkTextActive,
                      ]}
                    >
                      Reportar Mascota
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleNavigate("/mascotas/mis-reportes")}
                    style={[
                      styles.navLink,
                      isRouteActive("/mascotas/mis-reportes") &&
                        styles.navLinkActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="List"
                      size={16}
                      color={
                        isRouteActive("/mascotas/mis-reportes")
                          ? theme.colors.textPrimary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        isRouteActive("/mascotas/mis-reportes") &&
                          styles.navLinkTextActive,
                      ]}
                    >
                      Mis Reportes de Mascotas
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleNavigate("/mascotas/historias")}
                    style={[
                      styles.navLink,
                      isRouteActive("/mascotas/historias") &&
                        styles.navLinkActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="HeartHandshake"
                      size={16}
                      color={
                        isRouteActive("/mascotas/historias")
                          ? theme.colors.textPrimary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        isRouteActive("/mascotas/historias") &&
                          styles.navLinkTextActive,
                      ]}
                    >
                      Historias de Rescate
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* ── BC ALERTAS ─────────────────────────── */}
                  <Text style={styles.sectionLabel}>Navegación</Text>

                  <TouchableOpacity
                    onPress={() => handleNavigate("/")}
                    style={[
                      styles.navLink,
                      isRouteActive("/") && styles.navLinkActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <IconRenderer
                      name="Activity"
                      size={16}
                      color={
                        isRouteActive("/")
                          ? theme.colors.textPrimary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        isRouteActive("/") && styles.navLinkTextActive,
                      ]}
                    >
                      Dashboard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleNavigate("/alertas-sector")}
                    style={[
                      styles.navLink,
                      isRouteActive("/alertas-sector") && styles.navLinkActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="Bell"
                      size={16}
                      color={
                        isRouteActive("/alertas-sector")
                          ? theme.colors.textPrimary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        isRouteActive("/alertas-sector") &&
                          styles.navLinkTextActive,
                      ]}
                    >
                      Alertas del Sector
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleNavigate("/reportar")}
                    style={[
                      styles.navLink,
                      isRouteActive("/reportar") && styles.navLinkActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="ClockAlert"
                      size={16}
                      color={
                        isRouteActive("/reportar")
                          ? theme.colors.textPrimary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        isRouteActive("/reportar") && styles.navLinkTextActive,
                      ]}
                    >
                      Reportar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleNavigate("/config")}
                    style={[
                      styles.navLink,
                      isRouteActive("/config") && styles.navLinkActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="Settings"
                      size={16}
                      color={
                        isRouteActive("/config")
                          ? theme.colors.textPrimary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        isRouteActive("/config") && styles.navLinkTextActive,
                      ]}
                    >
                      Configuración (Notificaciones)
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={async () => {
                  closeMenu();
                  await logout();
                }}
                style={styles.navLink}
                activeOpacity={0.7}
              >
                <Icon name="LogOut" size={16} color={theme.colors.red} />
                <Text style={[styles.navLinkText, { color: theme.colors.red }]}>
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.drawerFooter}>
              <Text style={styles.footerText}>Barrio Alerta</Text>
              <Text style={styles.footerSubtext}>v1.0.0 — Ing. Software I</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </SVGBackground>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
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
    drawerLogoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    drawerLogoImage: {
      width: 220,
      height: 70,
    },
    closeButton: {
      padding: 6,
    },
    drawerSection: {
      gap: 12,
      marginBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 20,
    },
    drawerDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 12,
    },
    modeToggle: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 4,
      marginBottom: 16,
      gap: 4,
    },
    modeBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 8,
      borderRadius: 9,
    },
    modeBtnActive: {
      backgroundColor: theme.colors.green,
    },
    modeBtnText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textMuted,
    },
    modeBtnTextActive: {
      color: theme.colors.white,
    },
    drawerUserBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    drawerUserTitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: "600",
    },
    drawerUserName: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    drawerLocationBadge: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    locationTextContainer: {
      flex: 1,
      gap: 2,
    },
    drawerLocationTitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: "600",
    },
    drawerLocationText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    drawerCuadranteText: {
      fontSize: 11,
      color: theme.colors.textTertiary,
    },
    navLinks: {
      flex: 1,
      gap: 8,
    },
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
      borderColor: "transparent",
    },
    navLinkActive: {
      backgroundColor: theme.colors.surfaceLight,
      borderColor: theme.colors.surfaceBorder,
    },
    navLinkText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textMuted,
    },
    navLinkTextActive: {
      color: theme.colors.textPrimary,
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
    footerSubtext: {
      fontSize: 9,
      color: theme.colors.textMuted,
    },
  });

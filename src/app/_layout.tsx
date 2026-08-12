import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { getModoEmergencia } from "@/constants/env";
import { Header } from "@/presentation/components/layout/Header";
import { AppDrawer, DrawerMode } from "@/presentation/components/layout/AppDrawer";
import { SVGBackground } from "@/presentation/components/layout/SVGBackground";
import { AboutDeveloperModal } from "@/presentation/components/molecules/AboutDeveloperModal";
import { ProximamenteModal } from "@/presentation/components/molecules/ProximamenteModal";
import { AuthProvider, useAuth } from "@/presentation/context/AuthContext";
import { DIProvider } from "@/presentation/context/DIContext";
import { ultimaVistaEmergencia } from "@/presentation/mascotas/state/ultimaVistaEmergencia";
import { ultimoRegistroRapido } from "@/presentation/mascotas/state/ultimoRegistroRapido";
import { CambiarPasswordScreen } from "@/presentation/screens/CambiarPasswordScreen";
import { LandingEmergenciaMascotasScreen } from "@/presentation/screens/LandingEmergenciaMascotasScreen";
import { LandingScreen } from "@/presentation/screens/LandingScreen";
import { LoginScreen } from "@/presentation/screens/LoginScreen";
import { RegisterScreen } from "@/presentation/screens/RegisterScreen";
import { useDrawerAnimation } from "@/presentation/hooks/useDrawerAnimation";
import {
  AppTheme,
  ThemeProvider,
  useAppTheme,
} from "@/presentation/theme/ThemeContext";

export default function RootLayout() {
  return (
    <DIProvider>
      <AuthProvider>
        <ThemeProvider>
          <TabLayout />
        </ThemeProvider>
      </AuthProvider>
    </DIProvider>
  );
}

function TabLayout() {
  const {
    user,
    barrio,
    ciudadNombre,
    isAuthenticated,
    loading,
    passwordTemporal,
    logout,
  } = useAuth();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const [authView, setAuthView] = useState<
    "landing" | "login" | "register" | "cambiar-password"
  >("landing");
  // Modo del drawer: por defecto "desaparecidos" (BC Mascotas)
  const [menuMode, setMenuMode] = useState<DrawerMode>("desaparecidos");
  // Modo emergencia (runtime, frontend): la app abre en la landing de mascotas
  const modoEmergencia = getModoEmergencia();
  // Vista activa en modo emergencia: la landing misma o la app normal
  const [vistaEmergencia, setVistaEmergencia] = useState<
    "emergencia" | "app-normal"
  >("emergencia");
  // Key de la landing de emergencia: al cambiar, React la desmonta y remonta
  // (resetea todo su estado local). Se incrementa en cada logout.
  const [landingKey, setLandingKey] = useState(0);
  // Modal "Próximamente" del módulo Alertas (bloqueado en el drawer).
  const [proximamenteVisible, setProximamenteVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const router = useRouter();
  const pathname = usePathname();

  // Animación del drawer (hook extraído — SRP)
  const { visible: menuVisible, slideAnim, fadeAnim, openMenu, closeMenu } = useDrawerAnimation();

  // Al iniciar sesión (transición !isAuthenticated → isAuthenticated),
  // el modo por defecto es "desaparecidos" y navega a su primera opción (/mascotas)
  // EXCEPTO en modo emergencia: el usuario se queda en la landing de emergencia
  // hasta que clickee "Ver Dashboard" explícitamente.
  const wasAuthenticated = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current) {
      wasAuthenticated.current = true;
      setMenuMode("desaparecidos");
      if (modoEmergencia && vistaEmergencia === "emergencia") {
        // Quedarse en la landing de emergencia (auto-login del registro rápido)
        return;
      }
      router.replace("/mascotas");
    }
    if (!isAuthenticated) {
      wasAuthenticated.current = false;
    }
  }, [isAuthenticated, router, modoEmergencia, vistaEmergencia]);

  // Forzar cambio de clave cuando el usuario autenticado tiene clave
  // temporal (registro rápido de emergencia). Se deriva durante el render
  // (no en un effect) para evitar renders en cascada.
  const forzarCambioClave =
    isAuthenticated &&
    passwordTemporal &&
    modoEmergencia &&
    vistaEmergencia === "emergencia";

  // Logout explícito: vuelve a la landing (de emergencia o de marketing
  // según el modo) — no a login/register ni al dashboard. Limpia el estado
  // del BC Mascotas (singletons) y fuerza el remount de la landing para que
  // arranque en "reportar" con el formulario vacío.
  const handleLogout = async () => {
    setAuthView("landing");
    setVistaEmergencia("emergencia");
    ultimoRegistroRapido.clear();
    ultimaVistaEmergencia.set("reportar");
    setLandingKey((k) => k + 1);
    await logout();
  };

  const handleNavigate = (route: string) => {
    router.push(route as any);
    closeMenu();
  };

  // Al cambiar el modo con el toggle, navega a la primera opción de cada menú
  const handleModeChange = (mode: DrawerMode) => {
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
      router.replace("/mascotas" as any);
    } else {
      router.replace("/" as any);
    }
  };

  if (loading) {
    return (
      <SVGBackground>
        <View style={styles.loadingContainer}>
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
    if (authView === "cambiar-password") {
      return (
        <CambiarPasswordScreen onBackPress={() => setAuthView("landing")} />
      );
    }
    // Modo emergencia: la landing de mascotas reemplaza a la de marketing
    if (modoEmergencia) {
      return (
        <LandingEmergenciaMascotasScreen
          key={landingKey}
          onLoginPress={() => setAuthView("login")}
          onDashboardPress={() => {
            setVistaEmergencia("app-normal");
            router.replace("/mascotas" as any);
          }}
          onCambiarPasswordPress={() => setAuthView("cambiar-password")}
          onForzarCambioClave={() => setAuthView("cambiar-password")}
          onLogoutPress={handleLogout}
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

  // Autenticado en modo emergencia: si el usuario aún está en la vista
  // "emergencia" (auto-login del registro rápido), se queda en la landing
  // de emergencia en lugar de entrar al dashboard.
  if (modoEmergencia && vistaEmergencia === "emergencia") {
    // Flujo forzado (passwordTemporal): CambiarPasswordScreen a nivel de
    // root, sin flecha atrás — el usuario no puede evadir el cambio.
    if (forzarCambioClave) {
      return <CambiarPasswordScreen onSuccess={() => setAuthView("landing")} />;
    }
    if (authView === "cambiar-password") {
      // Flujo voluntario (sin passwordTemporal): con flecha atrás a landing.
      return (
        <CambiarPasswordScreen onBackPress={() => setAuthView("landing")} />
      );
    }
    return (
      <LandingEmergenciaMascotasScreen
        key={landingKey}
        onLoginPress={() => setAuthView("login")}
        onDashboardPress={() => {
          setVistaEmergencia("app-normal");
          router.replace("/mascotas" as any);
        }}
        onCambiarPasswordPress={() => setAuthView("cambiar-password")}
        onForzarCambioClave={() => setAuthView("cambiar-password")}
        onLogoutPress={handleLogout}
      />
    );
  }

  const handleOpenMenu = () => {
    // Sincroniza el toggle con la ruta activa al abrir el drawer
    if (pathname.startsWith("/mascotas")) {
      setMenuMode("desaparecidos");
    } else {
      setMenuMode("alertas");
    }
    openMenu();
  };

  return (
    <SVGBackground>
      {/* Header with hamburger menu toggle - badges conditionally visible outside based on screen size */}
      <Header
        isMobile={isSmallScreen}
        onMenuPress={handleOpenMenu}
        onBackPress={isSubRoute ? handleBack : undefined}
        onLogoutPress={handleLogout}
      />

      {/* Active Screen Area */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Hamburger Menu slide-out drawer */}
      <AppDrawer
        visible={menuVisible}
        slideAnim={slideAnim}
        fadeAnim={fadeAnim}
        isSmallScreen={isSmallScreen}
        user={user}
        barrio={barrio}
        ciudadNombre={ciudadNombre}
        menuMode={menuMode}
        styles={styles as unknown as Record<string, any>}
        theme={theme}
        onClose={closeMenu}
        onNavigate={handleNavigate}
        onModeChange={handleModeChange}
        onLogout={handleLogout}
        onAboutOpen={() => setAboutModalVisible(true)}
        onProximamenteOpen={() => setProximamenteVisible(true)}
        isRouteActive={isRouteActive}
      />

      <AboutDeveloperModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
      />

      {/* Modal "Próximamente" — módulo Alertas bloqueado */}
      <ProximamenteModal
        visible={proximamenteVisible}
        theme={theme}
        styles={styles as unknown as Record<string, any>}
        onClose={() => setProximamenteVisible(false)}
      />
    </SVGBackground>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
    proximamenteOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    proximamenteCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 24,
      maxWidth: 420,
      width: "100%",
    },
    proximamenteHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    proximamenteTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      flex: 1,
    },
    proximamenteClose: {
      padding: 6,
    },
    proximamenteBody: {
      alignItems: "center",
      gap: 12,
    },
    proximamenteText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },
  });

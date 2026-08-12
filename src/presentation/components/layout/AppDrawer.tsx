import { Animated, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Usuario } from "../../../domain/entities/usuario";
import { Barrio } from "../../../domain/entities/barrio";
import Icon from "../atomic/Icon";
import { IconRenderer } from "../atomic/IconRenderer";
import { AppTheme } from "../../theme/ThemeContext";

export type DrawerMode = "desaparecidos" | "alertas";

export interface AppDrawerProps {
  visible: boolean;
  slideAnim: Animated.Value;
  fadeAnim: Animated.Value;
  isSmallScreen: boolean;
  user: Usuario | null;
  barrio: Barrio | null;
  ciudadNombre: string | null;
  menuMode: DrawerMode;
  styles: Record<string, any>;
  theme: AppTheme;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onModeChange: (mode: DrawerMode) => void;
  onLogout: () => void;
  onAboutOpen: () => void;
  onProximamenteOpen: () => void;
  isRouteActive: (route: string) => boolean;
}

/**
 * Drawer lateral (hamburguesa) con navegación por módulos.
 * Extraído de _layout.tsx (SRP: el layout orquesta, el drawer se dibuja).
 */
export function AppDrawer({
  visible,
  slideAnim,
  fadeAnim,
  isSmallScreen,
  user,
  barrio,
  ciudadNombre,
  menuMode,
  styles,
  theme,
  onClose,
  onNavigate,
  onModeChange,
  onLogout,
  onAboutOpen,
  onProximamenteOpen,
  isRouteActive,
}: AppDrawerProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Dark translucent backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <IconRenderer name="X" size={20} color={theme.colors.textPrimary} />
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
                  <Text style={styles.drawerLocationTitle}>Ciudad / Barrio</Text>
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
              style={[styles.modeBtn, menuMode === "desaparecidos" && styles.modeBtnActive]}
              onPress={() => onModeChange("desaparecidos")}
            >
              <Icon
                name="PawPrint"
                size={14}
                color={menuMode === "desaparecidos" ? theme.colors.white : theme.colors.textMuted}
              />
              <Text
                style={[styles.modeBtnText, menuMode === "desaparecidos" && styles.modeBtnTextActive]}
              >
                Desaparecidos
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, menuMode === "alertas" && styles.modeBtnActive]}
              onPress={onProximamenteOpen}
            >
              <Icon
                name="Bell"
                size={14}
                color={menuMode === "alertas" ? theme.colors.white : theme.colors.textMuted}
              />
              <Text style={[styles.modeBtnText, menuMode === "alertas" && styles.modeBtnTextActive]}>
                Alertas
              </Text>
              <Icon
                name="Lock"
                size={10}
                color={menuMode === "alertas" ? theme.colors.white : theme.colors.textMuted}
              />
            </Pressable>
          </View>

          {menuMode === "desaparecidos" ? (
            <>
              {/* ── BC MASCOTAS ─────────────────────────── */}
              <Text style={styles.sectionLabel}>Mascotas</Text>

              <TouchableOpacity
                onPress={() => onNavigate("/mascotas")}
                style={[styles.navLink, isRouteActive("/mascotas") && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name="PawPrint"
                  size={16}
                  color={isRouteActive("/mascotas") ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive("/mascotas") && styles.navLinkTextActive]}>
                  Mascotas en Emergencia
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate("/mascotas/reportar")}
                style={[styles.navLink, isRouteActive("/mascotas/reportar") && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name="CirclePlus"
                  size={16}
                  color={isRouteActive("/mascotas/reportar") ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.navLinkText,
                    isRouteActive("/mascotas/reportar") && styles.navLinkTextActive,
                  ]}
                >
                  Reportar Mascota
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate("/mascotas/mis-reportes")}
                style={[styles.navLink, isRouteActive("/mascotas/mis-reportes") && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name="List"
                  size={16}
                  color={isRouteActive("/mascotas/mis-reportes") ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.navLinkText,
                    isRouteActive("/mascotas/mis-reportes") && styles.navLinkTextActive,
                  ]}
                >
                  Mis Reportes de Mascotas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate("/mascotas/historias")}
                style={[styles.navLink, isRouteActive("/mascotas/historias") && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name="HeartHandshake"
                  size={16}
                  color={isRouteActive("/mascotas/historias") ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.navLinkText,
                    isRouteActive("/mascotas/historias") && styles.navLinkTextActive,
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
                onPress={() => onNavigate("/")}
                style={[styles.navLink, isRouteActive("/") && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <IconRenderer
                  name="Activity"
                  size={16}
                  color={isRouteActive("/") ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive("/") && styles.navLinkTextActive]}>
                  Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate("/alertas-sector")}
                style={[styles.navLink, isRouteActive("/alertas-sector") && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name="Bell"
                  size={16}
                  color={isRouteActive("/alertas-sector") ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.navLinkText,
                    isRouteActive("/alertas-sector") && styles.navLinkTextActive,
                  ]}
                >
                  Alertas del Sector
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate("/reportar")}
                style={[styles.navLink, isRouteActive("/reportar") && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name="ClockAlert"
                  size={16}
                  color={isRouteActive("/reportar") ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive("/reportar") && styles.navLinkTextActive]}>
                  Reportar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onNavigate("/config")}
                style={[styles.navLink, isRouteActive("/config") && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name="Settings"
                  size={16}
                  color={isRouteActive("/config") ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive("/config") && styles.navLinkTextActive]}>
                  Configuración (Notificaciones)
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => {
              onClose();
              onLogout();
            }}
            style={styles.navLink}
            activeOpacity={0.7}
          >
            <Icon name="LogOut" size={16} color={theme.colors.red} />
            <Text style={[styles.navLinkText, { color: theme.colors.red }]}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onClose();
              onAboutOpen();
            }}
            style={styles.navLink}
            activeOpacity={0.7}
          >
            <Icon name="Info" size={16} color={theme.colors.textMuted} />
            <Text style={styles.navLinkText}>Sobre el desarrollador</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.drawerFooter}>
          <Text style={styles.footerText}>Barrio Alerta</Text>
          <Text style={styles.footerSubtext}>Hecho con ❤️ por desarrolladores colombianos</Text>
        </View>
      </Animated.View>
    </View>
  );
}

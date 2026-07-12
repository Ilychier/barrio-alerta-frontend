import { Slot, usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from '@/presentation/components/atomic/Icon';
import { IconRenderer } from '@/presentation/components/atomic/IconRenderer';
import { Header } from '@/presentation/components/layout/Header';
import { AuthProvider, useAuth } from '@/presentation/context/AuthContext';
import { LoginScreen } from '@/presentation/screens/LoginScreen';
import { RegisterScreen } from '@/presentation/screens/RegisterScreen';
import { AppTheme, ThemeProvider, useAppTheme } from '@/presentation/theme/ThemeContext';

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
  const { user, barrio, cuadrante, isAuthenticated, loading, logout } = useAuth();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const [showRegister, setShowRegister] = useState(false);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  
  // Use state instead of useRef to avoid ESLint rules about accessing ref during render
  const [slideAnim] = useState(() => new Animated.Value(-280));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  const openMenu = () => {
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

  const isRouteActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/index' || pathname === '';
    }
    return pathname.startsWith(route);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.green} />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return <RegisterScreen onLoginPress={() => setShowRegister(false)} />;
    }
    return <LoginScreen onRegisterPress={() => setShowRegister(true)} />;
  }

  return (
    <View style={styles.root}>
      {/* Header with hamburger menu toggle - badges conditionally visible outside based on screen size */}
      <Header
        barrioNombre={barrio?.nombre}
        cuadranteNombre={cuadrante?.nombre_unidad}
        usuarioNombre={user?.nombre}
        isMobile={isSmallScreen}
        onMenuPress={openMenu}
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
                <Icon name="ShieldAlert" size={24} style={{ marginTop: 2 }} color={theme.colors.textPrimary} />
                <Text style={styles.drawerLogoText}>Barrio Alerta</Text>
              </View>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton} activeOpacity={0.7}>
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
                {barrio?.nombre && cuadrante?.nombre_unidad && (
                  <View style={styles.drawerLocationBadge}>
                    <Icon name="MapPin" size={14} color={theme.colors.green} />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.drawerLocationTitle}>Barrio / CAI</Text>
                      <Text style={styles.drawerCuadranteText}>{barrio.nombre} / {cuadrante.nombre_unidad}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Navigation list */}
            <View style={styles.navLinks}>
              <Text style={styles.sectionLabel}>NAVEGACIÓN</Text>
              
              <TouchableOpacity
                onPress={() => handleNavigate('/')}
                style={[styles.navLink, isRouteActive('/') && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <IconRenderer
                  name="Activity"
                  size={16}
                  color={isRouteActive('/') ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive('/') && styles.navLinkTextActive]}>
                  Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/alertas-sector')}
                style={[styles.navLink, isRouteActive('/alertas-sector') && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name="Bell"
                  size={16}
                  color={isRouteActive('/alertas-sector') ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive('/alertas-sector') && styles.navLinkTextActive]}>
                  Alertas del Sector
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/reportar')}
                style={[styles.navLink, isRouteActive('/reportar') && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon name="ClockAlert" size={16} color={isRouteActive('/reportar') ? theme.colors.textPrimary : theme.colors.textMuted} />
                <Text style={[styles.navLinkText, isRouteActive('/reportar') && styles.navLinkTextActive]}>
                  Reportar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/config')}
                style={[styles.navLink, isRouteActive('/config') && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <Icon name="Settings" size={16} color={isRouteActive('/config') ? theme.colors.textPrimary : theme.colors.textMuted} />
                <Text style={[styles.navLinkText, isRouteActive('/config') && styles.navLinkTextActive]}>
                  Configuración (Notificaciones)
                </Text>
              </TouchableOpacity>

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
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: theme.colors.surfaceDark,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    padding: 20,
    justifyContent: 'space-between',
    zIndex: 1001,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  drawerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  drawerSection: {
    gap: 12,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 20,
  },
  drawerUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  drawerUserTitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  drawerUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  drawerLocationBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontWeight: '600',
  },
  drawerLocationText: {
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navLinkActive: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.surfaceBorder,
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  navLinkTextActive: {
    color: theme.colors.textPrimary,
  },
  drawerFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
    gap: 2,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  footerSubtext: {
    fontSize: 9,
    color: theme.colors.textMuted,
  },
});

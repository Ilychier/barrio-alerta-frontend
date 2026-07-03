import { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, Text, TouchableOpacity, Animated } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BAColors } from '@/presentation/constants/colors';
import { Header } from '@/presentation/components/layout/Header';
import { useDashboardController } from '@/application/controllers/useDashboardController';
import { CURRENT_USER_ID } from '@/presentation/constants/currentUser';
import { IconRenderer } from '@/presentation/components/atomic/IconRenderer';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const { usuario, barrio, cuadrante } = useDashboardController(CURRENT_USER_ID);

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

  const handleNavigate = (route: string) => {
    router.push(route);
    closeMenu();
  };

  const isRouteActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/index' || pathname === '';
    }
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.root}>
      {/* Header with hamburger menu toggle - badges conditionally visible outside based on screen size */}
      <Header
        barrioNombre={barrio?.nombre}
        cuadranteNombre={cuadrante?.nombre_unidad}
        usuarioNombre={usuario?.nombre}
        isMobile={isSmallScreen}
        onMenuPress={openMenu}
      />
      
      {/* Active Screen Area */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Hamburger Menu slide-out drawer */}
      {visible && (
        <View style={StyleSheet.absoluteFillObject}>
          {/* Dark translucent backdrop */}
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeMenu}>
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
                <IconRenderer name="Shield" size={18} color={BAColors.red} />
                <Text style={styles.drawerLogoText}>Barrio Alerta</Text>
              </View>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton} activeOpacity={0.7}>
                <IconRenderer name="X" size={20} color={BAColors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Conditionally include username and location badges ONLY on smaller screens */}
            {isSmallScreen && (
              <View style={styles.drawerSection}>
                {usuario?.nombre && (
                  <View style={styles.drawerUserBadge}>
                    <IconRenderer name="User" size={14} color={BAColors.green} />
                    <View>
                      <Text style={styles.drawerUserTitle}>Usuario Activo</Text>
                      <Text style={styles.drawerUserName}>{usuario.nombre}</Text>
                    </View>
                  </View>
                )}
                {barrio?.nombre && cuadrante?.nombre_unidad && (
                  <View style={styles.drawerLocationBadge}>
                    <IconRenderer name="MapPin" size={14} color={BAColors.green} />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.drawerLocationTitle}>Barrio / Cuadrante</Text>
                      <Text style={styles.drawerLocationText}>{barrio.nombre}</Text>
                      <Text style={styles.drawerCuadranteText}>Unidad: {cuadrante.nombre_unidad}</Text>
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
                  color={isRouteActive('/') ? BAColors.textPrimary : BAColors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive('/') && styles.navLinkTextActive]}>
                  Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/reportar')}
                style={[styles.navLink, isRouteActive('/reportar') && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <IconRenderer
                  name="ShieldAlert"
                  size={16}
                  color={isRouteActive('/reportar') ? BAColors.textPrimary : BAColors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive('/reportar') && styles.navLinkTextActive]}>
                  Reportar Incidencia
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/config')}
                style={[styles.navLink, isRouteActive('/config') && styles.navLinkActive]}
                activeOpacity={0.7}
              >
                <IconRenderer
                  name="Radio"
                  size={16}
                  color={isRouteActive('/config') ? BAColors.textPrimary : BAColors.textMuted}
                />
                <Text style={[styles.navLinkText, isRouteActive('/config') && styles.navLinkTextActive]}>
                  Ajustes Canal
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.drawerFooter}>
              <Text style={styles.footerText}>Resiliencia Comunitaria</Text>
              <Text style={styles.footerSubtext}>v1.0.0 — Red de Apoyo</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BAColors.bg,
  },
  content: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: BAColors.surfaceDark,
    borderRightWidth: 1,
    borderRightColor: BAColors.border,
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
    color: BAColors.textPrimary,
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: BAColors.surfaceLight,
    borderWidth: 1,
    borderColor: BAColors.surfaceBorder,
  },
  drawerSection: {
    gap: 12,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: BAColors.border,
    paddingBottom: 20,
  },
  drawerUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BAColors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BAColors.surfaceBorder,
  },
  drawerUserTitle: {
    fontSize: 9,
    color: BAColors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  drawerUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: BAColors.textSecondary,
  },
  drawerLocationBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: BAColors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BAColors.surfaceBorder,
  },
  locationTextContainer: {
    flex: 1,
    gap: 2,
  },
  drawerLocationTitle: {
    fontSize: 9,
    color: BAColors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  drawerLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: BAColors.textSecondary,
  },
  drawerCuadranteText: {
    fontSize: 11,
    color: BAColors.textTertiary,
  },
  navLinks: {
    flex: 1,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: BAColors.textMuted,
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
    backgroundColor: BAColors.surfaceLight,
    borderColor: BAColors.surfaceBorder,
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: BAColors.textMuted,
  },
  navLinkTextActive: {
    color: BAColors.textPrimary,
  },
  drawerFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BAColors.border,
    alignItems: 'center',
    gap: 2,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: BAColors.textTertiary,
  },
  footerSubtext: {
    fontSize: 9,
    color: BAColors.textMuted,
  },
});

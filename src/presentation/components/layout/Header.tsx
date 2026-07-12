import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppTheme, useAppTheme } from '../../theme/ThemeContext';
import { IconRenderer } from '../atomic/IconRenderer';

interface HeaderProps {
  barrioNombre?: string;
  cuadranteNombre?: string;
  usuarioNombre?: string;
  isMobile?: boolean;
  onMenuPress?: () => void;
}

export function Header({
  barrioNombre,
  cuadranteNombre,
  usuarioNombre,
  isMobile = false,
  onMenuPress,
}: HeaderProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <View style={styles.leftGroup}>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton} activeOpacity={0.7}>
            <IconRenderer name="Menu" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>Barrio Alerta</Text>
          <Text style={styles.subtitle}>Red de Apoyo Comunitario</Text>
        </View>
        {!isMobile && barrioNombre && cuadranteNombre && (
          <View style={styles.locationBadge}>
            <IconRenderer name="MapPin" size={12} color={theme.colors.green} />
            <Text style={styles.locationText}>
              {barrioNombre} — {cuadranteNombre}
            </Text>
          </View>
        )}
      </View>

      {!isMobile && usuarioNombre && (
        <View style={styles.userBadge}>
          <IconRenderer name="User" size={14} color={theme.colors.green} />
          <Text style={styles.userName}>{usuarioNombre}</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceDark,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 6,
    marginRight: 2,
    borderRadius: 8,
  },
  logoContainer: {
    backgroundColor: theme.colors.redBg,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.redBorder,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  locationText: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  userName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
});

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppTheme, useAppTheme } from '../../theme/ThemeContext';
import Icon from '../atomic/Icon';
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
  const { theme, themeType, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <View style={styles.leftGroup}>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton} activeOpacity={0.7}>
            <IconRenderer name="Menu" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.logoContainer}>
          <Icon name="ShieldAlert" size={24} style={{ marginTop: 2 }} color={theme.colors.textPrimary} />
        </View>
        <View>
          <Text style={styles.title}>Barrio Alerta</Text>
          <Text style={styles.subtitle}>Red de Apoyo</Text>
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

      <View style={styles.rightGroup}>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle} activeOpacity={0.7}>
          <Icon
            name={themeType === 'dark' ? 'Sun' : 'Moon'}
            size={21}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        {!isMobile && usuarioNombre && (
          <View style={styles.userBadge}>
            <IconRenderer name="User" size={14} color={theme.colors.green} />
            <Text style={styles.userName}>{usuarioNombre}</Text>
          </View>
        )}
      </View>
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
    padding: 8,
    borderRadius: 12,
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
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    padding: 6,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
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

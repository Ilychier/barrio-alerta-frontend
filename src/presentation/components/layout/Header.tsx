import { View, Text, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';
import { IconRenderer } from '../atomic/IconRenderer';

interface HeaderProps {
  barrioNombre?: string;
  cuadranteNombre?: string;
  usuarioNombre?: string;
}

export function Header({ barrioNombre, cuadranteNombre, usuarioNombre }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftGroup}>
        <View style={styles.logoContainer}>
          <IconRenderer name="Shield" size={20} color={BAColors.red} />
        </View>
        <View>
          <Text style={styles.title}>Barrio Alerta</Text>
          <Text style={styles.subtitle}>Red de Apoyo Técnico Digital</Text>
        </View>
        {barrioNombre && cuadranteNombre && (
          <View style={styles.locationBadge}>
            <IconRenderer name="MapPin" size={12} color={BAColors.green} />
            <Text style={styles.locationText}>
              {barrioNombre} — {cuadranteNombre}
            </Text>
          </View>
        )}
      </View>

      {usuarioNombre && (
        <View style={styles.userBadge}>
          <IconRenderer name="User" size={14} color={BAColors.green} />
          <Text style={styles.userName}>{usuarioNombre}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BAColors.border,
    backgroundColor: BAColors.surfaceDark,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    backgroundColor: BAColors.redBg,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BAColors.redBorder,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: BAColors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: BAColors.textMuted,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BAColors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BAColors.surfaceBorder,
  },
  locationText: {
    fontSize: 11,
    color: BAColors.textTertiary,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: BAColors.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BAColors.surfaceBorder,
  },
  userName: {
    fontSize: 12,
    fontWeight: '500',
    color: BAColors.textSecondary,
  },
});

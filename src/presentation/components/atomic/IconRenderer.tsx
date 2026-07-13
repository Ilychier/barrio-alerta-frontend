import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

const ICON_MAP: Record<string, string> = {
  ShieldAlertOutline: '🚨',
  EyeOutline: '👀',
  MedicalBag: '🚑',
  Fire: '🔥',
  WrenchOutline: '🔧',
  PawOutline: '🐾',

  // Iconos del sistema base
  AlertTriangle: '⚠',
  ShieldAlert: '🚨',
  Activity: '❤',
  Flame: '🔥',
  Shield: '🛡',
  MapPin: '📍',
  PhoneCall: '📞',
  User: '👤',
  Camera: '📷',
  Clock: '⏰',
  Radio: '📡',
  Check: '✓',
  X: '✕',
  Menu: '☰',
};

interface IconRendererProps {
  name: string;
  size?: number;
  color?: string;
}

export function IconRenderer({ name, size = 16, color }: IconRendererProps) {
  const { theme } = useAppTheme();
  const symbol = ICON_MAP[name] || '•';
  const iconColor = color || theme.colors.textTertiary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.symbol, { fontSize: size * 0.8, color: iconColor }]}>
        {symbol}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    textAlign: 'center',
  },
});

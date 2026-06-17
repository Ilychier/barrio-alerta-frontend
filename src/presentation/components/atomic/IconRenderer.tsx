import { View, Text, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';

const ICON_MAP: Record<string, string> = {
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
};

interface IconRendererProps {
  name: string;
  size?: number;
  color?: string;
}

export function IconRenderer({ name, size = 16, color }: IconRendererProps) {
  const symbol = ICON_MAP[name] || '•';
  const iconColor = color || BAColors.textTertiary;

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

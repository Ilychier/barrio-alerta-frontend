import { View, Text, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';

type BadgeColor = 'red' | 'green' | 'purple';

interface SectionBadgeProps {
  label: string;
  color: BadgeColor;
}

const COLOR_MAP: Record<BadgeColor, { text: string; bg: string; border: string }> = {
  red: { text: BAColors.red, bg: BAColors.redBg, border: BAColors.redBorder },
  green: { text: BAColors.green, bg: BAColors.greenBg, border: BAColors.greenBorder },
  purple: { text: BAColors.purple, bg: BAColors.purpleBg, border: BAColors.purpleBorder },
};

export function SectionBadge({ label, color }: SectionBadgeProps) {
  const palette = COLOR_MAP[color];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme, AppTheme } from '../../theme/ThemeContext';

type BadgeColor = 'red' | 'green' | 'purple';

interface SectionBadgeProps {
  label: string;
  color: BadgeColor;
}

export function SectionBadge({ label, color }: SectionBadgeProps) {
  const { theme } = useAppTheme();
  
  const getColorMap = (t: AppTheme) => ({
    red: { text: t.colors.red, bg: t.colors.redBg, border: t.colors.redBorder },
    green: { text: t.colors.green, bg: t.colors.greenBg, border: t.colors.greenBorder },
    purple: { text: t.colors.purple, bg: t.colors.purpleBg, border: t.colors.purpleBorder },
  });

  const palette = getColorMap(theme)[color];

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

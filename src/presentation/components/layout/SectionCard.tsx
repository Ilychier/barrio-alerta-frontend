import { StyleSheet, View, type ViewProps } from 'react-native';
import { AppTheme, useAppTheme } from '../../theme/ThemeContext';

interface SectionCardProps extends ViewProps {
  children: React.ReactNode;
}

export function SectionCard({ children, style, ...props }: SectionCardProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: theme.colors.bg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 5,
  },
});

import { View, type ViewProps, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';

interface SectionCardProps extends ViewProps {
  children: React.ReactNode;
}

export function SectionCard({ children, style, ...props }: SectionCardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BAColors.surface,
    borderWidth: 1,
    borderColor: BAColors.border,
    borderRadius: 24,
    padding: 24,
    shadowColor: BAColors.bg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 5,
  },
});

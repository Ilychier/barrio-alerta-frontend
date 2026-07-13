import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as icons from 'lucide-react-native/icons';
import { useAppTheme, AppTheme } from '../../theme/ThemeContext';
import Icon from './Icon';

interface CategoryButtonProps {
  iconName: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function CategoryButton({ iconName, label, selected, onPress }: CategoryButtonProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  // Validate that the icon exists in lucide-react-native, fallback to 'House' if not found
  const resolvedIconName = (iconName in icons) ? (iconName as keyof typeof icons) : 'House';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.button, selected ? styles.selected : styles.unselected]}
    >
      <Icon
        name={resolvedIconName}
        color={selected ? theme.colors.green : theme.colors.textMuted}
        size={24}
      />
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexGrow: 1, 
    minWidth: 100,
  },
  selected: {
    backgroundColor: theme.colors.greenBg,
    borderColor: theme.colors.green,
  },
  unselected: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelSelected: {
    color: theme.colors.green,
  },
  labelUnselected: {
    color: theme.colors.textMuted,
  },
});

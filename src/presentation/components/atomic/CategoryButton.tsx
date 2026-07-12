import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as icons from 'lucide-react-native/icons';
import { BAColors } from '../../constants/colors';
import Icon from './Icon';

interface CategoryButtonProps {
  iconName: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function CategoryButton({ iconName, label, selected, onPress }: CategoryButtonProps) {
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
        color={selected ? BAColors.green : BAColors.textMuted}
        size={24}
      />
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: BAColors.greenBg,
    borderColor: BAColors.green,
  },
  unselected: {
    backgroundColor: BAColors.surfaceLight,
    borderColor: BAColors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelSelected: {
    color: BAColors.green,
  },
  labelUnselected: {
    color: BAColors.textMuted,
  },
});

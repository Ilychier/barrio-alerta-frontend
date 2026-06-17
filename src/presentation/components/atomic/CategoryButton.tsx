import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';
import { IconRenderer } from './IconRenderer';

interface CategoryButtonProps {
  iconName: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function CategoryButton({ iconName, label, selected, onPress }: CategoryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.button, selected ? styles.selected : styles.unselected]}
    >
      <IconRenderer
        name={iconName}
        size={24}
        color={selected ? BAColors.green : BAColors.textMuted}
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

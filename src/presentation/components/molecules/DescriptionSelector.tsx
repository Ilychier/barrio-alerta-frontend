import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';

interface DescriptionSelectorProps {
  descriptions: string[];
  selected: string;
  onSelect: (desc: string) => void;
}

export function DescriptionSelector({ descriptions, selected, onSelect }: DescriptionSelectorProps) {
  return (
    <View>
      <Text style={styles.label}>Descripción del Suceso (Opciones Estructuradas)</Text>
      <View style={styles.list}>
        {descriptions.map((desc, idx) => {
          const isSelected = selected === desc;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelect(desc)}
              activeOpacity={0.7}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: BAColors.textTertiary,
    marginBottom: 8,
  },
  list: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  optionSelected: {
    backgroundColor: BAColors.bg,
    borderColor: 'rgba(0, 230, 118, 0.4)',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: BAColors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioSelected: {
    borderColor: BAColors.green,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BAColors.green,
  },
  optionText: {
    flex: 1,
    fontSize: 12,
    color: BAColors.textTertiary,
  },
  optionTextSelected: {
    color: BAColors.textSecondary,
  },
});

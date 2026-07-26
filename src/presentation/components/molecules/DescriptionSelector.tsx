import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme, AppTheme } from '../../theme/ThemeContext';

interface DescriptionSelectorProps {
  descriptions: string[];
  selected: string;
  onSelect: (desc: string) => void;
}

export function DescriptionSelector({ descriptions, selected, onSelect }: DescriptionSelectorProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View>
      <Text style={styles.label}>Tipo de Suceso</Text>
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

const getStyles = (theme: AppTheme) => StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textTertiary,
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
    backgroundColor: theme.colors.surface, 
  },
  optionSelected: {
    backgroundColor: theme.colors.greenBg,    
    borderColor: theme.colors.greenBorder,    
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioSelected: {
    borderColor: theme.colors.green,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.green,
  },
  optionText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  optionTextSelected: {
    color: theme.colors.textSecondary,
  },
});

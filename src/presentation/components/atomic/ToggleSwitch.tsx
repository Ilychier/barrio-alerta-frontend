import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';

interface ToggleSwitchProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  label: string;
  description: string;
}

export function ToggleSwitch({ value, onToggle, label, description }: ToggleSwitchProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Pressable
        onPress={() => onToggle(!value)}
        style={[styles.track, value ? styles.trackActive : styles.trackInactive]}
      >
        <View style={[styles.thumb, value ? styles.thumbActive : styles.thumbInactive]} />
      </Pressable>
    </View>
  );
}

const SWITCH_WIDTH = 40;
const SWITCH_HEIGHT = 22;
const THUMB_SIZE = 18;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BAColors.surfaceLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BAColors.border,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: BAColors.textPrimary,
  },
  description: {
    fontSize: 11,
    color: BAColors.textMuted,
    marginTop: 2,
  },
  track: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    padding: 2,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: BAColors.green,
  },
  trackInactive: {
    backgroundColor: BAColors.surfaceBorder,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: BAColors.bg,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
});

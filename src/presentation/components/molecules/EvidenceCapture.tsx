import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme, AppTheme } from '../../theme/ThemeContext';
import { IconRenderer } from '../atomic/IconRenderer';

interface EvidenceCaptureProps {
  attached: boolean;
  photoUrl: string;
  onCapture: () => void;
  onRemove: () => void;
}

export function EvidenceCapture({ attached, photoUrl, onCapture, onRemove }: EvidenceCaptureProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View>
      <Text style={styles.label}>Evidencia Multimedia</Text>

      {!attached ? (
        <TouchableOpacity onPress={onCapture} activeOpacity={0.7} style={styles.placeholder}>
          <IconRenderer name="Camera" size={24} color={theme.colors.green} />
          <Text style={styles.placeholderText}>Capturar fotografía de la evidencia</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUrl }} style={styles.previewImage} />
          <View style={styles.checkBadge}>
            <IconRenderer name="Check" size={14} color={theme.colors.green} />
            <Text style={styles.checkText}>Foto Vinculada</Text>
          </View>
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <IconRenderer name="X" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
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
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceDark,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },
  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: theme.colors.greenBorder, 
    borderWidth: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.green,
  },
  removeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.colors.red,
    padding: 8,
    borderRadius: 100,
  },
});

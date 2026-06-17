import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { BAColors } from '../../constants/colors';
import { IconRenderer } from '../atomic/IconRenderer';

interface EvidenceCaptureProps {
  attached: boolean;
  photoUrl: string;
  onCapture: () => void;
  onRemove: () => void;
}

export function EvidenceCapture({ attached, photoUrl, onCapture, onRemove }: EvidenceCaptureProps) {
  return (
    <View>
      <Text style={styles.label}>Evidencia Multimedia (Obligatorio)</Text>

      {!attached ? (
        <TouchableOpacity onPress={onCapture} activeOpacity={0.7} style={styles.placeholder}>
          <IconRenderer name="Camera" size={24} color={BAColors.green} />
          <Text style={styles.placeholderText}>Capturar fotografía de la evidencia</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUrl }} style={styles.previewImage} />
          <View style={styles.checkBadge}>
            <IconRenderer name="Check" size={14} color={BAColors.green} />
            <Text style={styles.checkText}>Foto Vinculada</Text>
          </View>
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <IconRenderer name="X" size={16} color={BAColors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
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
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: BAColors.border,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '600',
    color: BAColors.textTertiary,
  },
  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
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
    borderColor: BAColors.border,
  },
  checkText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: BAColors.green,
  },
  removeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: BAColors.red,
    padding: 8,
    borderRadius: 100,
  },
});

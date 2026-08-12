import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { AppTheme } from "../../theme/ThemeContext";
import Icon from "../atomic/Icon";

interface ProximamenteModalProps {
  visible: boolean;
  theme: AppTheme;
  styles: Record<string, any>;
  onClose: () => void;
}

/**
 * Modal "Próximamente" del módulo Alertas (bloqueado en el drawer).
 * Extraído de _layout.tsx (SRP).
 */
export function ProximamenteModal({ visible, theme, styles, onClose }: ProximamenteModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.proximamenteOverlay} onPress={onClose}>
        <View style={styles.proximamenteCard} onStartShouldSetResponder={() => true}>
          <View style={styles.proximamenteHeader}>
            <Text style={styles.proximamenteTitle}>Próximamente</Text>
            <TouchableOpacity onPress={onClose} style={styles.proximamenteClose} activeOpacity={0.7}>
              <Icon name="X" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.proximamenteBody}>
            <Icon name="Bell" size={32} color={theme.colors.green} />
            <Text style={styles.proximamenteText}>
              El módulo de Alertas del Sector estará disponible pronto.
            </Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";
import Icon from "../atomic/Icon";

interface AboutDeveloperModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Desarrollador {
  nombre: string;
  linkedin: string;
  /** Texto mostrado tras "Contacto:". Si es email, se abre con mailto. */
  contacto: string;
  esEmail: boolean;
}

const DESARROLLADORES: Desarrollador[] = [
  {
    nombre: "Ariel David Herrera Ahumada",
    linkedin: "https://www.linkedin.com/in/ariel-david-herrera-ahumada-/",
    contacto: "arieldavidherreraahumada@gmail.com",
    esEmail: true,
  },
  {
    nombre: "Julián Camilo Herrera Ahumada",
    linkedin:
      "https://www.linkedin.com/in/juli%C3%A1n-camilo-herrera-ahumada-496586314/",
    contacto: "juliancamilohah@gmail.com",
    esEmail: false,
  },
];

/**
 * Modal "Sobre el desarrollador" — muestra los datos de contacto de los
 * creadores de Barrio Alerta. Reutilizable desde cualquier menú.
 */
export function AboutDeveloperModal({
  visible,
  onClose,
}: AboutDeveloperModalProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const abrirUrl = (url: string) => {
    Linking.openURL(url).catch((e) => {
      console.warn("[AboutDeveloperModal] No se pudo abrir el enlace:", e);
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Sobre el desarrollador</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Icon name="X" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.heartRow}>
              <Icon name="Heart" size={16} color={theme.colors.red} />
              <Text style={styles.heartText}>Hecho con el corazón por:</Text>
            </View>

            {DESARROLLADORES.map((d) => (
              <View key={d.nombre} style={styles.devCard}>
                <Text style={styles.devName}>{d.nombre}</Text>

                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() => abrirUrl(d.linkedin)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="ExternalLink"
                    size={14}
                    color={theme.colors.green}
                  />
                  <Text style={styles.linkText}>{d.linkedin}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() =>
                    abrirUrl(d.esEmail ? `mailto:${d.contacto}` : d.linkedin)
                  }
                  activeOpacity={0.7}
                >
                  <Icon
                    name={d.esEmail ? "Mail" : "ExternalLink"}
                    size={14}
                    color={theme.colors.green}
                  />
                  <Text style={styles.linkText}>Contacto: {d.contacto}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 24,
      maxWidth: 420,
      width: "100%",
      maxHeight: "85%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      flex: 1,
    },
    closeButton: {
      padding: 6,
    },
    content: {
      gap: 12,
    },
    heartRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    heartText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textSecondary,
    },
    devCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.surfaceBorder,
      padding: 16,
      gap: 10,
    },
    devName: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    linkText: {
      fontSize: 12,
      color: theme.colors.green,
      fontWeight: "600",
      flexShrink: 1,
    },
  });

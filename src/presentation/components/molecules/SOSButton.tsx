import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SOSStep } from "../../../application/controllers/useSOSController";
import { AppTheme, useAppTheme } from "../../theme/ThemeContext";
import Icon from "../atomic/Icon";

interface SOSButtonProps {
  step: SOSStep;
  countdown: number;
  onStart: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDismiss: () => void;
}

export function SOSButton({
  step,
  countdown,
  onStart,
  onConfirm,
  onCancel,
  onDismiss,
}: SOSButtonProps) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {step === 0 && (
        <TouchableOpacity
          onPress={onStart}
          activeOpacity={0.8}
          style={styles.sosButton}
        >
          <View style={styles.sosRing} />
          <Icon
            name="ShieldAlert"
            size={72}
            color={theme.colors.bg}
            style={{ marginTop: 0 }}
          />
          <Text style={styles.sosHint}>Tocar para Mandar una Alerta</Text>
        </TouchableOpacity>
      )}

      {step === 1 && (
        <View style={styles.confirmCard}>
          <View style={styles.confirmHeader}>
            <Text style={styles.confirmTitle}>
              Confirmación S.O.S Requerida
            </Text>
          </View>
          <Text style={styles.countdown}>{countdown}</Text>
          <Text style={styles.confirmDesc}>
            Se enviará una alerta de auxilio en {countdown} segundos si no
            cancelas de inmediato.
          </Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Despachar S.O.S</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.activeCard}>
          <View style={styles.activeIconContainer}>
            <Icon name="ShieldAlert" size={24} color={theme.colors.bg} />
          </View>
          <Text style={styles.activeTitle}>Señal SOS Emitida</Text>
          <Text style={styles.activeDesc}>
            El CAI del sector ha recibido tu geolocalización. Despachando
            patrulla.
          </Text>
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>Terminar Alerta S.O.S</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const SOS_SIZE = 180;

const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: SOS_SIZE + 40,
    },

    // --- Estado Idle (step 0) ---
    sosButton: {
      width: SOS_SIZE,
      height: SOS_SIZE,
      borderRadius: SOS_SIZE / 2,
      backgroundColor: theme.colors.red,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.red,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 50,
      elevation: 10,
    },
    sosRing: {
      position: "absolute",
      inset: 0,
      borderRadius: SOS_SIZE / 2,
      borderWidth: 1,
      borderColor: "rgba(255, 68, 68, 0.3)",
    },
    sosText: {
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: 4,
      color: theme.colors.textPrimary,
      marginTop: 4,
    },
    sosHint: {
      fontSize: 9,
      fontWeight: "700",
      width: 80,
      textAlign: "center",
      letterSpacing: 1,
      color: theme.colors.bg,
      textTransform: "uppercase",
      marginTop: 6,
    },

    // --- Estado Confirmación (step 1) ---
    confirmCard: {
      width: "100%",
      maxWidth: 320,
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1,
      borderColor: "rgba(255, 51, 51, 0.3)",
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
    },
    confirmHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    pulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.red,
    },
    confirmTitle: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
      color: theme.colors.red,
      textTransform: "uppercase",
    },
    countdown: {
      fontSize: 48,
      fontWeight: "900",
      color: theme.colors.textPrimary,
      marginVertical: 12,
    },
    confirmDesc: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      textAlign: "center",
      marginBottom: 16,
    },
    confirmActions: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    confirmButton: {
      flex: 1,
      backgroundColor: theme.colors.red,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    confirmButtonText: {
      color: theme.colors.surfaceLight,
      fontWeight: "700",
      fontSize: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.surfaceBorder,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
    },
    cancelButtonText: {
      color: theme.colors.textTertiary,
      fontWeight: "700",
      fontSize: 12,
    },

    // --- Estado Activo (step 2) ---
    activeCard: {
      width: "100%",
      backgroundColor: theme.colors.redBg,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
    },
    activeIconContainer: {
      backgroundColor: theme.colors.red,
      padding: 12,
      borderRadius: 100,
      marginBottom: 12,
    },
    activeTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    activeDesc: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 4,
    },
    dismissButton: {
      marginTop: 16,
      backgroundColor: theme.colors.textPrimary,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    dismissButtonText: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.colors.bg,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
  });

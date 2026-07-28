import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useConfiguracionController } from '../../application/controllers/useConfiguracionController';
import { useDashboardController } from '../../application/controllers/useDashboardController';
import { IconRenderer } from '../components/atomic/IconRenderer';
import { ToggleSwitch } from '../components/atomic/ToggleSwitch';
import { SectionCard } from '../components/layout/SectionCard';
import { useAppTheme, AppTheme } from '../theme/ThemeContext';

export function ConfigScreen() {
  const { config, handleUpdate, feedback, clearFeedback } = useConfiguracionController();
  const { barrio, cuadrante } = useDashboardController();
  const { theme, themeType, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (feedback) {
      Animated.sequence([
        Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(feedbackOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => clearFeedback());
    }
  }, [feedback, feedbackOpacity, clearFeedback]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <Text style={styles.title}>Ajustes</Text>

        <View style={styles.togglesSection}>
          <ToggleSwitch
            value={config?.recibir_notificaciones ?? true}
            onToggle={(val) => handleUpdate('recibir_notificaciones', val)}
            label="Recibir Notificaciones"
            description="Recibir notificaciones de todas las alertas."
          />

          <ToggleSwitch
            value={config?.modo_silencioso ?? false}
            onToggle={(val) => handleUpdate('modo_silencioso', val)}
            label="Modo Silencioso"
            description="Solo recibir notificaciones de emergencias (Botón SOS)."
          />

          <ToggleSwitch
            value={themeType === 'light'}
            onToggle={toggleTheme}
            label="Modo Claro"
            description="Activar el tema visual claro de la interfaz."
          />
        </View>

        {/* Información del Cuadrante */}
        <View style={styles.cuadranteCard}>
          <Text style={styles.cuadranteTitle}>
            <IconRenderer name="Shield" size={14} color={theme.colors.red} />
            {'  '}CAI y Barrio Asignado
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CAI</Text>
            <Text style={styles.infoValue}>{cuadrante?.nombre_unidad}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Línea Directa del Cai:</Text>
            <Text style={styles.infoValueGreen}>{cuadrante?.telefono_emergencia}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Barrio:</Text>
            <Text style={styles.infoValue}>
              {barrio?.nombre}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Toast de feedback */}
      {feedback && (
        <Animated.View
          style={[
            styles.toast,
            feedback.type === 'success' ? styles.toastSuccess : styles.toastError,
            { opacity: feedbackOpacity },
          ]}
        >
          <IconRenderer
            name={feedback.type === 'success' ? 'Check' : 'AlertTriangle'}
            size={16}
            color={theme.colors.white}
          />
          <Text style={styles.toastText}>{feedback.message}</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  description: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  togglesSection: {
    marginTop: 24,
    gap: 16,
  },

  // Cuadrante info
  cuadranteCard: {
    marginTop: 24,
    backgroundColor: theme.colors.surfaceLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cuadranteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.5)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  infoValueGreen: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.green,
  },

  // Toast
  toast: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastSuccess: {
    backgroundColor: theme.colors.green,
  },
  toastError: {
    backgroundColor: theme.colors.red,
  },
  toastText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});

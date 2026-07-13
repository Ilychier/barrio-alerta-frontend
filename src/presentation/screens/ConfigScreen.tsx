import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useConfiguracionController } from '../../application/controllers/useConfiguracionController';
import { useDashboardController } from '../../application/controllers/useDashboardController';
import { IconRenderer } from '../components/atomic/IconRenderer';
import { ToggleSwitch } from '../components/atomic/ToggleSwitch';
import { SectionCard } from '../components/layout/SectionCard';
import { useAuth } from '../context/AuthContext';
import { useAppTheme, AppTheme } from '../theme/ThemeContext';

export function ConfigScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const { config, handleUpdate } = useConfiguracionController(userId);
  const { barrio, cuadrante } = useDashboardController(userId);
  const { theme, themeType, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

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

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmButtonText}>Confirmar Preferencias</Text>
        </TouchableOpacity>
      </SectionCard>
    </ScrollView>
  );
}

const getStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
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

  confirmButton: {
    marginTop: 24,
    backgroundColor: theme.colors.border,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontWeight: '700',
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
});

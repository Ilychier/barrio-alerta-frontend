import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useConfiguracionController } from '../../application/controllers/useConfiguracionController';
import { useDashboardController } from '../../application/controllers/useDashboardController';
import { IconRenderer } from '../components/atomic/IconRenderer';
import { SectionBadge } from '../components/atomic/SectionBadge';
import { ToggleSwitch } from '../components/atomic/ToggleSwitch';
import { SectionCard } from '../components/layout/SectionCard';
import { BAColors } from '../constants/colors';
import { CURRENT_USER_ID } from '../constants/currentUser';

export function ConfigScreen() {
  const router = useRouter();
  const { config, handleUpdate } = useConfiguracionController(CURRENT_USER_ID);
  const { barrio, cuadrante } = useDashboardController(CURRENT_USER_ID);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard>
        <SectionBadge label="Personalización" color="purple" />
        <Text style={styles.title}>Ajustes</Text>

        <View style={styles.togglesSection}>
          <ToggleSwitch
            value={config?.recibir_notificaciones ?? true}
            onToggle={(val) => handleUpdate('recibir_notificaciones', val)}
            label="Alertas Comunitarias de Vecinos"
            description="Recibir incidencias de baja y media criticidad."
          />

          <ToggleSwitch
            value={config?.modo_silencioso ?? false}
            onToggle={(val) => handleUpdate('modo_silencioso', val)}
            label="Filtro S.O.S (Modo Silencioso Nocturno)"
            description="Solo recibir notificaciones si un vecino presiona su Botón SOS."
          />
        </View>

        {/* Información del Cuadrante */}
        <View style={styles.cuadranteCard}>
          <Text style={styles.cuadranteTitle}>
            <IconRenderer name="Shield" size={14} color={BAColors.red} />
            {'  '}Cuadrante Asignado por Localidad
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unidad de Comando:</Text>
            <Text style={styles.infoValue}>{cuadrante?.nombre_unidad}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Línea Directa del Cuadrante:</Text>
            <Text style={styles.infoValueGreen}>{cuadrante?.telefono_emergencia}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Barrio de Cobertura:</Text>
            <Text style={styles.infoValue}>
              {barrio?.nombre} (Soacha, COL)
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BAColors.bg,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: BAColors.textPrimary,
    marginTop: 12,
  },
  description: {
    fontSize: 12,
    color: BAColors.textMuted,
    marginTop: 4,
  },
  togglesSection: {
    marginTop: 24,
    gap: 16,
  },

  // Cuadrante info
  cuadranteCard: {
    marginTop: 24,
    backgroundColor: BAColors.surfaceLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BAColors.border,
  },
  cuadranteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: BAColors.textPrimary,
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
    color: BAColors.textTertiary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: BAColors.textPrimary,
  },
  infoValueGreen: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: BAColors.green,
  },

  confirmButton: {
    marginTop: 24,
    backgroundColor: BAColors.border,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BAColors.surfaceBorder,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontWeight: '700',
    fontSize: 12,
    color: BAColors.textPrimary,
  },
});
